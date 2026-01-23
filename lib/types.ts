export interface ProductFile {
  id: string;
  name: string;
  type: "application" | "eg" | "catalogue" | "quotation";
  file: File | null;
  status: "pending" | "uploaded" | "error";
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  season: string;
  tranch: string;
  description: string;
  supplier: string;
  files: ProductFile[];
  status: "draft" | "pending_review" | "approved" | "rejected";
  createdAt: Date;
  egData?: any;
  applicationData?: any;
  catalogueData?: any;
}

export interface ExtractedData {
  productName: string;
  sku: string;
  category: string;
  season: string;
  tranch: string;
  supplier: string;
  description: string;
  confidence: number;
}

export interface ApprovalJustification {
  id: string;
  productId: string;
  decision: "approved" | "rejected";
  justification: string;
  confidence: number;
  timestamp: Date;
}

export interface SimilarJustification {
  id: string;
  productName: string;
  category: string;
  decision: "approved" | "rejected";
  justification: string;
  similarity: number;
  approvalStatus?: string;
  metadata?: any;
}

export interface SimilarCaseAnalysis {
  totalCases: number;
  approvalRate: number;
  rejectionRate: number;
  commonApprovalFactors: string[];
  commonRejectionFactors: string[];
  cases: SimilarJustification[];
}

export type Stage = 1 | 2 | 3;
