import { create } from 'zustand';

// Per-note embedding status. 'pending' = scheduled (debounce window),
// 'embedding' = request in flight. Absence = idle / done.
//
// We don't keep a 'done' state around — the indicator is about "work is
// happening now", not "work happened recently". Brief flashes feel noisy.

export type EmbedPhase = 'pending' | 'embedding';

type State = {
  byId: Record<string, EmbedPhase>;
  set: (id: string, phase: EmbedPhase) => void;
  clear: (id: string) => void;
};

export const useEmbedStatus = create<State>((set) => ({
  byId: {},
  set: (id, phase) =>
    set((s) => ({ byId: { ...s.byId, [id]: phase } })),
  clear: (id) =>
    set((s) => {
      if (!(id in s.byId)) return s;
      const { [id]: _drop, ...rest } = s.byId;
      return { byId: rest };
    }),
}));

export function useEmbedPhase(noteId: string | undefined): EmbedPhase | null {
  return useEmbedStatus((s) => (noteId ? s.byId[noteId] ?? null : null));
}
