export interface FormData {
  layout: string; // 户型 (e.g., "两室一厅")
  area: number; // 平数 (sqm)
  orientation: string; // 朝向 (e.g., "南")
  style: string; // 风格 (e.g., "现代简约")
  budget: string; // 预算偏好 (optional in UI, but logic uses it)
}

export interface FurnitureItem {
  category: string;
  name: string;
  description: string;
  estimatedPrice: number;
  buyingTip: string;
}

export interface FurnitureListResponse {
  totalEstimatedCost: number;
  currency: string;
  items: FurnitureItem[];
  designAdvice: string;
}

export interface DesignResult {
  imageUrl: string | null;
  furnitureData: FurnitureListResponse | null;
}

export enum LoadingState {
  IDLE = 'IDLE',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  GENERATING_LIST = 'GENERATING_LIST',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

// New Types for AR Assistant
export interface ColorRecommendation {
  name: string;
  hex: string;
  usage: string;
}

export interface ArAnalysisResponse {
  suggestions: string[];
  colorPalette: ColorRecommendation[];
}

export type FocusArea = 'Overall Room' | 'Walls & Floor' | 'Furniture' | 'Soft Decor';

export interface ArResult {
  id: string;
  timestamp: number;
  style: string;
  focusArea: FocusArea;
  originalImage: string;
  generatedImage: string | null;
  analysis: ArAnalysisResponse | null;
}
