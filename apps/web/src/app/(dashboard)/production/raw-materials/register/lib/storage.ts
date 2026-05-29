import type { RawMaterial } from '../types';

const MATERIALS_KEY = 'ship-flow:rm-register-materials';
const CREATED_CODE_KEY = 'ship-flow:rm-register-created-code';
const UPDATED_CODE_KEY = 'ship-flow:rm-register-updated-code';

export function loadRawMaterials(): RawMaterial[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(MATERIALS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RawMaterial[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRawMaterials(materials: RawMaterial[]): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
}

export function appendRawMaterial(item: RawMaterial): void {
  const materials = loadRawMaterials();
  saveRawMaterials([item, ...materials]);
}

export function findRawMaterialById(id: string): RawMaterial | undefined {
  return loadRawMaterials().find((material) => material.id === id);
}

export function updateRawMaterial(updated: RawMaterial): void {
  const materials = loadRawMaterials();
  saveRawMaterials(materials.map((material) => (material.id === updated.id ? updated : material)));
}

export function setCreatedToastCode(code: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(CREATED_CODE_KEY, code);
}

export function consumeCreatedToastCode(): string | null {
  if (typeof window === 'undefined') return null;
  const code = sessionStorage.getItem(CREATED_CODE_KEY);
  if (code) {
    sessionStorage.removeItem(CREATED_CODE_KEY);
  }
  return code;
}

export function setUpdatedToastCode(code: string): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(UPDATED_CODE_KEY, code);
}

export function consumeUpdatedToastCode(): string | null {
  if (typeof window === 'undefined') return null;
  const code = sessionStorage.getItem(UPDATED_CODE_KEY);
  if (code) {
    sessionStorage.removeItem(UPDATED_CODE_KEY);
  }
  return code;
}

export function getNextItemCode(materials: RawMaterial[]): string {
  const nextNumber = materials.length + 1;
  return `RM-${String(nextNumber).padStart(3, '0')}`;
}
