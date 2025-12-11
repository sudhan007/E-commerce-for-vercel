// src/types/product.types.ts

export interface PriceDetails {
  actualPrice: number;
  offerPercentage: number;
  strikeAmount: number;
  price: number;
}

export interface ProductVariant {
  _id: string;
  images: string[];
  priceDetails: PriceDetails;
  stock: number;
  color?: string;
  size?: string;
  sku: string;
  isActive: boolean;
  isPrimary: boolean;
}

// primaryVariant can be full object (as in your API) OR just an ID string (in some cases)
export type PrimaryVariant = ProductVariant | string;

export interface Product {
  _id: string;
  brandName: string;
  productName: string;
  productCode: string;
  description: string;
  category: string;
  pattern: string;
  gst: number;
  ratings: number;
  primaryVariant: PrimaryVariant;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse {
  message: string;
  status: boolean;
  data: Product[];
}