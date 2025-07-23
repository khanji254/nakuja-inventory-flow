import React, { useState } from 'react';
import { Users, UserPlus, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useTeamManagement, { TeamMember } from '@/hooks/useTeamManagement';
import { useUserProfile } from '@/hooks/useUserProfile';
import { User, Team, UserRole } from '@/types';

// Mock users data - in real app this would come from a users API/hook
const mockUsers: User[] = [
  { id: 'u1', name: 'Alex Rodriguez', email: 'alex@nakuja.com', role: 'team-lead', team: 'Recovery', permissions: ['read', 'write', 'admin'] },
  { id: 'u2', name: 'Sarah Kim', email: 'sarah@nakuja.com', role: 'team-member', team: 'Avionics', permissions: ['read', 'write'] },
  { id: 'u3', name: 'Marcus Johnson', email: 'marcus@nakuja.com', role: 'team-member', team: 'Telemetry', permissions: ['read', 'write'] },
  { id: 'u4', name: 'Emily Chen', email: 'emily@nakuja.com', role: 'team-member', team: 'Parachute', permissions: ['read', 'write'] },
  { id: 'u5', name: 'David Kim', email: 'david@nakuja.com', role: 'team-member', team: 'Recovery', permissions: ['read', 'write'] },
  { id: 'u6', name: 'Lisa Wang', email: 'lisa@nakuja.com', role: 'team-member', team: 'Avionics', permissions: ['read', 'write'] },
];

const TeamManagement: React.FC = () => {
  const { teamMembers, setTeamMembers, getMemberWorkload } = useTeamManagement();
  const { data: currentUser } = useUserProfile();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
  // Get users not already in team members
  const availableUsers = mockUsers.filter(user => 
    !teamMembers.some(member => member.id === user.id)
  );

  const addTeamMember = () => {
    if (!selectedUserId) return;
    
    const selectedUser = availableUsers.find(user => user.id === selectedUserId);
    if (!selectedUser) return;

    const member: TeamMember = {
      id: selectedUser.id,
      name: selectedUser.name,
      role: selectedUser.role === 'team-lead' ? 'Lead Engineer' : getDefaultRoleForTeam(selectedUser.team),
      team: selectedUser.team,
      skills: getDefaultSkillsForTeam(selectedUser.team),
      workload: getMemberWorkload(selectedUser.id)
    };
    
    setTeamMembers(prev => [...prev, member]);
    setSelectedUserId('');
    setIsAddMemberOpen(false);
  };

  const getDefaultRoleForTeam = (team: Team): string => {
    switch (team) {
      case 'Avionics': return 'Avionics Specialist';
      case 'Telemetry': return 'Software Developer';
      case 'Parachute': return 'Parachute Engineer';
      case 'Recovery': return 'Recovery Specialist';
      default: return 'Team Member';
    }
  };

  const getDefaultSkillsForTeam = (team: Team): string[] => {
    switch (team) {
      case 'Avionics': return ['Electronics', 'PCB Design', 'Firmware'];
      case 'Telemetry': return ['React', 'Node.js', 'Data Analysis'];
      case 'Parachute': return ['Textiles', 'CAD', 'Testing'];
      case 'Recovery': return ['Systems', 'Testing', 'Operations'];
      default: return ['General'];
    }
  };

  const removeMember = (memberId: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== memberId));
  };

  const getWorkloadColor = (workload: number) => {
    if (workload >= 90) return 'bg-red-500';
    if (workload >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <div>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>Manage team members and their workloads</CardDescription>
            </div>
          </div>
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Select User</Label>
                  <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose from available users" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-xs text-muted-foreground">{user.team} - {user.role}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {availableUsers.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    All available users have been added to the team
                  </div>
                )}
                <Button 
                  onClick={addTeamMember} 
                  className="w-full" 
                  disabled={!selectedUserId}
                >
                  Add Member
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => {
            const currentWorkload = getMemberWorkload(member.id);
            return (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {member.team}
                      </Badge>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span>Workload</span>
                          <span>{Math.round(currentWorkload)}%</span>
                        </div>
                        <Progress 
                          value={currentWorkload} 
                          className="h-2"
                        />
                      </div>
                      
                      {member.skills.length > 0 && (
                        <div className="mt-2">
                          <div className="text-xs text-muted-foreground mb-1">Skills</div>
                          <div className="flex flex-wrap gap-1">
                            {member.skills.slice(0, 2).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {member.skills.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{member.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 pt-2 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeMember(member.id)}
                          className="w-full text-red-600 hover:text-red-700"
                        >
                          <UserPlus className="h-3 w-3 mr-1 rotate-45" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamManagement;