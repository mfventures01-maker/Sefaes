const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function validateHandshake() {
  console.log('🧪 RUNNING CANONICAL HANDSHAKE VALIDATION...');

  // 1. Check Institutions Naming
  const { data: instTable, error: instError } = await supabase
    .from('institutions')
    .select('institution_name, institution_type')
    .limit(1);
  
  if (instError) {
    console.error('❌ Institution Table Mismatch:', instError.message);
  } else {
    console.log('✅ Institution Table naming confirmed (institution_name, institution_type)');
  }

  // 2. Check Profiles Table
  const { data: profTable, error: profError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (profError) {
    console.error('❌ Profiles Table Missing or Error:', profError.message);
  } else {
    console.log('✅ Profiles Table exists and is accessible');
  }

  // 3. Check RPC Alignment
  const { data: rpcCheck, error: rpcError } = await supabase.rpc('resolve_teacher_identity');
  if (rpcError && rpcError.message.includes('permission denied')) {
    console.log('✅ resolve_teacher_identity RPC exists (Permission denied is expected for anon)');
  } else if (rpcError) {
    console.error('❌ resolve_teacher_identity RPC alignment failure:', rpcError.message);
  }

  console.log('\n🏁 VALIDATION COMPLETE');
}

validateHandshake();
