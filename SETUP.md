# Setup Guide — Maintenance Requests 2.0

This guide assumes you are **not** an experienced programmer. Follow the steps in order. Every
command should be typed into a terminal exactly as shown.

- On **Windows**, use the terminal that came with VS Code (View → Terminal), which runs
  PowerShell by default.
- On **Mac/Linux**, use the Terminal app.

Where a command differs between Windows and Mac/Linux, both are shown.

---

## 1. Install the required software

### 1.1 Install Node.js

Node.js is the program that runs this website on your computer.

1. Go to https://nodejs.org
2. Download the **LTS** version (the button usually says "Recommended for most users")
3. Run the installer and accept all the default options
4. Restart VS Code / your terminal after installing

Check it worked by running:

```
node -v
npm -v
```

You should see version numbers (e.g. `v20.11.0` and `10.2.4`). If you see "command not found",
restart your computer and try again.

### 1.2 Install Git (if not already installed)

Git is used to save and upload your code to GitHub.

1. Go to https://git-scm.com/downloads
2. Download and install for your operating system, accepting the defaults

Check it worked:

```
git --version
```

---

## 2. Install the project's dependencies

Open a terminal **inside the project folder** (`c:\Maintenance Requests 2.0`) and run:

```
npm install
```

This downloads all the code libraries the project needs (Next.js, Supabase, etc.) into a
`node_modules` folder. This can take a few minutes. It is normal to see some warnings — as long
as the command finishes without a red "npm ERR!" message, it worked.

---

## 3. Create your Supabase project

Supabase is the database and login system this app uses. It is free to start.

1. Go to https://supabase.com and click **Start your project** / **Sign up**
2. Create an account (you can sign up with GitHub)
3. Click **New Project**
4. Choose:
   - **Name**: e.g. `maintenance-requests-2-0`
   - **Database Password**: create a strong password and **save it somewhere safe** (you may
     need it later; the app itself does not need it)
   - **Region**: choose the region closest to your stations
5. Click **Create new project** and wait 1-2 minutes while Supabase sets it up

---

## 4. Get your Supabase URL and API key

1. In your new Supabase project, click the **Settings** (gear icon) in the left sidebar
2. Click **API** (or **API Keys** on newer projects)
3. You will see:
   - **Project URL** — looks like `https://xxxxxxxxxxxx.supabase.co`
   - **Publishable key** (older projects call this the **`anon` `public`** key) — a long string
     starting with `sb_publishable_...` (or just letters/numbers on older projects)
   - **Secret keys** section → the **`service_role`** / secret key, starting with `sb_secret_...`.
     This one is only needed if you want Admins to be able to **invite** users directly (see
     Step 11) — it grants full access to your database, bypassing all security rules, so treat it
     like a master password. If you don't plan to use the Invite feature yet, you can skip
     copying this one for now and add it later.

Keep this browser tab open — you'll copy these into a file in the next step.

---

## 5. Configure your environment variables

Environment variables store your Supabase connection details **outside** of the code, so they
are never accidentally uploaded to GitHub.

1. In the project folder, find the file `.env.example`
2. Make a copy of it and rename the copy to `.env.local` (exact name, including the dot at the
   start)
3. Open `.env.local` in VS Code and fill in the values you copied in Step 4:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key-here
SUPABASE_SERVICE_ROLE_KEY=your-secret-key-here
```

4. Save the file.

`.env.local` is already listed in `.gitignore`, so it will **never** be uploaded to GitHub. This
is intentional. Note the difference between the first two values and the third: the
`NEXT_PUBLIC_` ones are safe to expose in the browser (that's what the prefix means), but
`SUPABASE_SERVICE_ROLE_KEY` has **no** `NEXT_PUBLIC_` prefix on purpose — it is only ever read by
server-side code and must never be shared, committed, or pasted anywhere public.

---

## 6. Create the database tables (run the SQL files)

All the SQL files live in the `/supabase` folder of this project. You will run them **in this
exact order** using the Supabase SQL Editor, because each file depends on the ones before it
(tables must exist before functions can reference them; functions must exist before security
policies can use them; and so on).

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open `supabase/schema.sql` in VS Code, copy its entire contents, paste into the SQL Editor,
   and click **Run**. This creates all the tables.
4. Click **New query** again. Open `supabase/functions.sql`, copy all of it, paste it in, and
   click **Run**. This creates the automatic request-number generator, the status-change rules,
   the activity timeline, and the audit log triggers.
5. Click **New query** again. Open `supabase/rls.sql`, copy all of it, paste it in, and click
   **Run**. This turns on Row Level Security — the rules that control who can see and change
   what data.
6. Click **New query** again. Open `supabase/storage.sql`, copy all of it, paste it in, and click
   **Run**. This creates the storage buckets for photos and documents, and their access rules.
7. Click **New query** again. Open `supabase/seed.sql`, copy all of it, paste it in, and click
   **Run**. This adds the 7 stations, departments, areas, the full maintenance category list,
   default response-time targets, and the allowed status-change rules.

If any step shows a red error message, stop and re-check that you ran the **previous** file
successfully first — most errors happen from running the files out of order.

### 6.1 (Optional) Add demo/test data

If you want realistic sample requests to explore the app with (recommended for your first look
around), also run `supabase/demo_seed.sql` the same way. This creates:

- Demo login accounts (see the table below) so you can test as different roles
- Sample equipment/assets
- Sample maintenance requests in various stages, across several stations

**Do not run `demo_seed.sql` on a real production system** — it creates test login accounts with
a shared password.

| Email | Password | Role |
|---|---|---|
| station01@demo.local | Demo12345! | Station 01 user (Hatchery) |
| station02@demo.local | Demo12345! | Station 02 user (Nursery) |
| station04@demo.local | Demo12345! | Station 04 user (Laboratory) |
| station05@demo.local | Demo12345! | Station 05 user (Sea Cage Farm) |
| engineering.manager@demo.local | Demo12345! | Engineering Manager |
| technician1@demo.local | Demo12345! | Engineer/Technician |
| technician2@demo.local | Demo12345! | Engineer/Technician |
| management@demo.local | Demo12345! | Management (view only) |

---

## 7. Configure authentication

1. In Supabase, click **Authentication** in the left sidebar, then **Providers**
2. Make sure **Email** is enabled (it is by default)
3. For local testing, it is easiest to turn **off** "Confirm email" so new accounts can sign in
   immediately:
   - Go to **Authentication** → **Sign In / Providers** → **Email**, and turn off "Confirm email"
   - (For a real production rollout, you should turn this back on so people confirm their email
     address)
4. Under **Authentication** → **URL Configuration**, set the **Site URL** to
   `http://localhost:3000` for local testing (you will change this to your real website address
   later when you deploy).

---

## 8. Create your storage buckets (already done by SQL, verify here)

Step 6 already created the storage buckets via `storage.sql`. To confirm:

1. Click **Storage** in the Supabase left sidebar
2. You should see four buckets: `request-photos`, `repair-photos`, `completion-docs`,
   `supporting-docs`
3. Each should show a lock icon (not public) — this is correct, access is controlled by the
   policies from `storage.sql`.

---

## 9. Run the application locally

In your terminal, inside the project folder:

```
npm run dev
```

Wait for it to say `Ready`, then open your browser to:

```
http://localhost:3000
```

You should see the login page.

---

## 10. Create the first Admin user

At sign-up, users pick their own Station and Department from a dropdown, so they can start
working right away. New accounts are **never** admins by default though (for safety) — every
sign-up starts as a regular Station/Department User, and only an Administrator can promote
someone to Admin, Engineering Manager, Engineer, or Management. So the very first Admin has to be
created manually, once:

1. On the running website, click **Register** and create an account with your own name, email,
   password, station and department
2. Go back to the Supabase **SQL Editor**, click **New query**, and run this command — replace
   the email with the one you just registered:

```sql
update profiles set role = 'ADMIN' where email = 'you@example.com';
```

3. Go back to the website and sign out and sign back in (or just refresh). You should now see
   **Users** and **Settings** in the left-hand navigation menu — this confirms you are an Admin.

From now on, you can promote other people to Admin (or any other role) from the **Users** page in
the app itself, instead of using SQL.

---

## 11. Assign roles to other users

There are two ways to add people, as an Admin:

**Option A - Create their account directly** (needs `SUPABASE_SERVICE_ROLE_KEY` set, from
Step 5) - best when people may not check email reliably:
1. Go to **Users** in the left navigation
2. Click **Add User**
3. Fill in their name, email, a **password** you choose for them, their **Role**, **Station**
   and **Department**
4. Click **Create Account** - the account is ready immediately, no email confirmation needed
5. Tell them the email and password directly (in person, by phone, WhatsApp, etc.) so they can
   sign in right away. They can change their password later from their own profile if they want.

**Option B - Let them self-register:**
1. Ask each person to **Register** their own account, picking their own station and department
   at sign-up
2. If they need a role other than the default "Station/Department User" (e.g. Engineering
   Manager, Engineer/Technician, Management, or Admin), go to **Users**, click the pencil icon
   next to their name, and change their **Role**. You can also correct their Station/Department
   there if they picked the wrong one at sign-up.
3. Click **Save**

---

## 12. Test the full workflow end-to-end

This is the recommended way to confirm everything is working. You can use the demo accounts from
Step 6.1, or your own test accounts.

1. **Test login**: sign in as a Station User (e.g. `station01@demo.local`)
2. **Test request creation**:
   - Click **Create Request**
   - Fill in the form and submit
   - Confirm you see a message like "Request submitted successfully" with a request number such
     as `MR-26-000001`
3. **Test the Engineering side**:
   - Sign out, sign in as `engineering.manager@demo.local`
   - Go to **Dashboard** — you should see the new request in the "New Requests" queue
   - Open the request, click **Accept**, then **Assign Technician**, choose a technician
   - Sign in as that technician (e.g. `technician1@demo.local`), open the request, click
     **Start Work**, then **Add Update** to log a diagnosis and any parts used
   - Click **Complete**, fill in the completion report, and submit
4. **Test station confirmation**:
   - Sign back in as the original Station User
   - Open the request — you should see it is now "Pending Confirmation" with a message that
     Engineering has completed the work
   - Click **Confirm Work Completed** (or try **Reopen Request** with a reason, to test that
     path too)
5. **Test feedback**: after confirming, you should see a "rate the maintenance service" form —
   submit a rating
6. **Check the timeline**: open the request again and check the **Timeline** tab — it should show
   every step you just performed, with timestamps
7. **Check notifications**: click the bell icon in the top navigation for each user — you should
   see the relevant notifications (new request submitted, request acknowledged, work completed,
   confirmation required, etc.)
8. **Check the Audit Log** (as Admin): go to **Audit Log** and confirm the status changes you made
   are listed

If every step above works, your setup is complete and correct.

---

## 13. Connect to GitHub and push your code

Your GitHub repository already exists at:

```
https://github.com/sabry9188-wq/Maintenance-Requests-2.0.git
```

From inside the project folder, run:

```
git status
```

If this says "not a git repository", initialize it first:

```
git init
git remote add origin https://github.com/sabry9188-wq/Maintenance-Requests-2.0.git
```

Then stage, commit and push your code:

```
git add .
git commit -m "Build Maintenance Requests 2.0"
git branch -M main
git push -u origin main
```

If `git push` asks you to log in, follow the on-screen instructions (GitHub may open a browser
window to authenticate).

**Reminder:** your `.env.local` file (with your real Supabase keys) is excluded by `.gitignore`
and will not be uploaded — this is correct and intentional.

---

## 14. Deploying to Vercel (optional)

Vercel is a hosting service made by the creators of Next.js, and is a common way to put this app
on the internet so your team can use it from anywhere.

1. Go to https://vercel.com and sign up (you can sign up with your GitHub account)
2. Click **Add New** → **Project**
3. Select your `Maintenance-Requests-2.0` GitHub repository and click **Import**
4. Before deploying, add your environment variables: in **Environment Variables**, add
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon/public key
5. Click **Deploy** and wait a minute or two
6. Once deployed, go back to Supabase → **Authentication** → **URL Configuration** and update the
   **Site URL** to your new Vercel web address (e.g. `https://your-app.vercel.app`)

---

## Troubleshooting

- **"Invalid API key" or blank data everywhere**: double-check `.env.local` has the correct
  Project URL and anon key from Step 4, and that you restarted `npm run dev` after editing it.
- **A SQL file fails to run**: make sure you ran the files in the exact order from Step 6
  (schema → functions → rls → storage → seed → demo_seed).
- **You can't see Users/Settings in the menu**: your account is not an Admin yet — see Step 10.
- **A station user can't see a request from another station**: this is expected and correct —
  it is enforced by Row Level Security so stations only see their own requests.
- **"You do not have permission to perform this action"**: this means Row Level Security (or the
  status-change rules) correctly blocked the action for your current role — check you are signed
  in as the right kind of user for that action.

## What's intentionally simplified in this version

These are documented, deliberate scope decisions so the system stays focused and testable:

- **CSV export** is available for all reports and the request list; PDF export is not included
  yet.
- **Notifications are in-app only** — the database is structured so email notifications
  (`notifications.channel`) can be added later without a schema change.
- **No live/real-time updates** — the notification bell and dashboards refresh when you navigate
  or take an action, rather than pushing updates instantly. This can be added later using
  Supabase Realtime.
- **Preventive maintenance** supports manual scheduling and "mark done" (which automatically
  advances the next due date) rather than an automated background scheduler.
