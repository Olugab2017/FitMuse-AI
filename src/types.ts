/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'tops' | 'bottoms' | 'outerwear' | 'footwear' | 'accessories';
  price: number;
  image: string; // URL or Canvas generated image selector
  rating: number;
  description: string;
  sizes: string[];
  colors: string[];
  tags: string[];
  alignment: {
    fitMatch: number; // Percentage (e.g., 95)
    colorCompatibility: string; // Explanatory text
    styleExplanation: string; // Explanatory text
  };
  inventory: number;
}

export interface StyleProfile {
  styleType: string;
  preferredColors: string[];
  fitRecommendations: string;
  aestheticTags: string[];
  selfieUrl?: string; // Loaded selfie image data/URL
  bodyType?: string;
  skinToneDescription?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface SavedLook {
  id: string;
  name: string;
  date: string;
  avatarUrl: string;
  products: Product[];
  uploadedGarmentUrl?: string;
  resultImageUrl: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestedProductIds?: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl?: string;
  styleProfile?: StyleProfile;
  orderHistory: {
    id: string;
    date: string;
    items: { productName: string; price: number; quantity: number }[];
    total: number;
    status: string;
  }[];
}
