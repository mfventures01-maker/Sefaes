import { StaffProfile, ClientContext } from '../types/carss';

export class DefactoStaffOrchestrator {
    private expertiseMatrix: Record<string, StaffProfile> = {
        'sommelier_alpha': {
            id: 'sommelier_alpha',
            name: 'Jean-Luc (Sommelier)',
            specialties: ['pre_phylloxera_bordeaux', 'single_cask_whisky'],
            client_affinity: ['global_tycoon', 'legacy_family_scion'],
            discretion_rating: 9.9
        },
        'mixologist_sigma': {
            id: 'mixologist_sigma',
            name: 'Aria (Alchemist)',
            specialties: ['molecular_mixology', 'bespoke_narratives'],
            client_affinity: ['celebrity_diplomat'],
            discretion_rating: 9.7,
            theatrical_score: 9.7
        }
    };

    /**
     * "Quantum" staff assignment logic.
     * Calculates the best staff member for a given client archetype.
     */
    public assignToTable(clientArchetype: ClientContext['archetype'], tableZone: string): string {
        console.log(`[ORCHESTRATOR] Analyzing zone ${tableZone} for ${clientArchetype}...`);

        let bestMatchId = '';
        let bestMatchScore = -1;

        Object.values(this.expertiseMatrix).forEach(staff => {
            let score = 0;

            // Affinity Match
            if (clientArchetype && staff.client_affinity.includes(clientArchetype)) {
                score += 50;
            }

            // Discretion Check
            score += staff.discretion_rating * 10;

            // Theatricality for certain zones
            if (tableZone === 'performance_stage' && staff.theatrical_score) {
                score += staff.theatrical_score * 5;
            }

            if (score > bestMatchScore) {
                bestMatchScore = score;
                bestMatchId = staff.id;
            }
        });

        return bestMatchId || "standard_service_protocol";
    }

    public calculateAnticipationBonus(staffId: string, actualOrderItems: string[], predictedItems: string[]): string {
        // Simple set intersection for demo
        const matches = actualOrderItems.filter(item => predictedItems.includes(item));

        if (matches.length > 0) {
            if (matches.length === actualOrderItems.length) {
                return "psychic_service_bonus_platinum";
            }
            return "anticipation_bonus_gold";
        }
        return "standard_acknowledgment";
    }
}
