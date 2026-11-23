// Admin product management
import type { AdminPoster } from '../types/admin';
import { POSTERS_DATA } from '../../data/posters';
import { logAdminAction, getCurrentAdmin } from './adminAuth';

const ADMIN_PRODUCTS_KEY = 'wf_admin_products';

function readProducts(): AdminPoster[] {
  try {
    const raw = localStorage.getItem(ADMIN_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeProducts(products: AdminPoster[]): void {
  localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(products));
}

/** Seed admin products from the static POSTERS_DATA on first load */
function seedIfEmpty(): AdminPoster[] {
  const existing = readProducts();
  if (existing.length > 0) return existing;

  const seeded: AdminPoster[] = POSTERS_DATA.map((p) => ({
    ...p,
    costPrices: { A3: 60, A4: 50, A5: 40 },
    enabledSizes: { A3: true, A4: true, A5: true },
    images: [p.image],
    collectionIds: [],
    isNewArrival: false,
    archived: false,
    hasOrders: false,
    seoTitle: p.name,
    seoDescription: p.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    priceHistory: [],
  }));

  writeProducts(seeded);
  return seeded;
}

export function getAllAdminProducts(): AdminPoster[] {
  return seedIfEmpty();
}

export function getProductById(id: string): AdminPoster | null {
  return getAllAdminProducts().find((p) => p.id === id) || null;
}

export function createProduct(
  data: Omit<AdminPoster, 'id' | 'createdAt' | 'updatedAt'>
): AdminPoster {
  const products = getAllAdminProducts();
  const admin = getCurrentAdmin();
  const id = `poster-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const newProduct: AdminPoster = { ...data, id, createdAt: now, updatedAt: now };
  writeProducts([...products, newProduct]);

  logAdminAction({
    adminId: admin?.id || 'admin',
    action: 'product_created',
    targetId: id,
    targetType: 'product',
    description: `Product "${data.name}" created.`,
  });

  return newProduct;
}

export function updateProduct(
  id: string,
  updates: Partial<AdminPoster>
): { success: boolean; error?: string } {
  const products = getAllAdminProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return { success: false, error: 'Product not found.' };

  const admin = getCurrentAdmin();
  const existing = products[idx];

  // Track price history if prices changed
  const priceHistory = existing.priceHistory || [];
  if (updates.prices && JSON.stringify(updates.prices) !== JSON.stringify(existing.prices)) {
    priceHistory.unshift({ prices: existing.prices, changedAt: new Date().toISOString() });
    logAdminAction({
      adminId: admin?.id || 'admin',
      action: 'price_changed',
      targetId: id,
      targetType: 'product',
      description: `Price changed for "${existing.name}": A3 ₹${existing.prices.A3}→₹${updates.prices.A3}, A4 ₹${existing.prices.A4}→₹${updates.prices.A4}, A5 ₹${existing.prices.A5}→₹${updates.prices.A5}.`,
    });
  }

  products[idx] = {
    ...existing,
    ...updates,
    priceHistory,
    updatedAt: new Date().toISOString(),
  };
  writeProducts(products);

  logAdminAction({
    adminId: admin?.id || 'admin',
    action: 'product_updated',
    targetId: id,
    targetType: 'product',
    description: `Product "${products[idx].name}" updated.`,
  });

  return { success: true };
}

export function archiveProduct(id: string): { success: boolean; error?: string } {
  const products = getAllAdminProducts();
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return { success: false, error: 'Product not found.' };
  const admin = getCurrentAdmin();

  products[idx] = { ...products[idx], archived: true, inStock: false, updatedAt: new Date().toISOString() };
  writeProducts(products);

  logAdminAction({
    adminId: admin?.id || 'admin',
    action: 'product_archived',
    targetId: id,
    targetType: 'product',
    description: `Product "${products[idx].name}" archived.`,
  });

  return { success: true };
}

export function deleteProduct(id: string): { success: boolean; error?: string } {
  const products = getAllAdminProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return { success: false, error: 'Product not found.' };
  if (product.hasOrders) {
    return { success: false, error: 'Cannot delete a product that has orders. Archive it instead.' };
  }
  const admin = getCurrentAdmin();
  writeProducts(products.filter((p) => p.id !== id));

  logAdminAction({
    adminId: admin?.id || 'admin',
    action: 'product_deleted',
    targetId: id,
    targetType: 'product',
    description: `Product "${product.name}" permanently deleted.`,
  });

  return { success: true };
}

export function duplicateProduct(id: string): { success: boolean; product?: AdminPoster; error?: string } {
  const original = getProductById(id);
  if (!original) return { success: false, error: 'Product not found.' };

  const copy: Omit<AdminPoster, 'id' | 'createdAt' | 'updatedAt'> = {
    ...original,
    name: `${original.name} (Copy)`,
    featured: false,
    isNewArrival: false,
    archived: false,
    hasOrders: false,
    priceHistory: [],
  };

  const newProduct = createProduct(copy);
  return { success: true, product: newProduct };
}

/** Mark product as having orders (prevents hard delete) */
export function markProductHasOrders(productId: string): void {
  const products = getAllAdminProducts();
  const idx = products.findIndex((p) => p.id === productId);
  if (idx !== -1 && !products[idx].hasOrders) {
    products[idx] = { ...products[idx], hasOrders: true };
    writeProducts(products);
  }
}
