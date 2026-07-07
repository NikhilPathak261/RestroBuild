import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getWebSocketUrl, subscribeToOrder } from './realtimeService';

let lastSocket;

class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.listeners = {};
    this.send = vi.fn();
    this.close = vi.fn();
    lastSocket = this;
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
    vi.stubGlobal('WebSocket', MockWebSocket);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('derives the websocket URL from the API base URL', () => {
    expect(getWebSocketUrl()).toBe('ws://localhost:8080/ws');
  });

  it('subscribes to an order topic and forwards parsed events', () => {
    const onMessage = vi.fn();
    const unsubscribe = subscribeToOrder(42, onMessage);

    expect(lastSocket.url).toBe('ws://localhost:8080/ws');

    lastSocket.emit('open');
    expect(lastSocket.send).toHaveBeenCalledWith('SUBSCRIBE /topic/orders/42');

    lastSocket.emit('message', { data: '{"eventType":"ORDER_READY","orderId":42}' });
    expect(onMessage).toHaveBeenCalledWith({ eventType: 'ORDER_READY', orderId: 42 });

    unsubscribe();
    expect(lastSocket.close).toHaveBeenCalled();
  });
});
