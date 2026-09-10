// One-time admin script to create the two PlateToFit user accounts.
//
// Usage:
//   SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... node scripts/seed-users.mjs \
//     user1@example.com "password1" user2@example.com "password2"
//
// The service role key is found in Supabase Dashboard > Project Settings > API.
// Never commit it or expose it to the client.

import { createClient } from "@supabase/supabase-js";

const [email1, password1, email2, password2] = process.argv.slice(2);

if (!email1 || !password1 || !email2 || !password2) {
  console.error(
    "Usage: node scripts/seed-users.mjs <email1> <password1> <email2> <password2>"
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment first."
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

for (const [email, password] of [
  [email1, password1],
  [email2, password2],
]) {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error(`Failed to create ${email}:`, error.message);
  } else {
    console.log(`Created user ${email} (id: ${data.user.id})`);
  }
}
