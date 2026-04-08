-- Defacto Luxury Transaction Schema (CARSS Tenant Ready)
CREATE TABLE defacto_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL, -- REQUIRED: Links this transaction to the specific CARSS business tenant
  client_signature VARCHAR(64), -- Not name, cryptographic signature
  experience_timestamp TIMESTAMPTZ DEFAULT NOW(),
  settlement_timestamp TIMESTAMPTZ, -- Post-visit, never during
  total_amount DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  discretion_level INT CHECK (discretion_level BETWEEN 1 AND 10),
  
  -- Service Intelligence
  service_velocity INTERVAL, -- Time from desire to fulfillment
  anticipation_score DECIMAL(3,2), -- How well staff anticipated needs
  discretion_breaches INT DEFAULT 0, -- Privacy violations count

  -- Items & Order Detail (JSONB for flexibility with CARSS generic items)
  items JSONB DEFAULT '[]'::jsonb, 
  
  -- Context Metadata (JSONB for deep analysis)
  table_metadata JSONB, -- Stores { privacy_score, zone, acoustics }
  staff_metadata JSONB, -- Stores { server_id, expertise, rapport }
  
  -- Client Experience Memory
  preferences_utilized JSONB, -- Which remembered preferences were used
  new_preferences_discovered JSONB, -- New preferences observed
  
  -- Settlement Elegance
  payment_method VARCHAR(50), -- 'discreet_invoice', 'membership_balance', 'cryptographic_settlement'
  receipt_delivery VARCHAR(50), -- 'encrypted_email', 'physical_handoff', 'none'
  payment_intent_id VARCHAR(100), -- specific stripe/payment intent ID
  
  -- Analytics Dimensions
  client_archetype VARCHAR(50),
  visit_purpose VARCHAR(100), -- 'deal_celebration', 'strategic_meeting', 'personal_indulgence'
  companion_dynamics VARCHAR(100), -- 'solo_contemplation', 'power_negotiation', 'social_display'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE defacto_transactions ENABLE ROW LEVEL SECURITY;

-- Create policy for tenant isolation
-- Only allow access to rows where business_id matches the authenticated user's business context
-- (This assumes the auth token contains a business_id claim or similar mechanism)
-- CREATE POLICY tenant_isolation_policy ON defacto_transactions
--   USING (business_id = auth.jwt() ->> 'business_id');

-- Invisible Indexes
CREATE INDEX idx_defacto_tenant_experience 
  ON defacto_transactions (business_id, experience_timestamp DESC);

CREATE INDEX idx_defacto_client_experience 
  ON defacto_transactions (client_signature, experience_timestamp DESC)
  WHERE discretion_level >= 7;

CREATE INDEX idx_defacto_liquid_assets 
  ON defacto_transactions USING gin (preferences_utilized)
  WHERE total_amount > 10000;
