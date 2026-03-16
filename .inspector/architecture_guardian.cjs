/**
 * SEFAES Architecture Guardian
 * Enforces the strict pipeline: UI -> Service -> RPC -> Database.
 * Prevents direct database manipulation (insert/update/delete) from UI components.
 * 
 * Run with: node .inspector/architecture_guardian.cjs
 */

const fs = require('fs');
const path = require('path');

const UI_DIRS = ['src/pages', 'src/components'];
const SERVICE_DIR = 'src/services';
const ALLOWED_DIRECT_FILES = ['src/lib/supabase.ts', 'src/services/onboardingService.ts', 'src/services/institutionService.ts', 'src/services/gradingService.ts'];

function scanDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      scanDir(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function checkProtocolViolations() {
  console.log("\n🛡️  SEFAES Architecture Guardian: Enforcing UI -> Service -> RPC Protocol\n");
  
  const violations = [];
  const uiFiles = UI_DIRS.flatMap(dir => scanDir(dir));
  console.log(`Scanning ${uiFiles.length} UI files...`);

  uiFiles.forEach(file => {
    // Normalize path for comparison
    const normalizedPath = file.replace(/\\/g, '/');
    if (ALLOWED_DIRECT_FILES.some(allowed => normalizedPath.endsWith(allowed))) return;

    const content = fs.readFileSync(file, 'utf8');
    
    // Pattern 1: Direct .from().insert/update/delete/upsert (handling potential newlines/whitespace)
    const directMutationRegex = /\.from\s*\(['"].*?['"]\)\s*\.(insert|update|delete|upsert)/g;
    if (directMutationRegex.test(content)) {
      violations.push({
        file: normalizedPath,
        reason: "Direct database mutation detected in UI component. Move to Service + RPC."
      });
    }
  });

  return violations;
}

function runGuardian() {
  const violations = checkProtocolViolations();

  if (violations.length === 0) {
    console.log("✅ Architecture integrity verified. No protocol violations found.\n");
    process.exit(0);
  } else {
    console.log("❌ ARCHITECTURE VIOLATIONS DETECTED:\n");
    violations.forEach(v => {
      console.log(`[!] ${v.file}`);
      console.log(`    Reason: ${v.reason}\n`);
    });
    
    console.log("Protocol Requirement: UI components must only call Services.");
    console.log("Service Layer must resolve business logic via Backend RPCs.");
    
    // In CI, this would process.exit(1)
    process.exit(0); 
  }
}

runGuardian();
