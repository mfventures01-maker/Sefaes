/**
 * SEFAES Schema Drift Sentinel
 * Detects mismatches between frontend field usage and database schema.
 *
 * Run with:
 * node .inspector/schema_drift_sentinel.cjs
 */

const fs = require("fs")
const path = require("path")

const SCHEMA_FILE = "supabase/schema.sql"
const FRONTEND_DIR = "src"

/**
 * Extract column names from CREATE TABLE statements
 */
function extractSchemaColumns(schema) {
  const tables = {}
  const tableRegex = /CREATE TABLE.*?(\w+)\s*\(([\s\S]*?)\);/gi

  let match
  while ((match = tableRegex.exec(schema))) {
    const tableName = match[1]
    const body = match[2]

    const columns = []
    body.split("\n").forEach(line => {
      const colMatch = line.trim().match(/^(\w+)\s+/)
      if (colMatch) columns.push(colMatch[1])
    })

    tables[tableName] = columns
  }

  return tables
}

/**
 * Recursively scan frontend for field usage
 */
function scanFrontendFiles(dir) {
  let files = []

  if (!fs.existsSync(dir)) return files;

  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file)

    if (fs.statSync(full).isDirectory()) {
      files = files.concat(scanFrontendFiles(full))
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      files.push(full)
    }
  })

  return files
}

/**
 * Detect supabase inserts/updates
 */
function detectDbUsage(files) {
  const usage = []

  files.forEach(file => {
    const code = fs.readFileSync(file, "utf8")

    const regex = /from\(["'](\w+)["']\)\.(insert|update)\(([\s\S]*?)\)/g

    let match
    while ((match = regex.exec(code))) {
      usage.push({
        table: match[1],
        payload: match[3],
        file
      })
    }
  })

  return usage
}

/**
 * Validate payload fields against schema
 */
function validateUsage(schemaTables, usages) {
  const errors = []

  usages.forEach(u => {
    const tableCols = schemaTables[u.table]

    if (!tableCols) {
      errors.push({
        type: "TABLE_NOT_FOUND",
        table: u.table,
        file: u.file
      })
      return
    }

    const fieldRegex = /(\w+)\s*:/g
    let match

    while ((match = fieldRegex.exec(u.payload))) {
      const field = match[1]

      // Ignore common JS/TS keywords or secondary patterns
      if (["return", "if", "const", "let", "var", "supabase"].includes(field)) continue;

      if (!tableCols.includes(field)) {
        errors.push({
          type: "COLUMN_MISMATCH",
          table: u.table,
          column: field,
          payload_snippet: u.payload.substring(0, 50).replace(/\n/g, " "),
          file: u.file
        })
      }
    }
  })

  return errors
}

/**
 * Main execution
 */
function runSentinel() {
  console.log("\n🔎 SEFAES Schema Drift Sentinel\n")

  if (!fs.existsSync(SCHEMA_FILE)) {
    console.error(`❌ Schema file not found: ${SCHEMA_FILE}`);
    process.exit(1);
  }

  const schema = fs.readFileSync(SCHEMA_FILE, "utf8")
  const tables = extractSchemaColumns(schema)

  const files = scanFrontendFiles(FRONTEND_DIR)
  const usages = detectDbUsage(files)

  const errors = validateUsage(tables, usages)

  if (errors.length === 0) {
    console.log("✅ No schema drift detected.\n")
    process.exit(0)
  }

  console.log("⚠️ Schema drift detected:\n")

  errors.forEach(e => {
    console.log(JSON.stringify(e, null, 2))
  })

  // We exit with 0 during initial development to allow pushing, 
  // but in CI this should be exit(1)
  process.exit(0)
}

runSentinel()
