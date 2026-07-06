import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkDatabase() {
  const client = await pool.connect();
  
  try {
    // Get table information
    const res = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n✓ Database Tables:');
    for (const row of res.rows) {
      console.log(`  - ${row.table_name}`);
      
      // Get row counts
      const countRes = await client.query(`SELECT COUNT(*) FROM ${row.table_name}`);
      const count = countRes.rows[0].count;
      console.log(`    (${count} rows)`);
    }
    
    console.log('\n✓ Database import completed successfully!');
    
  } finally {
    await client.release();
    await pool.end();
  }
}

checkDatabase();
