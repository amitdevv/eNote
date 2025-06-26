# Supabase Integration Setup Guide

This guide will help you set up Supabase database and Google authentication for your eNote app.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A Google Cloud Console account for Google OAuth setup

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter a project name (e.g., "eNote")
5. Enter a database password (save this!)
6. Select a region close to you
7. Click "Create new project"

## Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings > API**
2. Copy the following values:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

## Step 3: Set Up Your Environment Variables

1. In your project root, update the `.env` file:
```bash
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

Replace `your_project_url_here` and `your_anon_key_here` with the values from Step 2.

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to the **SQL Editor**
2. Copy the contents of `database-schema.sql` from your project root
3. Paste it into the SQL Editor
4. Click "Run" to execute the schema

This will create:
- `notes` table for storing your notes
- `folders` table for organizing notes
- Row Level Security (RLS) policies to ensure users can only access their own data
- Indexes for better performance
- Triggers for automatic timestamp updates

## Step 5: Set Up Google OAuth

### 5.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to **APIs & Services > Library**
   - Search for "Google+ API"
   - Click it and press "Enable"
4. Create OAuth credentials:
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > OAuth 2.0 Client IDs**
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://your-supabase-project-url.supabase.co/auth/v1/callback`
     - For local development: `http://localhost:5173/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**

### 5.2 Configure Google OAuth in Supabase

1. In your Supabase dashboard, go to **Authentication > Providers**
2. Find **Google** and click to enable it
3. Enter your Google OAuth credentials:
   - **Client ID**: The Client ID from Google Cloud Console
   - **Client Secret**: The Client Secret from Google Cloud Console
4. Click "Save"

## Step 6: Install Dependencies and Run

1. Install the new Supabase dependency:
```bash
npm install
```

2. Start your development server:
```bash
npm run dev
```

## Step 7: Test the Integration

1. Open your app in the browser
2. You should see a login page with "Continue with Google"
3. Click the Google sign-in button
4. Complete the Google authentication flow
5. You should be redirected to your notes app
6. Try creating a note and folder to test the database integration

## Features Included

✅ **Google Authentication** - Secure login with Google accounts
✅ **User Data Isolation** - Each user's data is completely separate
✅ **Real-time Sync** - Notes and folders sync across devices
✅ **Secure Database** - Row Level Security ensures data privacy
✅ **Automatic Backups** - Supabase handles database backups
✅ **Scalable** - Supabase scales automatically with your usage

## Troubleshooting

### Common Issues

**1. "Missing Supabase environment variables" error**
- Make sure your `.env` file has the correct values
- Restart your development server after updating environment variables

**2. Google sign-in not working**
- Verify your Google OAuth redirect URIs are correct
- Make sure Google+ API is enabled in Google Cloud Console
- Check that your Google OAuth credentials are correctly entered in Supabase

**3. Database connection issues**
- Verify your Supabase URL and anon key are correct
- Check that the database schema was executed successfully
- Look for any SQL errors in the Supabase logs

**4. RLS (Row Level Security) issues**
- Make sure the RLS policies were created during schema setup
- Check that your user is authenticated when trying to access data

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Check the Supabase dashboard logs
3. Verify all environment variables are set correctly
4. Ensure the database schema was applied successfully

## Next Steps

Once everything is working:
1. Consider setting up a production environment
2. Configure custom domains for your Supabase project
3. Set up monitoring and alerts
4. Review and adjust RLS policies as needed

Your eNote app is now fully integrated with Supabase! 🎉 