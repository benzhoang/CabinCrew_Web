import * as signalR from "@microsoft/signalr";

// URL hub BE, không phải URL CDN của thư viện
const SIGNALR_URL = "https://cabincrewcareer.azurewebsites.net/notificationHub";

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.onNotificationReceived = null;
  }

  startConnection = (onNotificationReceived) => {
    // Preserve the latest handler so components can update their own state
    this.onNotificationReceived = onNotificationReceived;

    // Reuse the existing connection if it's already up
    if (this.connection && this.isConnected) {
      console.log("SignalR already connected");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token, cannot connect to SignalR");
      return;
    }

    // Ưu tiên WebSockets + skipNegotiation để tránh lỗi "stopped during negotiation"
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_URL, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
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

    // Nhận thông báo real-time
    this.connection.on("ReceiveNotification", (notification) => {
      console.log("Received real-time notification:", notification);

      // Đảm bảo luôn có title & body để hiển thị đẹp
      const safeNotification = {
        ...notification,
        title: notification.title || "Thông báo mới",
        body: notification.body || notification.message || "Bạn có thông báo mới từ hệ thống",
        notificationId: notification.notificationId || Date.now(),
      };

      if (this.onNotificationReceived) {
        this.onNotificationReceived(safeNotification);
      }
    });

    // Các event khác giữ nguyên...
    this.connection.onreconnecting((error) => {
      console.log("SignalR reconnecting...", error);
      this.isConnected = false;
    });

    this.connection.onreconnected((connectionId) => {
      console.log("SignalR reconnected:", connectionId);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.connection.onclose((error) => {
      console.log("SignalR connection closed", error);
      this.isConnected = false;
    });

    this.connection
      .start()
      .then(() => {
        console.log("SignalR connected successfully");
        this.isConnected = true;
        this.reconnectAttempts = 0;
      })
      .catch((err) => {
        // Nếu lỗi negotiation → thử lại với LongPolling
        console.error("SignalR connection error:", err);
        this.isConnected = false;

        if (err?.message?.toLowerCase().includes("negotiation")) {
          console.log("Retrying SignalR with LongPolling fallback...");
          this.connection = new signalR.HubConnectionBuilder()
            .withUrl(SIGNALR_URL, {
              accessTokenFactory: () => token,
              skipNegotiation: false,
              transport: signalR.HttpTransportType.LongPolling,
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

          // rebind handler
          this.connection.on("ReceiveNotification", (notification) => {
            const safeNotification = {
              ...notification,
              title: notification.title || "Thông báo mới",
              body: notification.body || notification.message || "Bạn có thông báo mới từ hệ thống",
              notificationId: notification.notificationId || Date.now(),
            };
            if (this.onNotificationReceived) {
              this.onNotificationReceived(safeNotification);
            }
          });

          this.connection.start().then(() => {
            console.log("SignalR reconnected with LongPolling");
            this.isConnected = true;
            this.reconnectAttempts = 0;
          }).catch((fallbackErr) => {
            console.error("Fallback SignalR connection error:", fallbackErr);
          });
        }
      });
  };

  stopConnection = () => {
    if (this.connection) {
      this.connection.stop().catch((err) => console.error("Error stopping SignalR:", err));
    }
  };

  getConnectionState = () => {
    return this.connection?.state ?? signalR.HubConnectionState.Disconnected;
  };
}

const signalRService = new SignalRService();
export default signalRService;