import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Calendar, Users, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  team_id: string;
  avatar_url?: string;
  department?: string;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  member_count?: number;
}

interface TeamStats {
  totalMembers: number;
  activeProjects: number;
  completedTasks: number;
  teamEfficiency: number;
}

const TeamManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [newTeam, setNewTeam] = useState({
    name: '',
    description: ''
  });

  // Mock stats for demo
  const [stats] = useState<TeamStats>({
    totalMembers: 24,
    activeProjects: 8,
    completedTasks: 156,
    teamEfficiency: 87
  });

  useEffect(() => {
    if (user) {
      loadTeamsAndMembers();
    }
  }, [user]);

  const loadTeamsAndMembers = async () => {
    try {
      setLoading(true);
      
      // Load teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*');
      
      if (teamsError) throw teamsError;
      
      // Load members with team info
      const { data: membersData, error: membersError } = await supabase
        .from('profiles')
        .select('*');
      
      if (membersError) throw membersError;
      
      // Calculate member counts for teams
      const teamsWithCounts = (teamsData || []).map(team => ({
        ...team,
        member_count: (membersData || []).filter(member => member.team_id === team.id).length
      }));
      
      setTeams(teamsWithCounts);
      setMembers(membersData || []);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: 'Failed to load teams and members',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([newTeam])
        .select()
        .single();
      
      if (error) throw error;
      
      setTeams(prev => [...prev, { ...data, member_count: 0 }]);
      setNewTeam({ name: '', description: '' });
      setIsCreateDialogOpen(false);
      
      toast({
        title: 'Team created successfully',
        description: `${data.name} has been added`
      });
    } catch (error) {
      toast({
        title: 'Error creating team',
        description: error instanceof Error ? error.message : 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTeam = selectedTeam === 'all' || member.team_id === selectedTeam;
    return matchesSearch && matchesTeam;
  });

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'SUPER_ADMIN': { label: 'Super Admin', className: 'bg-red-500 text-white' },
      'ADMIN': { label: 'Admin', className: 'bg-purple-500 text-white' },
      'TEAM_LEAD': { label: 'Team Lead', className: 'bg-blue-500 text-white' },
      'MEMBER': { label: 'Member', className: 'bg-green-500 text-white' }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, className: 'bg-gray-500 text-white' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || 'Unknown Team';
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">Manage team members, assignments, and collaboration</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Set up a new team for your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Team Name *</Label>
                <Input
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="Enter team name"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  placeholder="Brief team description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTeam} disabled={!newTeam.name}>
                Create Team
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                <p className="text-2xl font-bold">{stats.totalMembers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold">{stats.activeProjects}</p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                <p className="text-2xl font-bold">{stats.completedTasks}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                <p className="text-2xl font-bold">{stats.teamEfficiency}%</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
            <Progress value={stats.teamEfficiency} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="teams">Teams Overview</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
        </TabsList>

        {/* Teams Tab */}
        <TabsContent value="teams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Teams Overview</CardTitle>
              <CardDescription>Manage your organization teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                  <div className="col-span-full text-center py-8">Loading teams...</div>
                ) : teams.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    No teams found. Create your first team to get started.
                  </div>
                ) : (
                  teams.map((team) => (
                    <Card key={team.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold truncate">{team.name}</h3>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>Edit Team</DropdownMenuItem>
                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Delete Team</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          {team.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {team.description}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{team.member_count || 0} members</span>
                            </div>
                            <Badge variant="secondary">Active</Badge>
                          </div>
                          
                          <Button variant="outline" size="sm" className="w-full">
                            Manage Team
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage team member assignments and roles</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Teams</SelectItem>
                    {teams.map(team => (
                      <SelectItem key={team.id} value={team.id}>{team.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>

              {/* Members Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">Loading members...</TableCell>
                    </TableRow>
                  ) : filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No members found</TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{getInitials(member.name || '')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getRoleBadge(member.role)}</TableCell>
                        <TableCell>{getTeamName(member.team_id)}</TableCell>
                        <TableCell>{member.department || '-'}</TableCell>
                        <TableCell>{new Date(member.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>Edit Member</DropdownMenuItem>
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Assign Tasks</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamManagement;