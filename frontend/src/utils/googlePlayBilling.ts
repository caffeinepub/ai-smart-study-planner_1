/**
 * Simulated Google Play Billing integration layer.
 *
 * This module provides a Promise-based API that mirrors the Google Play Billing
 * Library interface. In a real Android/TWA deployment, this would be replaced
 * with calls to the native Google Play Billing SDK via a JavaScript bridge.
 *
 * For the web SPA, purchases are simulated and persisted to localStorage under
 * the key 'studiora_purchases'.
 */

export type ProductId = 'studiora_monthly' | 'studiora_yearly';

export interface Purchase {
  purchaseToken: string;
  productId: ProductId;
  purchaseTime: number;
  acknowledged: boolean;
}

const PURCHASES_KEY = 'studiora_purchases';

function generatePurchaseToken(): string {
  return `gp_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

function getStoredPurchases(): Purchase[] {
  try {
    const raw = localStorage.getItem(PURCHASES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Purchase[];
  } catch {
    return [];
  }
}

function storePurchases(purchases: Purchase[]): void {
  try {
    localStorage.setItem(PURCHASES_KEY, JSON.stringify(purchases));
  } catch {
    // Storage unavailable — silently ignore
  }
}

/**
 * Initializes the billing client. In a real integration this would connect
 * to the Google Play Billing service. Here it resolves immediately.
 */
export async function initBillingClient(): Promise<void> {
  // Simulate async initialization
  await new Promise<void>((resolve) => setTimeout(resolve, 100));
}

/**
 * Launches the billing flow for the given product ID.
 * Simulates a purchase dialog — resolves with a purchase token on success,
 * rejects with 'Payment cancelled or failed.' on cancellation.
 *
 * In production this would open the Google Play purchase sheet.
 */
export async function launchBillingFlow(
  productId: ProductId
): Promise<{ purchaseToken: string; productId: ProductId }> {
  await new Promise<void>((resolve) => setTimeout(resolve, 800));

  // Simulate successful purchase (in production, this is handled by Google Play)
  const purchaseToken = generatePurchaseToken();
  const purchase: Purchase = {
    purchaseToken,
    productId,
    purchaseTime: Date.now(),
    acknowledged: false,
  };

  const existing = getStoredPurchases();
  // Replace any existing purchase for the same product
  const filtered = existing.filter((p) => p.productId !== productId);
  storePurchases([...filtered, purchase]);

  return { purchaseToken, productId };
}

/**
 * Acknowledges a purchase. In production this confirms receipt with Google Play.
 * Here it marks the purchase as acknowledged in localStorage.
 */
export async function acknowledgePurchase(purchaseToken: string): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 200));

  const purchases = getStoredPurchases();
  const updated = purchases.map((p) =>
    p.purchaseToken === purchaseToken ? { ...p, acknowledged: true } : p
  );
  storePurchases(updated);
}

/**
 * Queries existing purchases from localStorage.
 * In production this would query the Google Play Billing service for active
 * subscriptions associated with the user's Google account.
 */
export async function queryPurchases(): Promise<Purchase[]> {
  await new Promise<void>((resolve) => setTimeout(resolve, 150));
  return getStoredPurchases();
}

/**
 * Clears all stored purchases (used for cancellation / testing).
 */
export function clearPurchases(): void {
  try {
    localStorage.removeItem(PURCHASES_KEY);
  } catch {
    // ignore
  }
}
