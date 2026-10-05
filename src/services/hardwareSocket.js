// src/services/hardwareSocket.js

let socket = null;
let reconnectTimer = null;
let manuallyClosed = false;

export function connectHardwareSocket(
  onHardwareEvent
) {
  manuallyClosed = false;

  function connect() {
    socket = new WebSocket(
      "ws://127.0.0.1:8000/ws/hardware"
    );

    socket.onopen = () => {
      console.log(
        "✅ Hardware connected"
      );
    };

    socket.onmessage = (event) => {
      try {
        const message =
          JSON.parse(event.data);

        console.log(
          "Hardware event:",
          message
        );

        onHardwareEvent(message);
      } catch (error) {
        console.error(
          "Invalid hardware message:",
          error
        );
      }
    };

    socket.onerror = (error) => {
      console.error(
        "Hardware WebSocket error:",
        error
      );
    };

    socket.onclose = () => {
      console.log(
        "Hardware connection closed"
      );

      if (!manuallyClosed) {
        reconnectTimer =
          setTimeout(
            connect,
            2000
          );
      }
    };
  }

  connect();

  return () => {
    manuallyClosed = true;

    clearTimeout(
      reconnectTimer
    );

    if (socket) {
      socket.close();
    }
  };
}