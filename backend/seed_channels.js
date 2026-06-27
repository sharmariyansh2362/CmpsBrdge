const supabase = require('./supabaseClient');

async function seedChannels() {
  const { data: channels, error: fetchErr } = await supabase.from('channels').select('*');
  
  if (channels && channels.length === 0) {
    console.log("No channels found. Creating a default 'General' channel...");
    
    // Get an admin or faculty user to assign as creator
    const { data: users } = await supabase.from('users').select('id').in('role', ['admin', 'faculty']).limit(1);
    
    let creatorId = null;
    if (users && users.length > 0) {
      creatorId = users[0].id;
    }
    
    const { error: insertErr } = await supabase.from('channels').insert([
      { name: 'general', description: 'General announcements and chatter', created_by: creatorId },
      { name: 'help-desk', description: 'Ask for help from faculty/admins', created_by: creatorId }
    ]);
    
    if (insertErr) {
      console.error("Failed to seed channels:", insertErr);
    } else {
      console.log("Successfully seeded default channels!");
    }
  } else {
    console.log("Channels already exist. Skipping seed.");
  }
}

seedChannels();
