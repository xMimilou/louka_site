# Setup Guide

## 1. Install dependencies
npm install

## 2. Create Supabase project
1. Go to supabase.com → New project
2. Copy your Project URL and anon key

## 3. Configure environment
cp .env.local.example .env.local
# Fill in your Supabase URL and keys

## 4. Run the SQL schema
In Supabase dashboard → SQL Editor → paste contents of supabase-schema.sql → Run

## 5. Create storage bucket
Supabase dashboard → Storage → New bucket → Name: "uploads" → Public: yes

## 6. Create admin user
Supabase dashboard → Authentication → Users → Add user
Use your email and a strong password.

## 7. Run the dev server
npm run dev
# Site: http://localhost:3000
# Admin: http://localhost:3000/admin

## 8. Deploy to Vercel
vercel deploy
# Add environment variables in Vercel dashboard
