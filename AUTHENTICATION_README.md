# Nakuja Inventory Management System

A comprehensive inventory management system with role-based access control, customizable teams, and authentication.

## 🚀 Features

### Authentication & Authorization
- **JWT-based authentication** with secure password hashing (bcryptjs)
- **7-tier role-based access control**:
  - `SUPER_ADMIN`: Full system access
  - `ADMIN`: Team administration
  - `SUPERVISOR`: Cross-team visibility
  - `TEAM_LEAD`: Full team management
  - `PURCHASING_LEAD`: Purchase approvals
  - `INVENTORY_LEAD`: Inventory management
  - `MEMBER`: Basic team access

### Dynamic Team Management
- **Customizable team names** - no longer restricted to "Recovery Team"
- **Team leads can update team names** via their profile
- **Multi-team organization support**
- **Role-based team access control**

### Core Functionality
- **Inventory Management**: Add, edit, and track inventory items
- **Purchase Requests**: Create and approve purchase requests
- **BOM (Bill of Materials)**: Manage project BOMs
- **Vendor Management**: Track suppliers and vendors
- **Task Management**: Eisenhower Matrix for task prioritization
- **Audit Logging**: Complete activity tracking for compliance

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Radix UI + Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + bcryptjs
- **Forms**: React Hook Form + Zod validation
- **State Management**: TanStack Query (React Query)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd nakuja-inventory-flow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database connection:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/nakuja_inventory"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Setup

### Local Development (PostgreSQL)

1. **Install PostgreSQL**
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create database**
   ```sql
   CREATE DATABASE nakuja_inventory;
   CREATE USER nakuja_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE nakuja_inventory TO nakuja_user;
   ```

3. **Update .env file**
   ```env
   DATABASE_URL="postgresql://nakuja_user:your_password@localhost:5432/nakuja_inventory"
   ```

### Vercel Deployment with PostgreSQL

1. **Create Vercel account** at [vercel.com](https://vercel.com)

2. **Set up PostgreSQL database** (recommended options):
   - **Vercel Postgres**: Built-in PostgreSQL database
   - **Railway**: Free PostgreSQL hosting
   - **Supabase**: Free PostgreSQL with additional features
   - **PlanetScale**: MySQL alternative (requires schema changes)

3. **Using Vercel Postgres**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Create Postgres database
   vercel postgres create
   ```

4. **Deploy to Vercel**:
   ```bash
   # Build the project
   npm run build
   
   # Deploy
   vercel --prod
   ```

5. **Set environment variables in Vercel**:
   - Go to your project dashboard on Vercel
   - Navigate to Settings → Environment Variables
   - Add:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `JWT_SECRET`: A secure random string

## 👥 Demo Accounts

The system comes with pre-configured demo accounts (create these manually in your database):

### Super Administrator
- **Email**: admin@nakuja.org
- **Password**: admin123
- **Access**: Full system access

### Admin Accounts (4 created as requested)
- john.admin@nakuja.org (admin123) - Recovery Team
- sarah.admin@nakuja.org (admin123) - Avionics Team  
- mike.admin@nakuja.org (admin123) - Telemetry Team
- lisa.admin@nakuja.org (admin123) - Parachute Team

### Team Leads
- alex.lead@nakuja.org (lead123) - Recovery Team Lead
- emma.lead@nakuja.org (lead123) - Avionics Team Lead

### Specialized Leads
- david.purchasing@nakuja.org (lead123) - Purchasing Lead
- maria.inventory@nakuja.org (lead123) - Inventory Lead  
- tom.supervisor@nakuja.org (lead123) - Supervisor

### Demo Members
- jane.member@nakuja.org (member123) - Team Member
- bob.member@nakuja.org (member123) - Team Member

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database
```

## 🚀 Deployment Steps for Vercel

1. **Prepare your repository**
   ```bash
   git add .
   git commit -m "Setup authentication and team management"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will auto-detect it as a Vite project

3. **Configure environment variables**
   - Add `DATABASE_URL` (your PostgreSQL connection)
   - Add `JWT_SECRET` (generate a secure random string)

4. **Deploy**
   - Vercel will automatically build and deploy
   - Run migrations on first deploy:
     ```bash
     npx prisma migrate deploy
     ```

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Tokens**: Secure session management
- **Role-Based Access**: 7-tier permission system
- **Audit Logging**: All user actions tracked
- **Token Validation**: Automatic token verification
- **CORS Protection**: Configured for production
- **Environment Variables**: Sensitive data protection

## 📝 Team Customization

Team leads can customize their team names through:
1. Login to their account
2. Navigate to Profile page
3. Update team name in team settings
4. Changes reflect immediately across the system

## 🔄 Role Permissions Summary

| Role | Team Access | Cross-Team | Purchases | Inventory | Admin |
|------|-------------|------------|-----------|-----------|-------|
| SUPER_ADMIN | All | ✅ | ✅ | ✅ | ✅ |
| ADMIN | All | ✅ | ✅ | ✅ | ✅ |
| SUPERVISOR | Own + View Others | ✅ | ❌ | ❌ | ❌ |
| TEAM_LEAD | Own Team Full | ❌ | ✅ | ✅ | ❌ |
| PURCHASING_LEAD | Own Team | ❌ | ✅ | ❌ | ❌ |
| INVENTORY_LEAD | Own Team | ❌ | ❌ | ✅ | ❌ |
| MEMBER | Own Team Read | ❌ | ❌ | ❌ | ❌ |

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready

# Reset and retry migrations
npx prisma migrate reset
npx prisma migrate dev
```

### Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

### Authentication Issues
- Verify JWT_SECRET is set in environment variables
- Check database connection for user table
- Clear browser localStorage if tokens are corrupted

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Verify all environment variables are set correctly
4. Ensure database migrations have been run

## 🎯 Next Features

- [ ] Email notifications for purchase approvals
- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] API documentation with Swagger
- [ ] Advanced audit trail filtering
- [ ] Bulk inventory operations
- [ ] Integration with external procurement systems
