export interface Creator {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface VideoItem {
  id: string;
  url: string;           // mp4/hls URL (readonly)
  poster?: string;      // optional poster image
  duration: number;     // seconds
  caption?: string;     // raw caption text (for CaptionBar)
  autoCaptions?: string; // precomputed captions (optional)
  isLiked?: boolean;
  likesCount?: number;
  commentsCount?: number;
  isFollowed?: boolean;
  creator: Creator;
}