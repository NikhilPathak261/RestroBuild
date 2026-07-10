import { describe, expect, it, vi } from 'vitest';
import apiClient from './apiClient';
import { getOrderTimeline, getTableBill } from './orderService';

vi.mock('./apiClient', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('orderService', () => {
  it('fetches the public order timeline', async () => {
    const timeline = [
      {
        status: 'READY',
        label: 'Ready',
        description: 'Your order is ready for service.',
        state: 'current',
        timestamp: '2026-07-10T10:15:00Z',
      },
    ];
    apiClient.get.mockResolvedValue({ data: timeline });

    await expect(getOrderTimeline(55)).resolves.toEqual(timeline);
    expect(apiClient.get).toHaveBeenCalledWith('/orders/55/timeline');
  });

  it('fetches the public table bill', async () => {
    const bill = {
      tableId: 4,
      tableNumber: 4,
      orderCount: 2,
      itemCount: 4,
      subtotal: 900,
      totalAmount: 900,
      items: [],
    };
    apiClient.get.mockResolvedValue({ data: bill });

    await expect(getTableBill(4)).resolves.toEqual(bill);
    expect(apiClient.get).toHaveBeenCalledWith('/orders/table/4/bill');
  });
});
