const fs = require('fs');
const path = require('path');

// Find onboarding wizard files
const wizardFiles = [];
const walkDir = (dir) => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.match(/\.(tsx|ts|jsx|js)$/) && 
               (file.toLowerCase().includes('wizard') || 
                file.toLowerCase().includes('onboard') ||
                file.toLowerCase().includes('create-school') ||
                file.toLowerCase().includes('registration'))) {
      wizardFiles.push(fullPath);
    }
  });
};

walkDir('./src');

console.log('📋 ONBOARDING WIZARD FILES FOUND:');
wizardFiles.forEach(f => console.log(`  - ${f}`));

// Audit each wizard file
wizardFiles.forEach(file => {
  console.log(`\n🔍 AUDITING: ${file}`);
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for school creation pattern
  if (content.includes('create_school_with_classes')) {
    console.log('  ✅ Using correct RPC function');
  } else if (content.includes('supabase.from(\'schools\')')) {
    console.log('  ❌ Using direct schools insert - MUST FIX');
  }
  
  // Check for teacher resolution
  if (content.includes('resolve_teacher_identity')) {
    console.log('  ✅ Using correct teacher resolution');
  } else if (content.includes('teachers') && content.includes('user_id')) {
    console.log('  ⚠️  Check teacher lookup pattern - should use resolve_teacher_identity()');
  }
  
  // Check payload structure
  const insertMatches = [...content.matchAll(/\.insert\(\s*({[\s\S]+?})/g)];
  insertMatches.forEach(match => {
    console.log(`\n  📦 Found insert payload: ${match[1].substring(0, 100)}...`);
    console.log('     Verify this matches backend schema');
  });
});

console.log('\n✅ ONBOARDING AUDIT COMPLETE');
