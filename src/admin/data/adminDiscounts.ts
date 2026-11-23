// Admin discount management
import type { Discount } from '../types/admin';
import { logAdminAction, getCurrentAdmin } from './adminAuth';

const DISCOUNTS_KEY = 'wf_admin_discounts';

function readDiscounts(): Discount[] {
  try {
    const raw = localStorage.getItem(DISCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeDiscounts(d: Discount[]): void {
  localStorage.setItem(DISCOUNTS_KEY, JSON.stringify(d));
}

export function getAllDiscounts(): Discount[] {
  return readDiscounts().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getDiscountById(id: string): Discount | null {
  return readDiscounts().find((d) => d.id === id) || null;
}

export function getDiscountByCode(code: string): Discount | null {
  return readDiscounts().find((d) => d.code.toUpperCase() === code.toUpperCase()) || null;
}

export function createDiscount(
  data: Omit<Discount, 'id' | 'usedCount' | 'revenueGenerated' | 'createdAt' | 'updatedAt'>
): { success: boolean; discount?: Discount; error?: string } {
  const discounts = readDiscounts();

  // Check for duplicate code
  if (discounts.some((d) => d.code.toUpperCase() === data.code.toUpperCase())) {
    return { success: false, error: 'A discount with this code already exists.' };
  }

  const admin = getCurrentAdmin();
  const id = `disc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const newDiscount: Discount = {
    ...data,
    code: data.code.toUpperCase(),
    id,
    usedCount: 0,
    revenueGenerated: 0,
    createdAt: now,
    updatedAt: now,
  };

  writeDiscounts([...discounts, newDiscount]);

  logAdminAction({
    adminId: admin?.id || 'admin',
    action: 'discount_created',
    targetId: id,
    targetType: 'discount',
    description: `Discount code "${newDiscount.code}" created (${data.type === 'percentage' ? data.value + '%' : '₹' + data.value} off).`,
  });

  return { success: true, discount: newDiscount };
}

export function updateDiscount(
  id: string,
  updates: Partial<Discount>
): { success: boolean; error?: string } {
  const discounts = readDiscounts();
  const idx = discounts.findIndex((d) => d.id === id);
  if (idx === -1) return { success: false, error: 'Discount not found.' };
  const admin = getCurrentAdmin();

  discounts[idx] = {
    ...discounts[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeDiscounts(discounts);

  logAdminAction({
    adminId: admin?.id || 'admin',
    action: 'discount_updated',
    targetId: id,
    targetType: 'discount',
    description: `Discount code "${discounts[idx].code}" updated.`,
  });

  return { success: true };
}

export function toggleDiscount(id: string): { success: boolean; isActive?: boolean; error?: string } {
  const discounts = readDiscounts();
  const idx = discounts.findIndex((d) => d.id === id);
  if (idx === -1) return { success: false, error: 'Discount not found.' };

  discounts[idx] = {
    ...discounts[idx],
    isActive: !discounts[idx].isActive,
    updatedAt: new Date().toISOString(),
  };
  writeDiscounts(discounts);
  return { success: true, isActive: discounts[idx].isActive };
}

export function deleteDiscount(id: string): { success: boolean; error?: string } {
  const discounts = readDiscounts();
  if (!discounts.find((d) => d.id === id)) return { success: false, error: 'Discount not found.' };
  writeDiscounts(discounts.filter((d) => d.id !== id));
  return { success: true };
}
