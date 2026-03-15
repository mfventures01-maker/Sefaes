const fs = require('fs');
const path = require('path');

// Read all supabase calls
let calls = '';
try {
  calls = fs.readFileSync('.inspector/all_supabase_calls.txt', 'utf8');
} catch (e) {
  console.error('Error reading all_supabase_calls.txt:', e.message);
  process.exit(1);
}
const lines = calls.split('\n');

// Extract insert/update payloads
const payloads = [];
const patterns = [
  /\.insert\(([^)]+)\)/g,
  /\.update\(([^)]+)\)/g,
  /\.rpc\([^,]+,\s*({[^}]+})/g
];

lines.forEach(line => {
  patterns.forEach(pattern => {
    const matches = [...line.matchAll(pattern)];
    matches.forEach(match => {
      if (match[1]) {
        payloads.push({
          file: line.split(':')[0],
          payload: match[1].trim()
        });
      }
    });
  });
});

// Write analysis
let report = '# PAYLOAD STRUCTURE ANALYSIS\n\n';
payloads.forEach(p => {
  report += `## ${p.file}\n\`\`\`\n${p.payload}\n\`\`\`\n\n`;
});

fs.writeFileSync('.inspector/payload_analysis.md', report);
console.log('✅ Payload analysis complete');
