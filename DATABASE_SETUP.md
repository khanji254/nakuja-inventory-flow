# Database Setup and Vercel Deployment Guide

## Overview
This guide will help you set up the database and deploy your inventory management app to Vercel so anyone can access and edit it.

## Step 1: Database Setup Options

### Option A: Vercel Postgres (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Create Project" or select your existing project
3. Go to "Storage" tab
4. Click "Create Database" → "Postgres"
5. Choose a database name (e.g., `inventory-db`)
6. Copy the connection string provided

### Option B: Neon.tech (Alternative)
1. Go to [Neon.tech](https://neon.tech)
2. Sign up/login and create a new project
3. Copy the PostgreSQL connection string

## Step 2: Environment Variables Setup

### For Local Development:
Create/update `.env` file:
```bash
# Replace with your actual database URL
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# For Vercel Postgres, it will look like:
# DATABASE_URL="postgres://default:password@xxxxx-pooler.xxxxx.postgres.vercel-storage.com:5432/verceldb?sslmode=require"
```

### For Vercel Deployment:
1. In your Vercel dashboard, go to your project
2. Navigate to "Settings" → "Environment Variables"
3. Add `DATABASE_URL` with your database connection string
4. Make sure to select all environments (Production, Preview, Development)

## Step 3: Database Migration

Run these commands in your terminal:

```bash
# Generate Prisma client
npx prisma generate

# Create and run the initial migration
npx prisma migrate deploy

# Optional: Seed the database with sample data
npx prisma db seed
```

## Step 4: Vercel Deployment

### Method 1: GitHub Integration (Recommended)
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Add database integration"
   git push origin main
   ```

2. In Vercel Dashboard:
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings:
     - Framework Preset: Vite
     - Build Command: `npm run build`
     - Output Directory: `dist`
   - Add environment variables (DATABASE_URL)
   - Deploy

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Step 5: Database Migration for Production

After deployment, run the migration on production:
```bash
# Set your production database URL
export DATABASE_URL="your-production-database-url"

# Run migration
npx prisma migrate deploy
```

## Step 6: Data Migration from localStorage

I've created a migration script to transfer your existing localStorage data to the database. Run this after deployment:

```bash
npm run migrate-data
```

## Step 7: Configure Build Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "postinstall": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:reset": "prisma migrate reset",
    "db:seed": "prisma db seed",
    "migrate-data": "tsx src/scripts/migrateData.ts"
  }
}
```

## Step 8: Team Access Setup

### For Team Collaboration:
1. Share the Vercel app URL with your team
2. Each team member can access and edit the inventory
3. All changes are automatically saved to the database
4. Real-time updates for collaborative editing

### User Roles (if implementing authentication):
- **Admin**: Full access to all features
- **Team Lead**: Manage team inventory and approve requests
- **Team Member**: Create requests and manage assigned items

## Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Verify DATABASE_URL is correct
   - Check if database server is running
   - Ensure SSL mode is properly configured

2. **Prisma Generate Error**:
   ```bash
   npm install @prisma/client
   npx prisma generate
   ```

3. **Migration Error**:
   ```bash
   npx prisma migrate reset
   npx prisma migrate dev --name init
   ```

4. **Build Error on Vercel**:
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in `package.json`
   - Verify TypeScript configurations

## Next Steps

1. **Authentication**: Add user authentication with NextAuth.js
2. **Real-time Updates**: Implement WebSocket for live collaboration
3. **File Uploads**: Add support for images and documents
4. **Notifications**: Email/SMS notifications for low stock
5. **Analytics**: Add dashboard with charts and insights

## Environment Variables Reference

```bash
# Required
DATABASE_URL="postgresql://..."

# Optional (for future features)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-app.vercel.app"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## Support

If you encounter any issues:
1. Check the Vercel deployment logs
2. Verify all environment variables are set
3. Ensure database permissions are correct
4. Contact support through Vercel dashboard

Your app will be accessible at: `https://your-app-name.vercel.app`

Everyone with the URL can access and edit the inventory in real-time!
