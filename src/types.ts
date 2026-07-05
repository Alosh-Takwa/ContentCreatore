/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BrandProfile {
  brandName: string;
  industry: string;
  mission: string;
  targetAudience: string;
  painPoints: string;
  tone: string;
  productDescription: string;
  keywords: string;
  images: string[]; // Base64 encoded strings
  viralReference: string;
}

export interface Campaign {
  id: string;
  name: string;
  profile: BrandProfile;
  daysPlan: DayPlan[];
  createdAt: string;
}

export type PlatformType = 'facebook' | 'instagram' | 'tiktok';
export type ContentType = 'video_script' | 'reel_idea' | 'static_post';

export interface GeneratedContent {
  id: string;
  platform: PlatformType;
  type: ContentType;
  day?: number;
  hook: string;
  caption: string;
  structure: string;
  fullText: string;
  shootingGuidelines?: string; // only for videos/reels
  imagePrompt?: string; // only for static posts
  createdAt: string;
}

export interface DayPlan {
  day: number;
  platform: PlatformType;
  type: ContentType;
  title: string;
  concept: string;
  objective: string;
  status: 'pending' | 'generating' | 'completed';
  content?: GeneratedContent;
}

export interface ViralFramework {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  example: string;
  exampleAr: string;
  pattern: string;
}
