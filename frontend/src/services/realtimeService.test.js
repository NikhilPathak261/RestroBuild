import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getWebSocketUrl, subscribeToOrder } from './realtimeService';

let lastSocket;
let sockets;
let unsubscribers;

class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.listeners = {};
    this.send = vi.fn();
    this.close = vi.fn();
    lastSocket = this;
    sockets.push(this);
  }

  addEventListener(eventName, listener) {
    this.listeners[eventName] = listener;
  }

  emit(eventName, event = {}) {
    this.listeners[eventName]?.(event);
  }
}

describe('realtimeService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sockets = [];
    unsubscribers = [];
    vi.stubGlobal('WebSocket', MockWebSocket);
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  });

  afterEach(() => {
    unsubscribers.forEach((unsubscribe) => unsubscribe());
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('derives the websocket URL from the API base URL', () => {
    expect(getWebSocketUrl()).toBe('ws://localhost:8080/ws');
  });

  it('subscribes to an order topic and forwards parsed events', () => {
    const onMessage = vi.fn();
    const unsubscribe = subscribeToOrder(42, onMessage);
    unsubscribers.push(unsubscribe);

    expect(lastSocket.url).toBe('ws://localhost:8080/ws');

    lastSocket.emit('open');
    expect(lastSocket.send).toHaveBeenCalledWith('SUBSCRIBE /topic/orders/42');

    lastSocket.emit('message', { data: '{"eventType":"ORDER_READY","orderId":42}' });
    expect(onMessage).toHaveBeenCalledWith({ eventType: 'ORDER_READY', orderId: 42 });

    unsubscribers.pop()();
    expect(lastSocket.close).toHaveBeenCalled();
  });

  it('reconnects with backoff after an unexpected close', () => {
    const onMessage = vi.fn();
    unsubscribers.push(subscribeToOrder(42, onMessage));
    const firstSocket = lastSocket;

    firstSocket.emit('close');
    expect(sockets).toHaveLength(1);

    vi.advanceTimersByTime(999);
    expect(sockets).toHaveLength(1);

    vi.advanceTimersByTime(1);
    expect(sockets).toHaveLength(2);
    lastSocket.emit('open');
    expect(lastSocket.send).toHaveBeenCalledWith('SUBSCRIBE /topic/orders/42');
  });

  it('waits for the browser to come back online before reconnecting', () => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
    unsubscribers.push(subscribeToOrder(42, vi.fn()));
    lastSocket.emit('close');

    vi.advanceTimersByTime(10000);
    expect(sockets).toHaveLength(1);

    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
    window.dispatchEvent(new Event('online'));

    expect(sockets).toHaveLength(2);
  });

  it('does not reconnect after unsubscribe', () => {
    const unsubscribe = subscribeToOrder(42, vi.fn());
    unsubscribe();
    lastSocket.emit('close');

    vi.advanceTimersByTime(10000);
    expect(sockets).toHaveLength(1);
  });
});
