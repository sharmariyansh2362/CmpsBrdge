const supabase = require('./supabaseClient');

async function testInsert() {
  // We need a valid user ID. Let's get the first user.
  const { data: users } = await supabase.from('users').select('id').limit(1);
  if (!users || users.length === 0) {
    console.log("No users found to test with");
    return;
  }
  const userId = users[0].id;

  const { data, error } = await supabase.from('lost_found').insert({
    title: 'Test Lost',
    description: 'Test description',
    category: 'lost',
    status: 'active',
    posted_by: userId
  }).select();

  if (error) {
    console.error("Error inserting into lost_found:", error.message);
  } else {
    console.log("Success inserting into lost_found:", data);
  }
}

testInsert();
