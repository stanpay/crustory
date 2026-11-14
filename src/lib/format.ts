export function formatPrice(amount: number) {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

export function parseImages(images: string): string[] {
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseOptions(options: string): { name: string; values: string[] }[] {
  try {
    const parsed = JSON.parse(options);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function generateOrderId() {
  const rand = Math.random().toString(36).slice(2, 10);
  return `CR${Date.now()}${rand}`.slice(0, 64);
}

export function generateCustomerKey() {
  const rand = crypto.randomUUID().replace(/-/g, "");
  return `guest_${rand}`.slice(0, 50);
}
