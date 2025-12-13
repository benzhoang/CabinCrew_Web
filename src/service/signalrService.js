import * as signalR from "@microsoft/signalr";

// URL hub BE, không phải URL CDN của thư viện
const SIGNALR_URL = "https://cabincrewcareer.azurewebsites.net/notificationHub";

// CDN Script tag cho SignalR (fallback nếu npm package không load được)
// <script src="https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/8.0.7/signalr.min.js"></script>

/**
 * Load SignalR script từ CDN nếu chưa có
 * @returns {Promise} Promise resolve khi script đã load xong
 */
const loadSignalRScript = () => {
  return new Promise((resolve, reject) => {
    // Kiểm tra xem SignalR đã có sẵn chưa (từ npm hoặc CDN)
    if (typeof window !== 'undefined' && window.signalR) {
      resolve(window.signalR);
      return;
    }

    // Kiểm tra xem script đã được thêm vào DOM chưa
    const existingScript = document.querySelector('script[src*="signalr"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        resolve(window.signalR);
      });
      existingScript.addEventListener('error', reject);
      return;
    }

    // Tạo và thêm script tag vào DOM
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/microsoft-signalr/8.0.7/signalr.min.js';
    script.async = true;
    script.onload = () => {
      console.log('SignalR script đã được load từ CDN');
      resolve(window.signalR);
    };
    script.onerror = () => {
      console.error('Không thể load SignalR script từ CDN');
      reject(new Error('Failed to load SignalR from CDN'));
    };
    document.head.appendChild(script);
  });
};

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.onNotificationReceived = null;
    this.onOrderStatusUpdated = null;
    this.currentOrderId = null;
    this.startPromise = null;
    this.stopRequested = false;
  }

  buildConnection = (token, transport, skipNegotiation = false) => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_URL, {
        accessTokenFactory: () => token,
        skipNegotiation,
        transport,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < this.maxReconnectAttempts) {
            return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
          }
          return null;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Handler cho notification từ server
    conn.on("ReceiveNotification", (notification) => {
      console.log("SignalR: Nhận được notification từ server:", notification);
      const safeNotification = {
        ...notification,
        title: notification.title || "Thông báo mới",
        body: notification.body || notification.message || "Bạn có thông báo mới từ hệ thống",
        notificationId: notification.notificationId || Date.now(),
      };

      console.log("SignalR: Gọi handler với notification:", safeNotification);
      if (this.onNotificationReceived) {
        try {
          this.onNotificationReceived(safeNotification);
          console.log("SignalR: Handler đã được gọi thành công");
        } catch (error) {
          console.error("SignalR: Lỗi khi gọi handler:", error);
        }
      } else {
        console.warn("SignalR: Không có handler để gọi!");
      }
    });

    // Handler cho OrderStatusUpdated từ server
    conn.on("OrderStatusUpdated", (order) => {
      console.log("SignalR: Nhận được OrderStatusUpdated:", order);
      if (this.currentOrderId && order.id === this.currentOrderId) {
        console.log("SignalR: Order khớp với currentOrderId, cập nhật order details");
        if (this.onOrderStatusUpdated) {
          try {
            this.onOrderStatusUpdated(order);
            console.log("SignalR: OrderStatusUpdated handler đã được gọi thành công");
          } catch (error) {
            console.error("SignalR: Lỗi khi gọi OrderStatusUpdated handler:", error);
          }
        } else {
          console.warn("SignalR: Không có OrderStatusUpdated handler để gọi!");
        }
      } else {
        console.log("SignalR: Order không khớp với currentOrderId hoặc chưa có currentOrderId");
      }
    });

    // Handler khi connection đang reconnect
    conn.onreconnecting((error) => {
      console.log("SignalR reconnecting...", error);
      this.isConnected = false;
    });

    // Handler khi reconnect thành công
    conn.onreconnected(async (connectionId) => {
      console.log("SignalR reconnected:", connectionId);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // ✅ Join lại vào group sau khi reconnect
      try {
        await this.joinUserGroups();
      } catch (err) {
        console.warn("SignalR: Không thể join group sau reconnect:", err);
      }
    });

    // Handler khi connection bị đóng
    conn.onclose((error) => {
      console.log("SignalR connection closed", error);
      this.isConnected = false;
    });

    // Có thể thêm các handlers khác nếu cần:
    // conn.on("MethodName", (data) => { ... });
    // conn.on("AnotherEvent", (data) => { ... });

    return conn;
  };

  startConnection = (onNotificationReceived) => {
    // Preserve the latest handler so components can update their own state
    // QUAN TRỌNG: Luôn cập nhật handler ngay cả khi connection đã tồn tại
    this.onNotificationReceived = onNotificationReceived;
    console.log("SignalR: Handler đã được cập nhật", !!onNotificationReceived);

    // Reuse the existing connection if it's already up
    if (this.connection && this.isConnected) {
      console.log("SignalR already connected, handler đã được cập nhật");
      // Trả về Promise resolved để đảm bảo consistency
      return Promise.resolve();
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token, cannot connect to SignalR");
      return Promise.reject(new Error("No token available"));
    }

    // Ưu tiên WebSockets, không skipNegotiation để thấy negotiate request trong Network tab
    this.connection = this.buildConnection(
      token,
      signalR.HttpTransportType.WebSockets,
      false
    );

    this.stopRequested = false;

    // Nếu đang có lời hứa start trước đó thì dùng lại để tránh song song
    if (!this.startPromise) {
      this.startPromise = this.connection
        .start()
        .then(async () => {
          if (this.stopRequested) {
            // Tránh lỗi "stop before start" bằng cách dừng sau khi start xong
            return this.connection.stop();
          }
          console.log("SignalR connected successfully");
          this.isConnected = true;
          this.reconnectAttempts = 0;

          // Delay để connection thực sự ready
          await new Promise(resolve => setTimeout(resolve, 500));

          // Join groups (backend OnConnectedAsync đã tự động join, nhưng có thể join thủ công để đảm bảo)
          try {
            await this.joinUserGroups();
          } catch (err) {
            console.warn("SignalR: Join groups optional, backend đã auto-join trong OnConnectedAsync:", err.message);
          }

          return null;
        })
        .catch((err) => {
          // Nếu lỗi negotiation → thử lại với LongPolling
          console.error("SignalR connection error:", err);
          this.isConnected = false;

          if (err?.message?.toLowerCase().includes("negotiation") ||
            err?.message?.toLowerCase().includes("websocket") ||
            err?.message?.toLowerCase().includes("failed to start")) {
            console.log("Retrying SignalR with LongPolling fallback...");
            this.connection = this.buildConnection(
              token,
              signalR.HttpTransportType.LongPolling,
              false
            );

            return this.connection.start().then(async () => {
              if (this.stopRequested) {
                // Join groups
                try {
                  await this.joinUserGroups();
                } catch (err) {
                  console.warn("SignalR: Join groups optional (LongPolling):", err.message);
                }
              }
              console.log("SignalR reconnected with LongPolling");
              this.isConnected = true;
              this.reconnectAttempts = 0;

              console.log("SignalR: Backend sẽ tự động route notification dựa trên JWT token");

              return null;
            }).catch((fallbackErr) => {
              console.error("Fallback SignalR connection error:", fallbackErr);
              this.isConnected = false;
              throw fallbackErr;
            });
          }
          throw err;
        })
        .finally(() => {
          this.startPromise = null;
          this.stopRequested = false;
        });
    }

    return this.startPromise;
  };

  stopConnection = async () => {
    if (!this.connection) {
      return;
    }

    this.stopRequested = true;

    try {
      // Nếu đang start → đợi xong rồi mới stop để tránh lỗi "before start"
      if (this.startPromise) {
        await this.startPromise.catch(() => { });
      }
      await this.connection.stop();
    } catch (err) {
      console.error("Error stopping SignalR:", err);
    } finally {
      this.isConnected = false;
      this.connection = null;
      this.startPromise = null;
      this.stopRequested = false;
    }
  };

  getConnectionState = () => {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  };

  // Set callback handler cho OrderStatusUpdated
  setOrderStatusUpdatedHandler = (handler, orderId = null) => {
    this.onOrderStatusUpdated = handler;
    this.currentOrderId = orderId;
    console.log("SignalR: OrderStatusUpdated handler đã được set", !!handler, "orderId:", orderId);
  };

  // Set currentOrderId để filter notifications
  setCurrentOrderId = (orderId) => {
    this.currentOrderId = orderId;
    console.log("SignalR: currentOrderId đã được set:", orderId);
  };

  // Join vào các group để nhận notification
  // Backend sử dụng OnConnectedAsync để tự động join, nhưng frontend cũng có thể join thủ công
  joinUserGroups = async () => {
    if (!this.connection) {
      console.warn("SignalR: Connection chưa được khởi tạo");
      return;
    }

    try {
      // Lấy thông tin user từ localStorage
      const employeeStr = localStorage.getItem("employee");
      const userStr = localStorage.getItem("user");

      let employee = null;
      try {
        employee = employeeStr ? JSON.parse(employeeStr) : (userStr ? JSON.parse(userStr) : null);
      } catch (err) {
        console.warn("SignalR: Không thể parse user data", err);
        return;
      }

      if (!employee) {
        console.warn("SignalR: Không tìm thấy thông tin user để join group");
        return;
      }

      console.log("SignalR: Thử join vào các groups (optional)...", {
        role: employee.role,
        userId: employee.userId || employee.id || employee.accountId
      });

      // Kiểm tra connection state trước khi invoke
      const connectionState = this.connection.state;
      console.log(`SignalR: Connection state = ${connectionState}`);

      if (connectionState !== signalR.HubConnectionState.Connected) {
        console.warn(`SignalR: Connection chưa Connected (state=${connectionState}), bỏ qua join groups`);
        return;
      }

      // Join vào role group (ví dụ: "Recruiters", "Examiners", "Admins")
      if (employee.role) {
        try {
          await this.connection.invoke("JoinRoleGroup", employee.role);
          console.log(`SignalR: ✅ Đã join vào role group: ${employee.role}`);
        } catch (err) {
          console.warn(`SignalR: Không thể join role group ${employee.role}:`, err.message);
          // Không throw - backend có thể không support method này
        }
      }

      // Join vào user group riêng (dựa trên userId)
      const userId = employee.userId || employee.id || employee.accountId;
      if (userId) {
        try {
          await this.connection.invoke("JoinUserGroup", userId.toString());
          console.log(`SignalR: ✅ Đã join vào user group: ${userId}`);
        } catch (err) {
          console.warn(`SignalR: Không thể join user group ${userId}:`, err.message);
        }
      }

      // Join vào group chung cho tất cả users (nếu backend có)
      try {
        await this.connection.invoke("JoinGroup", "AllUsers");
        console.log("SignalR: ✅ Đã join vào AllUsers group");
      } catch (err) {
        // Không log warning nếu method không tồn tại
        console.debug("SignalR: Backend không support AllUsers group:", err.message);
      }

    } catch (error) {
      console.error("SignalR: Lỗi khi join groups:", error);
      // Không throw - để connection vẫn hoạt động
    }
  };
}

const signalRService = new SignalRService();
export default signalRService;