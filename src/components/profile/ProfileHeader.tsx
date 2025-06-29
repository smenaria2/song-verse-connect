import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X, Calendar, MapPin, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { getRandomAvatarColor, getUserInitials } from "@/utils/profileUtils";
import ProfileButton, { CancelButton } from "@/components/common/ProfileButton";
import { formatDate } from "@/utils/formatters/date";
import { UserProfile } from "@/types/app";

interface ProfileHeaderProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

const ProfileHeader = ({ profile, setProfile }: ProfileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<Partial<UserProfile>>(profile);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: editProfile.username,
          bio: editProfile.bio,
          website: editProfile.website,
          location: editProfile.location
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data);
      setIsEditing(false);
      toast({
        title: "Success!",
        description: "Profile updated successfully!"
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-8 animate-in slide-in-from-top-4 card-responsive">
      <CardContent className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative">
            <Avatar className="w-24 h-24 md:w-32 md:h-32">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.username} />
              <AvatarFallback className={`text-xl md:text-2xl text-white ${getRandomAvatarColor(profile.id)}`}>
                {getUserInitials(profile.username)}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <Input
                    value={editProfile.username || ''}
                    onChange={(e) => setEditProfile(prev => ({ ...prev, username: e.target.value }))}
                    className="text-2xl md:text-3xl font-bold bg-white/10 border-white/20 text-white mb-2"
                    placeholder="Username"
                  />
                ) : (
                  <h2 className="text-2xl md:text-3xl font-bold text-white truncate">{profile.username}</h2>
                )}
                <p className="text-white/70 text-sm md:text-lg truncate">{user?.email}</p>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {isEditing ? (
                  <>
                    <ProfileButton
                      onClick={handleSaveProfile}
                      disabled={saving}
                      icon={Save}
                      variant="default"
                    >
                      {saving ? "Saving..." : "Save"}
                    </ProfileButton>
                    <CancelButton
                      onClick={() => {
                        setIsEditing(false);
                        setEditProfile(profile);
                      }}
                    />
                  </>
                ) : (
                  <ProfileButton
                    onClick={() => setIsEditing(true)}
                    icon={Edit}
                  >
                    Edit Profile
                  </ProfileButton>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={editProfile.bio || ''}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="bg-white/10 border-white/20 text-white"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    value={editProfile.location || ''}
                    onChange={(e) => setEditProfile(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Location"
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Input
                    value={editProfile.website || ''}
                    onChange={(e) => setEditProfile(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="Website URL"
                    className="bg-white/10 border-white/20 text-white"
                  />
                </div>
              </div>
            ) : (
              <>
                {profile.bio && (
                  <p className="text-white/80 text-sm md:text-base">{profile.bio}</p>
                )}
                
                <div className="flex flex-wrap gap-4 text-white/70 text-xs md:text-sm">
                  {profile.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center min-w-0">
                      <LinkIcon className="h-4 w-4 mr-1 flex-shrink-0" />
                      <a href={profile.website} className="text-purple-400 hover:underline truncate min-w-0" target="_blank" rel="noopener noreferrer">
                        {profile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span>Joined {formatDate(profile.created_at)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;