import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Read the SQL backup file
const sqlFile = '/tmp/jee_planner_backup.sql';

if (!fs.existsSync(sqlFile)) {
  console.error(`SQL file not found: ${sqlFile}`);
  process.exit(1);
}

const sqlContent = fs.readFileSync(sqlFile, 'utf8');

// Create a pool connection
const pool = new Pool({
  connectionString: databaseUrl,
});

async function importDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database import...');
    
    // Parse statements more carefully to handle PostgreSQL dump format
    const statements = [];
    let currentStatement = '';
    let inCopyData = false;
    let copyStatement = '';
    const lines = sqlContent.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('\\')) {
        continue;
      }
      
      // Check if this is a COPY statement
      if (trimmed.startsWith('COPY ') && trimmed.endsWith(';')) {
        // Extract the COPY ... FROM stdin statement
        const copyLine = trimmed.slice(0, -1); // Remove the semicolon
        copyStatement = copyLine;
        inCopyData = true;
        
        // Collect data rows until we hit \. or another statement
        const dataRows = [];
        i++;
        while (i < lines.length) {
          const dataLine = lines[i];
          if (dataLine.trim() === '\\.') {
            // End of copy data
            inCopyData = false;
            break;
          } else if (dataLine.trim() && !dataLine.trim().startsWith('--')) {
            dataRows.push(dataLine);
          }
          i++;
        }
        
        // Convert COPY format to INSERT statements
        if (dataRows.length > 0 && copyStatement) {
          const insertStatements = convertCopyToInserts(copyStatement, dataRows);
          statements.push(...insertStatements);
        }
        continue;
      }
      
      currentStatement += ' ' + line;
      
      // Check if statement ends with semicolon
      if (trimmed.endsWith(';')) {
        const stmt = currentStatement.trim();
        if (stmt && !stmt.toUpperCase().startsWith('COPY')) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }
    
    // Helper function to convert COPY data to INSERT statements
    function convertCopyToInserts(copyStatement, dataRows) {
      // Parse: COPY public.table (col1, col2, ...) FROM stdin;
      const match = copyStatement.match(/COPY\s+(\S+)\s+\((.*?)\)/i);
      if (!match) return [];
      
      const tableName = match[1];
      const columns = match[2].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const inserts = [];
      
      for (const dataLine of dataRows) {
        const values = dataLine.split('\t').map(v => {
          // Escape single quotes and convert null to NULL
          if (v === '\\N') return 'NULL';
          return "'" + v.replace(/'/g, "''") + "'";
        });
        
        const insertStmt = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values.join(', ')});`;
        inserts.push(insertStmt);
      }
      
      return inserts;
    }
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    let executed = 0;
    for (const statement of statements) {
      try {
        await client.query(statement);
        executed++;
        
        if (executed % 10 === 0) {
          console.log(`Executed ${executed}/${statements.length} statements...`);
        }
      } catch (error) {
        // Log errors but continue with next statement
        console.warn(`\nWarning: Error executing statement: ${error.message}`);
        if (statement.length < 100) {
          console.warn(`Statement: ${statement}`);
        }
      }
    }
    
    console.log(`\n✓ Database import completed successfully!`);
    console.log(`Total statements executed: ${executed}`);
    
  } catch (error) {
    console.error('Fatal error during import:', error);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

importDatabase();
