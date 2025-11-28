// This file is now mainly for client-side type definitions
// that don't need to be in sync with the backend schema.
// Firestore-related types will be inferred from backend.json

export type FlaggedPost = {
  id: string;
  content: string;
  user: {
    name: string;
    avatar: string;
    url: string;
  };
  date: string; // Keep as string for client-side flexibility
  category: "Hate" | "Offensive" | "Neutral";
  confidence: number;
  source: "Facebook" | "Web" | "Twitter" | "Instagram";
  region: string;
  triggerTerms: string[];
};

export type User = {
  id: string;
  name: string;
  avatarUrl: string;
  profileUrl: string;
  lastActivity: any; // Can be a Date object or a Firestore Timestamp
  riskLevel: "Critical" | "High" | "Medium" | "Low";
  followerCount?: number;
  flagRate?: number;
  accountInfo?: {
    joinDate: string;
    email: string;
  }
};

export type AuditLog = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  action: string;
  details: string;
  timestamp: string;
};

export type Trend = {
  name: string;
  value: number;
};
