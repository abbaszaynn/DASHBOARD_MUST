const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface AnalysisResponse {
    error: boolean;
    category: 'hate' | 'offensive' | 'neutral';
    predictionProbability: number;
    explanation: string;
    language: string;
    text: string;
    scores: {
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

export const api = {
    analyze: async (text: string): Promise<AnalysisResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    getTrends: async (): Promise<TrendsResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/trends`);
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    getMonitoring: async (): Promise<MonitoringResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/monitoring`);
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    scrapeProfile: async (url: string): Promise<ScrapeResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/scrape`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    getFlagged: async (): Promise<FlaggedResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/flagged`);
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    getLiveFeed: async (): Promise<FlaggedResponse> => {
        try {
            const response = await fetch(`${API_BASE_URL}/live-feed`);
            return response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
};
