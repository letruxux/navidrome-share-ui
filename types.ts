export interface ShareInfo {
  id: string;
  description: string;
  downloadable: boolean;
  tracks: {
    id: string;
    title: string;
    artist: string;
    album: string;
    updatedAt: string;
    duration: number;
  }[];
  shareUrl: string;
}
