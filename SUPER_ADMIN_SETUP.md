# Super Admin Setup Instructions

## To create your super admin account:

1. **Sign up normally** through the app with your desired email and password
2. **Contact me immediately** after signup - I'll upgrade your account to SUPER_ADMIN role
3. **Alternative**: Use the Supabase dashboard to manually create the account

## How to upgrade a user to Super Admin:

Once you're logged in as a super admin, you can:

1. Go to **Users** page (only visible to admins)
2. Click the **Edit** button next to any user
3. Change their **Role** to the desired level:
   - **Member**: Basic access (view inventory, create purchase requests)
   - **Team Lead**: Can edit inventory, approve team purchases, manage team BOM
   - **Admin**: Full system access except super admin functions
   - **Super Admin**: Complete system control

## Default Permissions by Role:

### Team Member
- ✅ View inventory
- ✅ Submit purchase requests  
- ✅ View BOM
- ✅ Update own profile

### Team Lead  
- ✅ All team member permissions
- ✅ Edit team inventory
- ✅ Approve team purchase requests
- ✅ Manage team BOM
- ✅ View team reports
- ✅ Edit team name

### Administrator
- ✅ Full system access
- ✅ User management
- ✅ System settings
- ✅ Export/import data
- ✅ Manage all teams

### Super Admin
- ✅ All administrator permissions
- ✅ Can create other super admins
- ✅ Ultimate system control

## Current Setup:
- ✅ Authentication system is working
- ✅ Role-based access control implemented
- ✅ Database with proper RLS policies
- ✅ User management interface for admins
- ✅ Team management functionality

## Next Steps:
1. Sign up with your email
2. Let me know your email so I can upgrade your role
3. You'll then be able to manage all other users who sign up!