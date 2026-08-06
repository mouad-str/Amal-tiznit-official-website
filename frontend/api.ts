/**
 * API Configuration
 * Central configuration for API endpoints
 */

export const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Fetch wrapper with error handling
 */
export const apiFetch = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
};

/**
 * API Endpoints
 */
export const API = {
    players: {
        getAll: () => apiFetch<Player[]>('/players'),
        getById: (id: number) => apiFetch<Player>(`/players/${id}`),
        create: (data: Partial<Player>) => apiFetch<{ id: number }>('/players', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: Partial<Player>) => apiFetch<void>(`/players/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: number) => apiFetch<void>(`/players/${id}`, { method: 'DELETE' }),
    },
    matches: {
        getAll: () => apiFetch<Match[]>('/matches'),
        getById: (id: number) => apiFetch<Match>(`/matches/${id}`),
        create: (data: Partial<Match>) => apiFetch<{ id: number }>('/matches', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: Partial<Match>) => apiFetch<void>(`/matches/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: number) => apiFetch<void>(`/matches/${id}`, { method: 'DELETE' }),
    },
    news: {
        getAll: () => apiFetch<NewsArticle[]>('/news'),
        getById: (id: number) => apiFetch<NewsArticle>(`/news/${id}`),
        create: (data: Partial<NewsArticle>) => apiFetch<{ id: number }>('/news', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: Partial<NewsArticle>) => apiFetch<void>(`/news/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: number) => apiFetch<void>(`/news/${id}`, { method: 'DELETE' }),
    },
    shop: {
        getAll: () => apiFetch<Product[]>('/shop'),
        getById: (id: number) => apiFetch<Product>(`/shop/${id}`),
        create: (data: Partial<Product>) => apiFetch<{ id: number }>('/shop', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: Partial<Product>) => apiFetch<void>(`/shop/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: number) => apiFetch<void>(`/shop/${id}`, { method: 'DELETE' }),
    },
    tickets: {
        getByMatch: (matchId: number) => apiFetch<Ticket[]>(`/tickets/match/${matchId}`),
        getAll: () => apiFetch<Ticket[]>('/tickets'),
        create: (data: Partial<Ticket>) => apiFetch<{ id: number }>('/tickets', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: number, data: Partial<Ticket>) => apiFetch<void>(`/tickets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: number) => apiFetch<void>(`/tickets/${id}`, { method: 'DELETE' }),
    },
    contact: {
        getAll: () => apiFetch<ContactMessage[]>('/contact'),
        create: (data: { name: string; email: string; message: string }) =>
            apiFetch<{ id: number; message: string }>('/contact', { method: 'POST', body: JSON.stringify(data) }),
        delete: (id: number) => apiFetch<void>(`/contact/${id}`, { method: 'DELETE' }),
    },
    settings: {
        getTicketSettings: () => apiFetch<TicketSettings>('/settings/ticket'),
        updateTicketSettings: (data: TicketSettings) => apiFetch<void>('/settings/ticket', { method: 'PUT', body: JSON.stringify(data) }),
    },
    orders: {
        create: (data: {
            customer_name: string;
            customer_email: string;
            customer_phone: string;
            customer_address: string;
            items: { 
                product_id: number; 
                quantity: number;
                size?: string;
                flocage?: string | null;
                has_patch?: boolean;
            }[]
        }) => apiFetch<{ success: boolean; orderId: number; total: number }>('/orders', { method: 'POST', body: JSON.stringify(data) }),
        getAll: () => apiFetch<any[]>('/orders', { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }),
        updateStatus: (id: number, status: string) => apiFetch<void>(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
            headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }),
    }
};

// Type definitions
export interface Player {
    id: number;
    name: string;
    position: 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
    number: number;
    image_url: string;
    nationality: string;
    matches_played: number;
    goals: number;
    assists: number;
    minutes_played: number;
    yellow_cards: number;
    red_cards: number;
}

export interface Match {
    id: number;
    opponent: string;
    match_date: string;
    stadium: string;
    is_home: boolean;
    status: 'upcoming' | 'finished';
    home_score: number | null;
    away_score: number | null;
}

export interface NewsArticle {
    id: number;
    title: string;
    description: string;
    image_url: string;
    category: string;
    published_at: string;
}

export interface Product {
    id: number;
    name: string;
    slug?: string;
    description: string;
    price: number;
    compare_at_price?: number | null;
    image_url: string;
    category: string;
    collection?: string;
    gender?: string;
    stock: number;
    sizes: string;
    is_featured?: boolean;
    is_new?: boolean;
}

export interface Ticket {
    id: number;
    match_id: number;
    seat_category: 'VIP' | 'Standard' | 'Economy';
    price: number;
    quantity_available: number;
}

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    message: string;
    created_at: string;
}

export interface TicketSettings {
    title: string;
    subTitlePrefix: string;
    branding: {
        logo: string;
        teamName: string;
    };
    sponsors: string[];
}
