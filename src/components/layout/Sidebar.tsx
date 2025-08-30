import { useState } from 'react';
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
  Building2,
  Edit2,
  Check,
  X,
  GitBranch
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUserTeam, useUpdateTeam } from '@/hooks/useUserProfile';
import { usePermissions } from '@/lib/permissions';

const mainNavItems = [
  { title: 'Dashboard', url: '/', icon: BarChart3 },
  { title: 'Inventory', url: '/inventory', icon: Package },
  { title: 'Purchase Requests', url: '/purchase-requests', icon: ShoppingCart },
  { title: 'Bill of Materials', url: '/bom', icon: FileText },
  { title: 'Vendors', url: '/vendors', icon: Building2 },
  { title: 'Eisenhower Matrix', url: '/eisenhower', icon: Grid3X3 },
];

const managementItems = [
  { title: 'Team Management', url: '/team-management', icon: GitBranch },
  { title: 'Users', url: '/users', icon: Users },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { data: team } = useUserTeam();
  const updateTeam = useUpdateTeam();
  const permissions = usePermissions();
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [teamName, setTeamName] = useState('');

  const canEditTeam = permissions.hasPermission('ADMIN_ALL') || permissions.hasPermission('WRITE_TEAM');

  const handleEditTeam = () => {
    setTeamName(team?.name || '');
    setIsEditingTeam(true);
  };

  const handleSaveTeam = async () => {
    if (team && teamName.trim()) {
      try {
        await updateTeam.mutateAsync({
          teamId: team.id,
          updates: { name: teamName.trim() }
        });
        setIsEditingTeam(false);
      } catch (error) {
        console.error('Error updating team:', error);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTeam(false);
    setTeamName('');
  };

  return (
    <SidebarRoot className={collapsed ? 'w-14' : 'w-64'}>
      <SidebarContent>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Rocket className="h-8 w-8 text-primary" />
            {!collapsed && (
              <div className="flex-1">
                <h1 className="text-lg font-bold">Nakuja Inventory</h1>
                <div className="flex items-center gap-2">
                  {isEditingTeam ? (
                    <div className="flex items-center gap-1 flex-1">
                      <Input
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="h-6 text-sm px-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveTeam();
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={handleSaveTeam}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">
                        {team?.name || 'Recovery Team'}
                      </p>
                      {canEditTeam && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 opacity-50 hover:opacity-100"
                          onClick={handleEditTeam}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
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