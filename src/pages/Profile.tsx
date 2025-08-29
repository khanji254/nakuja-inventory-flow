import React, { useState } from 'react';
import { Camera, Save, User, Edit2, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useUserProfile, useUserTeam, useUpdateUserProfile } from '@/hooks/useUserProfile';
import { UserRole } from '@/lib/permissions';

const Profile = () => {
  const { data: profile, isLoading } = useUserProfile();
  const { data: team } = useUserTeam();
  const updateProfile = useUpdateUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    bio: ''
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        department: profile.department || '',
        bio: profile.bio || ''
      });
    }
  }, [profile]);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Badge className="bg-red-500">Super Admin</Badge>;
      case 'ADMIN':
        return <Badge className="bg-purple-500">Admin</Badge>;
      case 'TEAM_LEAD':
        return <Badge className="bg-blue-500">Team Lead</Badge>;
      case 'MEMBER':
        return <Badge variant="outline">Member</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (isLoading || !profile) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
        <Button onClick={() => setIsEditing(!isEditing)}>
          <Edit2 className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>{profile.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold mt-4">{profile.name}</h3>
              <p className="text-muted-foreground">{profile.email}</p>
              <div className="mt-2">{getRoleBadge(profile.role)}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{team?.name || 'No Team'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                {isEditing ? (
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                ) : (
                  <div className="px-3 py-2 bg-muted rounded-md">{profile.name}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="px-3 py-2 bg-muted rounded-md">{profile.email}</div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Bio</Label>
              {isEditing ? (
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                />
              ) : (
                <div className="px-3 py-2 bg-muted rounded-md">{profile.bio || 'No bio'}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;