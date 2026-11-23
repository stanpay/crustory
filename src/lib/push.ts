import type { Order } from "@prisma/client";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "주문 접수",
  PAID: "주문 확인",
  SHIPPED: "배송 시작",
  CANCELLED: "주문 취소",
  REFUNDED: "환불 완료",
};

/**
 * Sends FCM push for order status changes.
 * No-op when Firebase credentials or devices are missing.
 */
export async function notifyOrderStatus(order: Order): Promise<void> {
  if (!order.userId) {
    // Guest orders have no linked customer devices.
    return;
  }

  const { sendPushToCustomer } = await import("./push-fcm");
  const title = "CRUSTORY 주문 안내";
  const body = `${STATUS_LABEL[order.status] ?? order.status} · ${order.orderId}`;
  await sendPushToCustomer(order.userId, { title, body, orderId: order.orderId });
}
