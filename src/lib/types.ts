/** Shared types used across the application. */

export interface PortfolioItem {
  id: number;
  title: string;
  description: string | null;
  image_path: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface SiteConfig {
  avatar_path: string | null;
  background_path: string | null;
  bio: string | null;
  site_title: string;
  id?: number;
  updated_at?: string;
}
