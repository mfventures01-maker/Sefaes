export interface LuxuryOrder {
    timestamp: string; // "quantum_synchronized"
    table: {
        id: string;
        zone: string;
        privacy_score: number;
        acoustics: string;
        sightlines: string[];
    };
    server: {
        id: string;
        expertise: string[];
        client_rapport: number;
        service_velocity: string;
    };
    items: LuxuryItem[];
    client_context: ClientContext;
}

export interface LuxuryItem {
    type: "liquid_asset" | "culinary_masterpiece" | "experience";
    name: string;
    vintage?: number;
    serving: {
        temperature: string;
        glass: string;
        presentation: string;
    };
    pricing: {
        amount: number;
        currency: string;
        display: "never" | "discrete";
        conversation: "discreet_nod" | "whispered";
    };
}

export interface ClientContext {
    current_mood: string;
    business_result?: string;
    celebration_mode?: string;
    next_visit_anticipation?: string;
    archetype?: "global_tycoon" | "celebrity_diplomat" | "legacy_family_scion";
}

export interface DefactoAnalytics {
    current_moment: {
        energy_density: number;
        liquid_asset_velocity: number;
        discretion_breach_alerts: number;
        anticipation_success_rate: number;
    };
    client_evolution: {
        taste_progression: Record<string, string>;
        spend_confidence: number;
        visit_pattern: string;
    };
    staff_performance: {
        psychic_service_events: number;
        discretion_perfection: number;
        client_rapport_growth: number;
    };
}

export interface StaffProfile {
    id: string;
    name: string;
    specialties: string[];
    client_affinity: string[];
    discretion_rating: number;
    theatrical_score?: number;
}
