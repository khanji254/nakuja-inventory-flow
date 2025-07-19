import React, { useState } from 'react';
import { User, Mail, Phone, Building, Calendar, Camera, Save, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useUserProfile, useUpdateUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { Team, UserRole, UserProfile } from '@/types';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { data: profile, isLoading } = useUserProfile();
  const updateProfileMutation = useUpdateUserProfile();
  const { toast } = useToast();

  const [formData, setFormData] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    role: 'team-member' as UserRole,
    team: 'Recovery' as Team,
    phone: '',
    department: '',
    bio: '',
    skills: [],
    joinDate: new Date(),
    preferences: {
      theme: 'system',
      notifications: true,
      emailUpdates: true,
      language: 'en'
    }
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        toast({ title: 'Profile updated successfully' });
        setIsEditing(false);
      },
      onError: () => {
        toast({ 
          title: 'Error updating profile',
          description: 'Please try again later',
          variant: 'destructive'
        });
      }
    });
  };

  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(Boolean);
    setFormData({ ...formData, skills });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 bg-muted rounded-full animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6">
          <div className="h-64 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.avatar} />
            <AvatarFallback className="text-xl">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{profile.name}</h1>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{profile.role}</Badge>
              <Badge>{profile.team}</Badge>
            </div>
          </div>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  disabled={!isEditing}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={formData.department || ''}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  disabled={!isEditing}
                  placeholder="Engineering"
                />
              </div>
              <div className="space-y-2">
                <Label>Team</Label>
                <Select 
                  value={formData.team} 
                  onValueChange={(value) => setFormData({...formData, team: value as Team})}
                  disabled={!isEditing}
                >
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
              <div className="space-y-2">
                <Label>Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({...formData, role: value as UserRole})}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="team-lead">Team Lead</SelectItem>
                    <SelectItem value="team-member">Team Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Skills (comma separated)</Label>
              <Input
                value={formData.skills?.join(', ') || ''}
                onChange={(e) => handleSkillsChange(e.target.value)}
                disabled={!isEditing}
                placeholder="React, TypeScript, Python..."
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Joined {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select 
                value={formData.preferences.theme} 
                onValueChange={(value) => setFormData({
                  ...formData, 
                  preferences: { ...formData.preferences, theme: value as 'light' | 'dark' | 'system' }
                })}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for important updates
                  </p>
                </div>
                <Switch
                  checked={formData.preferences.notifications}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    preferences: { ...formData.preferences, notifications: checked }
                  })}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for activity
                  </p>
                </div>
                <Switch
                  checked={formData.preferences.emailUpdates}
                  onCheckedChange={(checked) => setFormData({
                    ...formData,
                    preferences: { ...formData.preferences, emailUpdates: checked }
                  })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {isEditing && (
          <div className="flex gap-2">
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setIsEditing(false);
                setFormData(profile);
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Profile;
