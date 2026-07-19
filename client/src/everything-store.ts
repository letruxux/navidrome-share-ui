import { create } from "zustand";
import type { ShareInfo } from "../../types";

interface EverythingState {
  audioElement: HTMLAudioElement | null;
  shareInfo: ShareInfo | null;
  selectedTrackId: string | null;
  selectedTrackObj: ShareInfo["tracks"][number] | null;

  setShareInfo: (shareInfo: ShareInfo | null) => void;
  setSelectedTrackId: (selectedTrackId: string | null) => void;
  setSelectedTrackObj: (selectedTrackObj: ShareInfo["tracks"][number] | null) => void;
  setAudioElement: (audioElement: HTMLAudioElement) => void;
}

export const useEverythingStore = create<EverythingState>()((set) => ({
  audioElement: null,
  shareInfo: null,
  selectedTrackId: null,
  selectedTrackObj: null,

  setAudioElement: (audioElement) => set({ audioElement }),
  setShareInfo: (shareInfo) => set({ shareInfo }),
  setSelectedTrackId: (selectedTrackId) => set({ selectedTrackId }),
  setSelectedTrackObj: (selectedTrackObj) => set({ selectedTrackObj }),
}));
