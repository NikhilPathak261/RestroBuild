export function subscribeToOrder(orderId, onMessage) {
  return subscribe(`/topic/orders/${orderId}`, onMessage);
}

export function subscribeToKitchenOrders(onMessage) {
  return subscribe('/topic/kitchen/orders', onMessage);
}

export function subscribeToWaiterOrders(onMessage) {
  return subscribe('/topic/waiter/orders', onMessage);
}

export function subscribeToOwnerOrders(onMessage) {
  return subscribe('/topic/owner/orders', onMessage);
}

function subscribe(destination, onMessage) {
  const baseUrl = getWebSocketUrl();
  let socket;
  let reconnectTimer;
  let stopped = false;

  function connect() {
    socket = new WebSocket(baseUrl);

    socket.addEventListener('open', () => {
      socket.send(`SUBSCRIBE ${destination}`);
    });

    socket.addEventListener('message', (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch {
        // Ignore malformed real-time payloads and let REST remain the source of truth.
      }
    });

    socket.addEventListener('close', () => {
      if (!stopped) {
        reconnectTimer = window.setTimeout(connect, 5000);
      }
    });
  }

  connect();

  return () => {
    stopped = true;
    window.clearTimeout(reconnectTimer);
    socket?.close();
  };
}

function getWebSocketUrl() {
  if (import.meta.env.VITE_WS_BASE_URL) {
    return import.meta.env.VITE_WS_BASE_URL;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  const url = new URL(apiBaseUrl, window.location.origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/ws';
  url.search = '';
  url.hash = '';

  return url.toString();
}
