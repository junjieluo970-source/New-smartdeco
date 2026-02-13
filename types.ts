export interface FormData {
  layout: string;
  area: number;
  orientation: string;
  style: string;
  budget: string;
}

export interface FurnitureItem {
  category: string;
  name: string;
  description: string;
  estimatedPrice: number; // Keep for backward compatibility/chart
  priceMin: number; // New: Minimum market price
  priceMax: number; // New: Maximum market price
  buyingTip: string;
  material: string;
  dimensions: string;
  searchQuery: string; // New: Keyword for shopping search
}

export interface FurnitureListResponse {
  totalEstimatedCost: number;
  totalMinCost: number; // New
  totalMaxCost: number; // New
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

// AR Assistant Types
export type FocusArea = 'Overall Room' | 'Walls & Floor' | 'Furniture' | 'Soft Decor';

export interface DetectedObject {
  name: string;
  currentStyle: string;
  suggestion: string;
  confidence: number;
}

export interface ColorRecommendation {
  name: string;
  hex: string;
  usage: string;
}

export interface AnalysisResult {
    suggestions: string[];
    colorPalette: ColorRecommendation[];
    detectedObjects: DetectedObject[]; // New: AR Element Recognition
}

export interface ArResult {
  id: string;
  timestamp: number;
  style: string;
  focusArea: FocusArea;
  originalImage: string;
  generatedImage: string | null;
  analysis: AnalysisResult | null;
}

// Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}