import { create } from 'zustand';
import type { Entity } from '@/lib/types';

interface MapState {
  entities: Entity[];
  selectedId: string | null;
  filters: { city?: string; tag?: string; type?: string; q?: string };
  setEntities: (e: Entity[]) => void;
  select: (id: string | null) => void;
  setFilters: (f: Partial<MapState['filters']>) => void;
}

export const useMapStore = create<MapState>((set) => ({
  entities: [],
  selectedId: null,
  filters: {},
  setEntities: (entities) => set({ entities }),
  select: (selectedId) => set({ selectedId }),
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
}));