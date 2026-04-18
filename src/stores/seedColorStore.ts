import { create } from "zustand";
import {
  DEFAULT_SEED_COLOR,
  getStoredSeed,
  setStoredSeed,
} from "@/lib/utils/materialTheme";

// NOTE: The Material You seed color is persisted client-side (localStorage)
// rather than round-tripping through Rust `AppSettings`. A pure-UI preference
// doesn't need the Tauri IPC surface that `ui_theme` goes through, and it
// avoids regenerating the tauri-specta bindings for every palette tweak.
interface SeedColorState {
  seed: string;
  // Commit a new seed: updates state AND persists to localStorage.
  setSeed: (hex: string) => void;
  // Preview-only update: updates state without persisting. Use while the user
  // is dragging a color picker so we don't hammer localStorage each frame.
  previewSeed: (hex: string) => void;
  // Persist the current in-memory seed to localStorage (call on drag end).
  commitSeed: () => void;
  reset: () => void;
}

const isValidHex = (hex: string) => /^#[0-9a-fA-F]{6}$/.test(hex);

export const useSeedColorStore = create<SeedColorState>()((set, get) => ({
  seed: getStoredSeed(),
  setSeed: (hex) => {
    if (!isValidHex(hex)) return;
    if (get().seed === hex) return;
    setStoredSeed(hex);
    set({ seed: hex });
  },
  previewSeed: (hex) => {
    if (!isValidHex(hex)) return;
    if (get().seed === hex) return;
    set({ seed: hex });
  },
  commitSeed: () => {
    setStoredSeed(get().seed);
  },
  reset: () => {
    setStoredSeed(DEFAULT_SEED_COLOR);
    set({ seed: DEFAULT_SEED_COLOR });
  },
}));
