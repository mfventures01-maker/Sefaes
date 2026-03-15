const fs = require('fs');
const path = require('path');

// Current backend functions from Step 1-3
const currentFunctions = [
  'create_school_with_classes',
  'resolve_teacher_identity',
  'queue_grading_job'
];

// Read all RPC calls
let rpcCalls = '';
try {
  rpcCalls = fs.readFileSync('.inspector/rpc_calls.txt', 'utf8');
} catch (e) {
  console.error('Error reading rpc_calls.txt:', e.message);
  process.exit(1);
}
const lines = rpcCalls.split('\n');

// Extract all called functions
const calledFunctions = new Set();
lines.forEach(line => {
  const match = line.match(/rpc\(['"]([^'"]+)['"]/);
  if (match && match[1]) {
    calledFunctions.add(match[1]);
  }
});

// Compare with current
console.log('📋 FUNCTIONS CALLED IN CODEBASE:');
calledFunctions.forEach(f => console.log(`  - ${f}`));

console.log('\n✅ CURRENT BACKEND FUNCTIONS:');
currentFunctions.forEach(f => console.log(`  - ${f}`));

console.log('\n🔴 POTENTIAL LEGACY FUNCTIONS (called but not in current set):');
calledFunctions.forEach(f => {
  if (!currentFunctions.includes(f)) {
    console.log(`  - ${f} (MAY BE LEGACY - VERIFY FIRST!)`);
  }
});

// Also find any direct table inserts that bypass functions
console.log('\n📦 DIRECT TABLE INSERTS (should use functions instead):');
let insertsContent = '';
try {
  insertsContent = fs.readFileSync('.inspector/all_supabase_calls.txt', 'utf8');
} catch (e) {
  console.error('Error reading all_supabase_calls.txt:', e.message);
  process.exit(1);
}
const insertsLines = insertsContent.split('\n');
const insertLines = insertsLines.filter(l => l.includes('.insert('));
insertLines.forEach(l => {
  const match = l.match(/from\(['"]([^'"]+)['"]\)/);
  if (match && match[1]) {
    console.log(`  - Direct insert into ${match[1]} at ${l.split(':')[0]}`);
  }
});
