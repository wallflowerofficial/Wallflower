// Admin collection management
import type { WallflowerCollection } from '../types/admin';
import { logAdminAction, getCurrentAdmin } from './adminAuth';

const COLLECTIONS_KEY = 'wf_admin_collections';

function readCollections(): WallflowerCollection[] {
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCollections(c: WallflowerCollection[]): void {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(c));
}

export function getAllCollections(): WallflowerCollection[] {
  return readCollections().sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getCollectionById(id: string): WallflowerCollection | null {
  return readCollections().find((c) => c.id === id) || null;
}

export function createCollection(
  data: Omit<WallflowerCollection, 'id' | 'createdAt' | 'updatedAt'>
): WallflowerCollection {
  const collections = readCollections();
  const admin = getCurrentAdmin();
  const id = `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const newCol: WallflowerCollection = { ...data, id, createdAt: now, updatedAt: now };
  writeCollections([...collections, newCol]);

  logAdminAction({
    adminId: admin?.id || 'admin',
    action: 'collection_created',
    targetId: id,
    targetType: 'collection',
    description: `Collection "${data.name}" created.`,
  });

  return newCol;
}

export function updateCollection(
  id: string,
  updates: Partial<WallflowerCollection>
): { success: boolean; error?: string } {
  const collections = readCollections();
  const idx = collections.findIndex((c) => c.id === id);
  if (idx === -1) return { success: false, error: 'Collection not found.' };
  const admin = getCurrentAdmin();

  collections[idx] = {
    ...collections[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeCollections(collections);

  logAdminAction({
    adminId: admin?.id || 'admin',
    action: 'collection_updated',
    targetId: id,
    targetType: 'collection',
    description: `Collection "${collections[idx].name}" updated.`,
  });

  return { success: true };
}

export function deleteCollection(id: string): { success: boolean; error?: string } {
  const collections = readCollections();
  const col = collections.find((c) => c.id === id);
  if (!col) return { success: false, error: 'Collection not found.' };
  writeCollections(collections.filter((c) => c.id !== id));
  return { success: true };
}

export function reorderCollections(orderedIds: string[]): void {
  const collections = readCollections();
  const updated = collections.map((c) => ({
    ...c,
    displayOrder: orderedIds.indexOf(c.id),
  }));
  writeCollections(updated);
}
