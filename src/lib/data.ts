import type { AuditLog, Trend, FlaggedPost, User } from "@/types";

export const auditLogs: AuditLog[] = [
  {
    id: "LOG001",
    user: { name: "AdminUser", avatar: "/avatars/admin.png" },
    action: "Issued Warning",
    details: "Issued a warning to UserA for post POST001.",
    timestamp: "2024-05-20T10:05:00Z",
  },
  {
    id: "LOG002",
    user: { name: "ModUser", avatar: "/avatars/mod.png" },
    action: "Requested Takedown",
    details: "Requested takedown for post POST002.",
    timestamp: "2024-05-20T11:35:00Z",
  },
  {
    id: "LOG003",
    user: { name: "AdminUser", avatar: "/avatars/admin.png" },
    action: "Updated Keyword Watchlist",
    details: "Added 'new-hate-term' to the keyword watchlist.",
    timestamp: "2024-05-19T14:00:00Z",
  },
    {
    id: "LOG004",
    user: { name: "LegalOfficer", avatar: "/avatars/legal.png" },
    action: "Escalated for Legal Review",
    details: "Escalated post POST004 for legal action.",
    timestamp: "2024-05-19T09:00:00Z",
  },
];

export const weeklyTrends: { day: string; Hate: number; Offensive: number; Neutral: number }[] = [
    { day: "Mon", Hate: 12, Offensive: 20, Neutral: 150 },
    { day: "Tue", Hate: 15, Offensive: 25, Neutral: 160 },
    { day: "Wed", Hate: 18, Offensive: 22, Neutral: 140 },
    { day: "Thu", Hate: 25, Offensive: 30, Neutral: 180 },
    { day: "Fri", Hate: 30, Offensive: 35, Neutral: 190 },
    { day: "Sat", Hate: 45, Offensive: 40, Neutral: 120 },
    { day: "Sun", Hate: 40, Offensive: 38, Neutral: 110 },
];

export const regionalBreakdown: Trend[] = [
    { name: "Gilgit", value: 45 },
    { name: "Skardu", value: 30 },
    { name: "Hunza", value: 15 },
    { name: "Ghizer", value: 25 },
    { name: "Astore", value: 20 },
    { name: "Diamer", value: 35 },
];

export const platformSources: Trend[] = [
    { name: "Facebook", value: 120 },
    { name: "Web", value: 80 },
    { name: "Twitter", value: 50 },
    { name: "Instagram", value: 30 },
];

export const hotKeywords: string[] = ["KKH", "JSR", "DBD", "PAK FOUJ", "KARGIL ROAD", "KHUNJERAB", "SHIA/SUNNI"];

// Mock data for users and flagged posts for Trend Analysis page, will be replaced with Firestore data
export const users: User[] = [
    { id: 'user1', name: 'John Doe', avatarUrl: `https://i.pravatar.cc/100?u=user1`, profileUrl: '#', lastActivity: new Date(), riskLevel: 'High', followerCount: 1200, flagRate: 0.75, accountInfo: { joinDate: '2023-01-15', email: 'john.d@example.com'} },
    { id: 'user2', name: 'Jane Smith', avatarUrl: `https://i.pravatar.cc/100?u=user2`, profileUrl: '#', lastActivity: new Date(), riskLevel: 'Medium', followerCount: 450, flagRate: 0.25, accountInfo: { joinDate: '2022-08-10', email: 'jane.s@example.com'} },
    { id: 'user3', name: 'Critical User', avatarUrl: `https://i.pravatar.cc/100?u=user3`, profileUrl: '#', lastActivity: new Date(), riskLevel: 'Critical', followerCount: 3500, flagRate: 0.95, accountInfo: { joinDate: '2021-05-20', email: 'critical.u@example.com'} },
];

export const flaggedPosts: FlaggedPost[] = [
    { id: 'post1', content: 'This is a test post talking about KKH.', user: { name: 'John Doe', avatar: '', url: '#' }, date: new Date().toISOString(), category: 'Hate', confidence: 0.92, source: 'Facebook', region: 'Gilgit', triggerTerms: ['KKH'] },
    { id: 'post2', content: 'Another post mentioning the JSR.', user: { name: 'Jane Smith', avatar: '', url: '#' }, date: new Date().toISOString(), category: 'Offensive', confidence: 0.81, source: 'Web', region: 'Skardu', triggerTerms: ['JSR'] },
    { id: 'post3', content: 'This is a dangerous post about PAK FOUJ and KARGIL ROAD.', user: { name: 'Critical User', avatar: '', url: '#' }, date: new Date().toISOString(), category: 'Hate', confidence: 0.99, source: 'Facebook', region: 'Diamer', triggerTerms: ['PAK FOUJ', 'KARGIL ROAD'] },
    { id: 'post4', content: 'More content about the KKH issue.', user: { name: 'John Doe', avatar: '', url: '#' }, date: new Date().toISOString(), category: 'Offensive', confidence: 0.78, source: 'Twitter', region: 'Gilgit', triggerTerms: ['KKH'] },
];
