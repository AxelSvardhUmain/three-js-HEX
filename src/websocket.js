// websocket.js

let socket;
let updateVisualizationCallback;

function setupWebSocket(updateCallback) {
  updateVisualizationCallback = updateCallback;
  socket = new WebSocket("wss://husjakt.com/ws");

  socket.onopen = function (e) {
    console.log("[open] Connection established");
  };

  socket.onmessage = function (event) {
    console.log(`[message] Data received from server: ${event.data}`);
    // Parse the data and call the update callback
    const data = JSON.parse(event.data);
    updateVisualizationCallback(data);
  };

  socket.onclose = function (event) {
    if (event.wasClean) {
      console.log(
        `[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`
      );
    } else {
      console.log("[close] Connection died");
    }
  };

  socket.onerror = function (error) {
    console.log(`[error] ${error.message}`);
  };
}

export { setupWebSocket };
