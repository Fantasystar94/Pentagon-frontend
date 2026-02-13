type PendingPayment = {
  orderPk: number;
  createdAt: number;
};

const KEY_PREFIX = "pendingPayment:";

export function setPendingPayment(tossOrderId: string, orderPk: number) {
  const payload: PendingPayment = { orderPk, createdAt: Date.now() };
  sessionStorage.setItem(KEY_PREFIX + tossOrderId, JSON.stringify(payload));
}

export function getPendingPayment(tossOrderId: string): PendingPayment | null {
  const raw = sessionStorage.getItem(KEY_PREFIX + tossOrderId);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<PendingPayment>;
    if (typeof parsed.orderPk !== "number") return null;
    return {
      orderPk: parsed.orderPk,
      createdAt: typeof parsed.createdAt === "number" ? parsed.createdAt : 0,
    };
  } catch {
    return null;
  }
}

export function clearPendingPayment(tossOrderId: string) {
  sessionStorage.removeItem(KEY_PREFIX + tossOrderId);
}
