export type DocumentType =
  | "REPORT"
  | "DATASET"
  | "PUBLICATION"
  | "MEDIA";

export type DocumentStatus =
  | "PUBLISHED"
  | "REVIEW"
  | "PROCESSING"
  | "APPROVED"
  | "PENDING"
  | "REJECTED";

export type PolarDocument = {
  id: string;
  title: string;
  description: string;
  type: DocumentType;
  region: string;
  year: number;
  format: string;
  status: DocumentStatus;
  author: string;
  organization: string;
  tags: string[];
};