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

const TeamManagement: React.FC = () => {
  const { teamMembers, setTeamMembers, getMemberWorkload } = useTeamManagement();
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    name: '',
    role: '',
    team: 'Recovery',
    skills: [],
    workload: 0
  });

  const addTeamMember = () => {
    if (newMember.name && newMember.role) {
      const member: TeamMember = {
        id: `tm-${Date.now()}`,
        name: newMember.name,
        role: newMember.role,
        team: newMember.team || 'Recovery',
        skills: newMember.skills || [],
        workload: getMemberWorkload(`tm-${Date.now()}`)
      };
      setTeamMembers(prev => [...prev, member]);
      setNewMember({ name: '', role: '', team: 'Recovery', skills: [], workload: 0 });
      setIsAddMemberOpen(false);
    }
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
                  <Label>Name</Label>
                  <Input
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter member name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Input
                    value={newMember.role}
                    onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Enter role"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Team</Label>
                  <Select value={newMember.team} onValueChange={(value) => setNewMember(prev => ({ ...prev, team: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Recovery">Recovery</SelectItem>
                      <SelectItem value="Avionics">Avionics</SelectItem>
                      <SelectItem value="Telemetry">Telemetry</SelectItem>
                      <SelectItem value="Parachute">Parachute</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={addTeamMember} className="w-full">Add Member</Button>
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