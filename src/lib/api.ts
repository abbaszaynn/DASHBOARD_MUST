/**
 * Default `/api/py` is proxied by Next.js to BACKEND_API_URL (see next.config.ts).
 * Override with NEXT_PUBLIC_API_URL only for a direct full URL (must allow CORS).
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api/py';

const emptyTrends = (): TrendsResponse => ({
    error: true,
    stats: { hate: 0, offensive: 0, neutral: 0, total: 0 },
    recent_activity: [],
});

const emptyMonitoring = (): MonitoringResponse => ({ error: true, data: [] });

const emptyFlagged = (): FlaggedResponse => ({ error: true, data: [] });

export interface AnalysisResponse {
    error: boolean;
    message?: string;
    category?: 'hate' | 'offensive' | 'neutral';
    predictionProbability?: number;
    explanation?: string;
    language?: string;
    text?: string;
    scores?: {
        neutral: number;
        offensive: number;
        hate: number;
    };
}

export interface TrendStats {
    hate: number;
    offensive: number;
    neutral: number;
    total: number;
}

export interface RecentActivity {
    time: string;
    category: string;
}

export interface TrendsResponse {
    error: boolean;
    stats: TrendStats;
    recent_activity: RecentActivity[];
}

export interface MonitoringUser {
    id: number;
    username: string;
    platform: string;
    risk_score: number;
    last_active: string;
}

export interface MonitoringResponse {
    error: boolean;
    data: MonitoringUser[];
}

export interface FlaggedItem {
    id: number;
    text: string;
    category: string;
    confidence: number;
    language: string;
    timestamp: string;
}

export interface FlaggedResponse {
    error: boolean;
    data: FlaggedItem[];
}

export interface ScrapeResponse {
    error: boolean;
    username: string;
    posts: any[];
    risk_score: number;
    message?: string;
}

// --- Multi-agent orchestration pipeline types ---

export interface LegalMatch {
    id: string;
    law: string | null;
    section: string | null;
    title: string | null;
    jurisdiction: string | null;
    matched_keywords: string[];
    confidence: number;
    notes?: string;
    categories?: string[];
    keywords?: string[];
}

export interface SarcasmInfo {
    score: number;
    flag: boolean;
    note: string;
}

export interface ClusterInfo {
    cluster_id: number;
    campaign_flag: boolean;
    cluster_size: number;
}

export interface ProcessResponse {
    error: boolean;
    message?: string;
    category?: 'hate' | 'offensive' | 'neutral';
    confidence?: number;
    language?: string;
    scores?: {
        neutral: number;
        offensive: number;
        hate: number;
    };
    sarcasm: SarcasmInfo | null;
    cluster: ClusterInfo | null;
    legal_matches: LegalMatch[] | null;
    requires_human_review: boolean;
    case_file_id: number | null;
    review_queue_id: number | null;
    final_tier: 'none' | 'low' | 'medium' | 'high';
}

export interface IngestAndProcessResponse {
    error: boolean;
    source_used: string;
    processed: number;
    flagged: number;
    results: (ProcessResponse & { text: string; username: string; platform: string })[];
}

export interface ReviewQueueItem {
    id: number;
    case_file_id: number;
    priority: 'low' | 'medium' | 'high';
    status: 'open' | 'closed';
    decision: string | null;
    decision_notes: string | null;
    decided_by: string | null;
    decided_at: string | null;
    created_at: string;
    text: string;
    category: string;
    confidence: number;
    language: string;
    username: string;
    platform: string;
    district: string;
    cluster_id: number | null;
    campaign_flag: number;
    sarcasm_score: number | null;
    sarcasm_flag: number;
    legal_matches: LegalMatch[];
}

export interface ReviewQueueResponse {
    error: boolean;
    total: number;
    data: ReviewQueueItem[];
}

export interface DecisionResponse {
    error: boolean;
    message?: string;
    review_queue_id?: number;
    status?: string;
    decision?: string;
}

export interface DistrictStat {
    district: string;
    hate: number;
    offensive: number;
    neutral: number;
    total: number;
}

export interface PlatformStat {
    platform: string;
    hate: number;
    offensive: number;
    neutral: number;
    total: number;
}

export interface StatsResponse<T> {
    error: boolean;
    data: T[];
}

function normalizeAnalyze(raw: Record<string, unknown>): AnalysisResponse {
    const text =
        (raw.text as string) ||
        (raw.original_text as string) ||
        '';
    const scores =
        (raw.scores as AnalysisResponse['scores']) || {
            neutral: 0,
            offensive: 0,
            hate: 0,
        };
    return {
        error: false,
        category: (raw.category as AnalysisResponse['category']) || 'neutral',
        language: (raw.language as string) || '',
        text,
        scores,
        predictionProbability: raw.confidence as number | undefined,
        explanation: Array.isArray(raw.word_contributions)
            ? JSON.stringify(raw.word_contributions)
            : undefined,
    };
}

export const api = {
    analyze: async (text: string): Promise<AnalysisResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            const raw = (await response.json().catch(() => ({}))) as Record<
                string,
                unknown
            >;
            if (!response.ok) {
                return {
                    error: true,
                    message:
                        (raw.message as string) ||
                        (raw.detail as string) ||
                        `Analysis failed (${response.status})`,
                };
            }
            if (raw.error) {
                return {
                    error: true,
                    message: (raw.message as string) || 'Analysis failed',
                };
            }
            return normalizeAnalyze(raw);
        } catch {
            return {
                error: true,
                message: 'Could not reach the analysis service. Is the backend running?',
            };
        }
    },

    getTrends: async (): Promise<TrendsResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/trends`);
            const data = (await response.json().catch(() => null)) as TrendsResponse | null;
            if (!response.ok || !data) {
                return emptyTrends();
            }
            return data;
        } catch {
            return emptyTrends();
        }
    },

    getMonitoring: async (): Promise<MonitoringResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/monitoring`);
            const data = (await response.json().catch(() => null)) as MonitoringResponse | null;
            if (!response.ok || !data) {
                return emptyMonitoring();
            }
            return data;
        } catch {
            return emptyMonitoring();
        }
    },

    scrapeProfile: async (url: string): Promise<ScrapeResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/scrape`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            const raw = (await response.json().catch(() => ({}))) as Record<
                string,
                unknown
            >;
            if (!response.ok) {
                return {
                    error: true,
                    username: '',
                    posts: [],
                    risk_score: 0,
                    message:
                        (raw.message as string) ||
                        (raw.detail as string) ||
                        `Request failed (${response.status})`,
                };
            }
            return raw as ScrapeResponse;
        } catch {
            return {
                error: true,
                username: '',
                posts: [],
                risk_score: 0,
                message: 'Could not reach the backend.',
            };
        }
    },

    getFlagged: async (): Promise<FlaggedResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/flagged`);
            const data = (await response.json().catch(() => null)) as FlaggedResponse | null;
            if (!response.ok || !data) {
                return emptyFlagged();
            }
            return data;
        } catch {
            return emptyFlagged();
        }
    },

    getLiveFeed: async (): Promise<FlaggedResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/live-feed`);
            const data = (await response.json().catch(() => null)) as FlaggedResponse | null;
            if (!response.ok || !data) {
                return emptyFlagged();
            }
            return data;
        } catch {
            return emptyFlagged();
        }
    },

    // --- Multi-agent orchestration pipeline ---

    process: async (
        text: string,
        username: string = 'Anonymous',
        platform: string = 'Web'
    ): Promise<ProcessResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, username, platform }),
            });
            const raw = (await response.json().catch(() => ({}))) as Record<string, unknown>;
            if (!response.ok) {
                return {
                    error: true,
                    message:
                        (raw.message as string) || (raw.detail as string) || `Analysis failed (${response.status})`,
                    sarcasm: null,
                    cluster: null,
                    legal_matches: null,
                    requires_human_review: false,
                    case_file_id: null,
                    review_queue_id: null,
                    final_tier: 'none',
                };
            }
            return raw as unknown as ProcessResponse;
        } catch {
            return {
                error: true,
                message: 'Could not reach the analysis service. Is the backend running?',
                sarcasm: null,
                cluster: null,
                legal_matches: null,
                requires_human_review: false,
                case_file_id: null,
                review_queue_id: null,
                final_tier: 'none',
            };
        }
    },

    ingestAndProcess: async (limit: number = 20, source: string = 'auto'): Promise<IngestAndProcessResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/ingest-and-process`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit, source }),
            });
            const data = (await response.json().catch(() => null)) as IngestAndProcessResponse | null;
            if (!response.ok || !data) {
                return { error: true, source_used: source, processed: 0, flagged: 0, results: [] };
            }
            return data;
        } catch {
            return { error: true, source_used: source, processed: 0, flagged: 0, results: [] };
        }
    },

    getReviewQueue: async (
        status: string = 'open',
        opts: { platform?: string; limit?: number; offset?: number } = {}
    ): Promise<ReviewQueueResponse> => {
        try {
            const params = new URLSearchParams({ status });
            if (opts.platform) params.set('platform', opts.platform);
            if (opts.limit !== undefined) params.set('limit', String(opts.limit));
            if (opts.offset !== undefined) params.set('offset', String(opts.offset));
            const response = await fetch(`${API_BASE_URL}/review-queue?${params.toString()}`);
            const data = (await response.json().catch(() => null)) as ReviewQueueResponse | null;
            if (!response.ok || !data) {
                return { error: true, total: 0, data: [] };
            }
            return data;
        } catch {
            return { error: true, total: 0, data: [] };
        }
    },

    decideReviewQueueItem: async (
        reviewQueueId: number,
        decision: 'confirm_violation' | 'dismiss' | 'escalate_external',
        decided_by?: string,
        notes?: string
    ): Promise<DecisionResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/review-queue/${reviewQueueId}/decision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision, decided_by, notes }),
            });
            const raw = (await response.json().catch(() => ({}))) as Record<string, unknown>;
            if (!response.ok) {
                return { error: true, message: (raw.message as string) || `Decision failed (${response.status})` };
            }
            return raw as DecisionResponse;
        } catch {
            return { error: true, message: 'Could not reach the backend.' };
        }
    },

    getDistrictStats: async (): Promise<StatsResponse<DistrictStat>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/stats/districts`);
            const data = (await response.json().catch(() => null)) as StatsResponse<DistrictStat> | null;
            if (!response.ok || !data) return { error: true, data: [] };
            return data;
        } catch {
            return { error: true, data: [] };
        }
    },

    getPlatformStats: async (): Promise<StatsResponse<PlatformStat>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/stats/platforms`);
            const data = (await response.json().catch(() => null)) as StatsResponse<PlatformStat> | null;
            if (!response.ok || !data) return { error: true, data: [] };
            return data;
        } catch {
            return { error: true, data: [] };
        }
    },

    getLegalReference: async (): Promise<StatsResponse<LegalMatch>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/legal-reference`);
            const data = (await response.json().catch(() => null)) as StatsResponse<LegalMatch> | null;
            if (!response.ok || !data) return { error: true, data: [] };
            return data;
        } catch {
            return { error: true, data: [] };
        }
    },
};
