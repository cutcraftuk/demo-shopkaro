export enum SubmissionStatus {
  AVAILABLE = 'AVAILABLE',
  CLAIMED = 'CLAIMED',
  ORDER_SUBMITTED = 'ORDER_SUBMITTED',
  ORDER_VERIFIED = 'ORDER_VERIFIED',
  REVIEW_SUBMITTED = 'REVIEW_SUBMITTED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  rebate: number;
  imageUrl: string;
  platform: 'Amazon' | 'Etsy' | 'Walmart' | 'Shopify';
  purchaseUrl: string;
  category: string;
  remaining: number;
}

export interface UserCampaign {
  id: string;
  productId: string;
  userId: string;
  status: SubmissionStatus;
  orderScreenshot?: string; // base64
  reviewScreenshot?: string; // base64
  orderVerified?: boolean;
  reviewVerified?: boolean;
  notes?: string;
  updatedAt: Date;
  payoutStatus?: 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';
  payoutAmount?: number;
  payoutDate?: string;
}

export interface VerificationResult {
  valid: boolean;
  reason: string;
  detectedText?: string;
}