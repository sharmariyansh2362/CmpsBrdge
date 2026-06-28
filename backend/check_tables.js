const supabase = require('./supabaseClient');

async function checkTables() {
  const tables = ['channels', 'channel_messages', 'lost_found', 'applications', 'announcements'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table} might not exist or error:`, error.message);
    } else {
      console.log(`Table ${table} exists!`);
    }
  }
}

checkTables();
