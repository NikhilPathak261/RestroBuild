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
  const reconnectDelays = [1000, 2000, 5000, 10000];
  let socket;
  let reconnectTimer;
  let stopped = false;
  let reconnectAttempts = 0;

  function connect() {
    window.clearTimeout(reconnectTimer);
    socket = new WebSocket(baseUrl);

    socket.addEventListener('open', () => {
      reconnectAttempts = 0;
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
      scheduleReconnect();
    });
  }

  function scheduleReconnect() {
    if (stopped || !navigator.onLine) {
      return;
    }

    const delay = reconnectDelays[Math.min(reconnectAttempts, reconnectDelays.length - 1)];
    reconnectAttempts += 1;
    reconnectTimer = window.setTimeout(connect, delay);
  }

  function reconnectWhenOnline() {
    if (!stopped) {
      connect();
    }
  }

  window.addEventListener('online', reconnectWhenOnline);
  connect();

  return () => {
    stopped = true;
    window.clearTimeout(reconnectTimer);
    window.removeEventListener('online', reconnectWhenOnline);
    socket?.close();
  };
}

export function getWebSocketUrl() {
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
