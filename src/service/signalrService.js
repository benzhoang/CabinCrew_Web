import * as signalR from "@microsoft/signalr";

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
    if (this.connection && this.isConnected) {
      console.log("SignalR already connected");
      return;
    }

    this.onNotificationReceived = onNotificationReceived;

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token, cannot connect to SignalR");
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_URL, {
        accessTokenFactory: () => token,
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
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
        console.error("SignalR connection error:", err);
        this.isConnected = false;
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