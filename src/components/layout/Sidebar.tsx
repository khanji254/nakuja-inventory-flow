import { NavLink } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Users, 
  Settings,
  Rocket,
  Grid3X3,
  Calendar,
  Building2
} from 'lucide-react';
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const mainNavItems = [
  { title: 'Dashboard', url: '/', icon: BarChart3 },
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'Purchase Requests', url: '/purchase-requests', icon: ShoppingCart },
  { title: 'Bill of Materials', url: '/bom', icon: FileText },
  { title: 'Vendors', url: '/vendors', icon: Building2 },
  { title: 'Eisenhower Matrix', url: '/eisenhower', icon: Grid3X3 },
];

const managementItems = [
  { title: 'Users', url: '/users', icon: Users },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <SidebarRoot className={collapsed ? 'w-14' : 'w-64'}>
      <SidebarContent>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Rocket className="h-8 w-8 text-primary" />
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold">Nakuja Inventory</h1>
                <p className="text-sm text-muted-foreground">Recovery Team</p>
              </div>
            )}
          </div>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-muted text-primary font-medium'
                          : 'hover:bg-muted/50'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {managementItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-muted text-primary font-medium'
                          : 'hover:bg-muted/50'
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarRoot>
  );
};