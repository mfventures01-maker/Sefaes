const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SRC_DIR = './src'; 
const BACKUP_DIR = './.inspector/backups';

// Create backup
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

console.log('🔄 BACKING UP CURRENT CODEBASE...');
const timestamp = Date.now();
const backupName = `src_backup_${timestamp}`;
const backupPath = path.join(BACKUP_DIR, backupName);

try {
  // Simple check for OS
  if (process.platform === 'win32') {
    execSync(`xcopy /E /I /Y "${SRC_DIR}" "${backupPath}"`);
  } else {
    execSync(`cp -r "${SRC_DIR}" "${backupPath}"`);
  }
  console.log(`✅ Backup created at ${backupPath}`);
} catch (e) {
  console.error('❌ Backup failed:', e.message);
  // Continue anyway if backup fails, or exit? 
  // For safety, let's exit if we can't backup.
  process.exit(1);
}

// Patterns to replace
const replacements = [
  {
    // Replace direct schools insert with RPC
    pattern: /supabase\s*\.\s*from\(['"]schools['"]\)\s*\.\s*insert\(/g,
    replacement: 'supabase.rpc(\'create_school_with_classes\', '
  },
  {
    // Replace teacher context fetching
    pattern: /supabase\s*\.\s*from\(['"]teachers['"]\)\s*\.\s*select\(\s*['"]\*['"]\s*\)\s*\.\s*eq\(\s*['"]user_id['"]\s*,\s*auth\s*\.\s*uid\(\)\s*\)/g,
    replacement: 'supabase.rpc(\'resolve_teacher_identity\')'
  },
  {
    // Ensure grading_status is set in answer_scripts
    pattern: /supabase\s*\.\s*from\(['"]answer_scripts['"]\)\s*\.\s*insert\(\s*({[\s\S]+?})\s*\)/g,
    replacement: (match, p1) => {
      if (!p1.includes('grading_status')) {
        // Try to insert grading_status: 'pending' before the closing brace
        return match.replace(/}\s*\)$/, ", grading_status: 'pending' })");
      }
      return match;
    }
  }
];

// Walk through files
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.match(/\.(tsx|ts|jsx|js)$/)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      replacements.forEach(r => {
        const newContent = content.replace(r.pattern, r.replacement);
        if (newContent !== content) {
          content = newContent;
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`  ✅ Updated ${fullPath}`);
      }
    }
  });
}

console.log(' PROCESSING FILES...');
walkDir(SRC_DIR);

console.log('\n✅ REFACTORING COMPLETE');
console.log(`📦 Backup saved to ${BACKUP_DIR}`);
console.log('\n⚠️  NEXT STEPS:');
console.log('1. Review changes in each file');
console.log('2. Run TypeScript compiler: tsc --noEmit');
console.log('3. Test onboarding wizard flow');
console.log('4. Commit changes to git');
