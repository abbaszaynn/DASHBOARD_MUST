/**
 * Default `/api/py` is proxied by Next.js to BACKEND_API_URL (see next.config.ts).
 * Override with NEXT_PUBLIC_API_URL only for a direct full URL (must allow CORS).
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api/py';

/**
 * Shared-secret gate for the backend's sensitive endpoints (see MUST_backend/agents/auth.py).
 * This is a basic access gate, not real auth - since this key ships in the client bundle,
 * it deters casual/opportunistic access to a public deployment, not a targeted attacker
 * inspecting network requests. Must match the backend's SENTINEL_API_KEY secret.
 */
const API_KEY = process.env.NEXT_PUBLIC_SENTINEL_API_KEY ?? '';

const authHeaders = (extra?: Record<string, string>): Record<string, string> => ({
    ...(API_KEY ? { 'X-API-Key': API_KEY } : {}),
    ...extra,
});

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
    profile_url?: string | null;
    district?: string | null;
    last_scrape_status?: 'NEVER' | 'STARTING' | 'RUNNING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | null;
    last_scrape_at?: string | null;
    last_scrape_note?: string | null;
}

export interface TargetPost {
    id: number;
    kind: 'post' | 'comment';
    author: string | null;
    text: string;
    url: string | null;
    parent_url: string | null; // for comments: the post they were left on
    posted_at: string | null;
    category: 'hate' | 'offensive' | 'neutral' | null; // null = not classified (e.g. emoji-only)
    confidence: number | null;
    language: string | null;
    case_file_id: number | null;
    review_status: 'open' | 'closed' | null;
    created_at: string;
}

export interface ScrapeRun {
    id: number;
    user_id: number;
    username: string;
    profile_url: string | null;
    apify_run_id: string | null;
    status: string;
    posts: number;
    comments: number;
    flagged: number;
    error: string | null;
    started_at: string | null;
    finished_at: string | null;
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
    message?: string;
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
            const response = await fetch(`${API_BASE_URL}/trends`, { headers: authHeaders() });
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
            const response = await fetch(`${API_BASE_URL}/monitoring`, { headers: authHeaders() });
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
                headers: authHeaders({ 'Content-Type': 'application/json' }),
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
            const response = await fetch(`${API_BASE_URL}/flagged`, { headers: authHeaders() });
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
            const response = await fetch(`${API_BASE_URL}/live-feed`, { headers: authHeaders() });
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
                headers: authHeaders({ 'Content-Type': 'application/json' }),
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

    ingestAndProcess: async (
        limit: number = 20,
        source: string = 'auto',
        urls?: string[]
    ): Promise<IngestAndProcessResponse> => {
        const failed = (message: string): IngestAndProcessResponse => ({
            error: true, message, source_used: source, processed: 0, flagged: 0, results: [],
        });
        try {
            const response = await fetch(`${API_BASE_URL}/ingest-and-process`, {
                method: 'POST',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ limit, source, urls }),
            });
            const data = (await response.json().catch(() => null)) as IngestAndProcessResponse | null;
            if (!response.ok || !data) {
                return failed(data?.message || `Ingestion failed (${response.status})`);
            }
            return data;
        } catch {
            return failed('Could not reach the backend. Is it running?');
        }
    },

    getIngestStatus: async (): Promise<{
        error: boolean;
        apify_configured: boolean;
        actor: string;
        start_urls: string[];
        max_results_per_page: number;
    }> => {
        const none = { error: true, apify_configured: false, actor: '', start_urls: [], max_results_per_page: 0 };
        try {
            const response = await fetch(`${API_BASE_URL}/ingest/status`, { headers: authHeaders() });
            const data = await response.json().catch(() => null);
            return response.ok && data ? data : none;
        } catch {
            return none;
        }
    },

    // --- Monitored targets ---

    addTarget: async (
        profile_url: string,
        name?: string,
        district?: string
    ): Promise<{ error: boolean; message?: string; id?: number }> => {
        try {
            const response = await fetch(`${API_BASE_URL}/targets`, {
                method: 'POST',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ profile_url, name: name || undefined, district: district || undefined }),
            });
            const data = await response.json().catch(() => null);
            if (!response.ok || !data) return { error: true, message: data?.message || `Could not add target (${response.status})` };
            return data;
        } catch {
            return { error: true, message: 'Could not reach the backend. Is it running?' };
        }
    },

    scrapeTarget: async (userId: number, limit: number = 10): Promise<{ error: boolean; message?: string }> => {
        try {
            const response = await fetch(`${API_BASE_URL}/targets/${userId}/scrape?limit=${limit}`, {
                method: 'POST',
                headers: authHeaders(),
            });
            const data = await response.json().catch(() => null);
            if (!response.ok || !data) return { error: true, message: data?.message || `Could not start scrape (${response.status})` };
            return data;
        } catch {
            return { error: true, message: 'Could not reach the backend. Is it running?' };
        }
    },

    getScrapeRuns: async (userId?: number): Promise<StatsResponse<ScrapeRun>> => {
        try {
            const q = userId !== undefined ? `?user_id=${userId}` : '';
            const response = await fetch(`${API_BASE_URL}/scrape-runs${q}`, { headers: authHeaders() });
            const data = await response.json().catch(() => null);
            return response.ok && data ? data : { error: true, data: [] };
        } catch {
            return { error: true, data: [] };
        }
    },

    getTargetPosts: async (userId: number): Promise<StatsResponse<TargetPost>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/targets/${userId}/posts`, { headers: authHeaders() });
            const data = await response.json().catch(() => null);
            return response.ok && data ? data : { error: true, data: [] };
        } catch {
            return { error: true, data: [] };
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
            const response = await fetch(`${API_BASE_URL}/review-queue?${params.toString()}`, {
                headers: authHeaders(),
            });
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
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ decision, decided_by, notes }),
            });
            const raw = (await response.json().catch(() => ({}))) as Record<string, unknown>;
            if (!response.ok) {
                return { error: true, message: (raw.message as string) || `Decision failed (${response.status})` };
            }
            return raw as unknown as DecisionResponse;
        } catch {
            return { error: true, message: 'Could not reach the backend.' };
        }
    },

    getDistrictStats: async (): Promise<StatsResponse<DistrictStat>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/stats/districts`, { headers: authHeaders() });
            const data = (await response.json().catch(() => null)) as StatsResponse<DistrictStat> | null;
            if (!response.ok || !data) return { error: true, data: [] };
            return data;
        } catch {
            return { error: true, data: [] };
        }
    },

    getPlatformStats: async (): Promise<StatsResponse<PlatformStat>> => {
        try {
            const response = await fetch(`${API_BASE_URL}/stats/platforms`, { headers: authHeaders() });
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

    // --- Collection record, clustering and sarcasm ---

    getApifyStats: async (): Promise<ApifyOverview> => {
        try {
            const response = await fetch(`${API_BASE_URL}/stats/apify`, { headers: authHeaders() });
            const data = (await response.json().catch(() => null)) as ApifyOverview | null;
            if (!response.ok || !data) return emptyApify();
            return data;
        } catch {
            return emptyApify();
        }
    },

    getClusters: async (): Promise<ClustersResponse> => {
        const none: ClustersResponse = { error: true, data: [], config: null };
        try {
            const response = await fetch(`${API_BASE_URL}/clusters`, { headers: authHeaders() });
            const data = (await response.json().catch(() => null)) as ClustersResponse | null;
            if (!response.ok || !data) return none;
            return data;
        } catch {
            return none;
        }
    },

    getSarcasm: async (): Promise<SarcasmOverview> => {
        const none: SarcasmOverview = {
            error: true,
            totals: { case_files: 0, scored: 0, flagged: 0 },
            recent: [],
            config: null,
        };
        try {
            const response = await fetch(`${API_BASE_URL}/sarcasm`, { headers: authHeaders() });
            const data = (await response.json().catch(() => null)) as SarcasmOverview | null;
            if (!response.ok || !data) return none;
            return data;
        } catch {
            return none;
        }
    },

    testSarcasm: async (text: string): Promise<SarcasmTestResult> => {
        const none: SarcasmTestResult = {
            error: true,
            score: 0,
            flag: false,
            matched_markers: [],
            contrast_pattern: false,
            note: 'Could not reach the backend.',
        };
        try {
            const response = await fetch(`${API_BASE_URL}/sarcasm/test`, {
                method: 'POST',
                headers: authHeaders({ 'Content-Type': 'application/json' }),
                body: JSON.stringify({ text }),
            });
            const data = (await response.json().catch(() => null)) as SarcasmTestResult | null;
            if (!response.ok || !data) return none;
            return data;
        } catch {
            return none;
        }
    },

    getPipelineConfig: async (): Promise<PipelineConfig | null> => {
        try {
            const response = await fetch(`${API_BASE_URL}/pipeline/config`, { headers: authHeaders() });
            const data = (await response.json().catch(() => null)) as PipelineConfig | null;
            return response.ok ? data : null;
        } catch {
            return null;
        }
    },
};

// --- Collection record, clustering and sarcasm types ---

export interface ApifyRunItems {
    items?: number;
    hate?: number;
    offensive?: number;
    neutral?: number;
    unclassified?: number;
}

export interface ApifyRun {
    id: number;
    user_id: number;
    apify_run_id: string | null;
    status: string;
    posts: number;
    comments: number;
    flagged: number;
    error: string | null;
    started_at: string | null;
    finished_at: string | null;
    username: string;
    profile_url: string | null;
    district: string | null;
    duration_seconds: number | null;
    cost_usd: number;
    cost_pkr: number;
    items: ApifyRunItems;
}

export interface ApifyTotals {
    runs: number;
    succeeded: number;
    failed: number;
    active: number;
    posts_collected: number;
    comments_collected: number;
    items_stored: number;
    posts_stored: number;
    comments_stored: number;
    hate: number;
    offensive: number;
    neutral: number;
    unclassified: number;
    flagged: number;
    flag_rate: number;
    comments_per_post: number;
}

export interface ApifyCost {
    total_usd: number;
    total_pkr: number;
    per_flagged_usd: number | null;
    post_price_usd: number;
    comment_price_usd: number;
    start_fee_usd: number;
    pkr_per_usd: number;
    basis: string;
}

export interface ApifyCadence {
    scheduled: boolean;
    trigger: string;
    comments_requested_per_post: number;
    avg_run_seconds: number | null;
    longest_run_seconds: number | null;
    avg_gap_seconds: number | null;
    first_run_at: string | null;
    last_run_at: string | null;
}

export interface ApifyOverview {
    error: boolean;
    runs: ApifyRun[];
    totals: ApifyTotals;
    cost: ApifyCost;
    cadence: ApifyCadence;
}

const emptyApify = (): ApifyOverview => ({
    error: true,
    runs: [],
    totals: {
        runs: 0, succeeded: 0, failed: 0, active: 0,
        posts_collected: 0, comments_collected: 0, items_stored: 0,
        posts_stored: 0, comments_stored: 0, hate: 0, offensive: 0,
        neutral: 0, unclassified: 0, flagged: 0, flag_rate: 0, comments_per_post: 0,
    },
    cost: {
        total_usd: 0, total_pkr: 0, per_flagged_usd: null,
        post_price_usd: 0, comment_price_usd: 0, start_fee_usd: 0,
        pkr_per_usd: 0, basis: '',
    },
    cadence: {
        scheduled: false, trigger: '', comments_requested_per_post: 0,
        avg_run_seconds: null, longest_run_seconds: null, avg_gap_seconds: null,
        first_run_at: null, last_run_at: null,
    },
});

export interface ClusterMember {
    id: number;
    cluster_id: number;
    text: string;
    similarity_to_centroid: number | null;
    added_at: string;
}

export interface ClusterCase {
    id: number;
    cluster_id: number;
    username: string | null;
    platform: string | null;
    district: string | null;
    category: string | null;
    confidence: number | null;
    created_at: string;
    review_queue_id: number | null;
    review_status: string | null;
}

export interface ContentCluster {
    id: number;
    platform: string | null;
    representative_text: string;
    member_count: number;
    campaign_flag: number;
    created_at: string;
    updated_at: string;
    members: ClusterMember[];
    cases: ClusterCase[];
    distinct_authors: number;
    districts: string[];
}

export interface ClusterConfig {
    status: string;
    similarity_threshold: number;
    campaign_min_members: number;
    embedding_model: string;
    method: string;
    note: string;
}

export interface ClustersResponse {
    error: boolean;
    data: ContentCluster[];
    config: ClusterConfig | null;
}

export interface SarcasmCase {
    id: number;
    text: string;
    category: string | null;
    confidence: number | null;
    language: string | null;
    username: string | null;
    platform: string | null;
    district: string | null;
    sarcasm_score: number | null;
    sarcasm_flag: number;
    created_at: string;
    review_status: string | null;
}

export interface SarcasmConfig {
    status: string;
    markers: string[];
    contrast_pattern: string;
    marker_weight: number;
    contrast_weight: number;
    flag_threshold: number;
    runs_between_confidence: [number, number];
    note: string;
}

export interface SarcasmOverview {
    error: boolean;
    totals: { case_files: number; scored: number; flagged: number };
    recent: SarcasmCase[];
    config: SarcasmConfig | null;
}

export interface SarcasmTestResult {
    error: boolean;
    score: number;
    flag: boolean;
    matched_markers: string[];
    contrast_pattern: boolean;
    note: string;
}

export interface PipelineConfig {
    error: boolean;
    sarcasm_band: [number, number];
    sarcasm_flag_threshold: number;
    tier_medium_min: number;
    tier_high_min: number;
    cluster_similarity_threshold: number;
    campaign_min_members: number;
    human_review_required: boolean;
}
