import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Edit, Save, Calendar, MapPin, Link as LinkIcon, Camera, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { getRandomAvatarColor, getUserInitials } from "@/utils/profileUtils";
import ProfileButton, { CancelButton } from "@/components/common/ProfileButton";
import ShareButton from "@/components/common/ShareButton";
import { formatDate } from "@/utils/formatters/date";
import { UserProfile } from "@/types/app";
import { generateMusicUsername } from "@/utils/musicUsernames";

interface ProfileHeaderProps {
  profile: UserProfile;
  setProfile: (profile: UserProfile) => void;
}

const ProfileHeader = ({ profile, setProfile }: ProfileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<Partial<UserProfile>>(profile);
  const [saving, setSaving] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate a music-related username if none exists
  const displayUsername = profile.username || generateMusicUsername();

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      
      // Validate avatar URL if provided
      let validatedAvatarUrl = avatarUrl;
      if (avatarUrl && avatarUrl.trim()) {
        try {
          new URL(avatarUrl);
          // Test if the image loads
          setIsLoadingAvatar(true);
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = resolve;
            img.onerror = reject;
            img.src = avatarUrl;
          });
          setIsLoadingAvatar(false);
        } catch (error) {
          setIsLoadingAvatar(false);
          toast({
            title: "Invalid Image URL",
            description: "Please provide a valid image URL that loads correctly",
            variant: "destructive"
          });
          return;
        }
      } else {
        validatedAvatarUrl = null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: editProfile.username || displayUsername,
          bio: editProfile.bio,
          website: editProfile.website,
          location: editProfile.location,
          avatar_url: validatedAvatarUrl
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
      setIsLoadingAvatar(false);
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setEditProfile(profile);
    setAvatarUrl(profile.avatar_url || "");
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setEditProfile(profile);
    setAvatarUrl(profile.avatar_url || "");
  };

  const shareUrl = `${window.location.origin}/profile/${profile.id}`;
  const shareTitle = `${displayUsername}'s Profile`;
  const shareDescription = `Check out ${displayUsername}'s music profile on Song Monk!`;

  return (
    <Card className="bg-white/10 border-white/20 backdrop-blur-md mb-8 animate-in slide-in-from-top-4 card-responsive">
      <CardContent className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
          {/* Avatar Section */}
          <div className="relative">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-2 ring-white/20">
              <AvatarImage 
                src={isEditing ? avatarUrl : profile.avatar_url || ""} 
                alt={displayUsername}
                className={isLoadingAvatar ? "opacity-50" : ""}
              />
              <AvatarFallback className={`text-xl md:text-2xl text-white ${getRandomAvatarColor(profile.id)}`}>
                {getUserInitials(displayUsername)}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div className="absolute -bottom-2 -right-2">
                <div className="bg-purple-600 rounded-full p-2">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
            {isLoadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <div className="space-y-3">
                    <Input
                      value={editProfile.username || ''}
                      onChange={(e) => setEditProfile(prev => ({ ...prev, username: e.target.value }))}
                      className="text-2xl md:text-3xl font-bold bg-white/10 border-white/20 text-white mb-2"
                      placeholder={`Username (e.g., ${generateMusicUsername()})`}
                    />
                    <div className="space-y-2">
                      <label className="text-white/80 text-sm font-medium">Profile Picture URL</label>
                      <Input
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-white/60"
                        placeholder="https://example.com/your-image.jpg"
                        type="url"
                      />
                      <p className="text-white/60 text-xs">
                        Paste a direct link to an image (JPG, PNG, GIF). The image should be square for best results.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white truncate">{displayUsername}</h2>
                    {!profile.username && (
                      <p className="text-purple-300 text-sm italic">Generated username - click edit to customize</p>
                    )}
                    
                    {/* Email with toggle visibility */}
                    <div className="flex items-center space-x-2 mt-2">
                      <Button
                        onClick={() => setShowEmail(!showEmail)}
                        variant="ghost"
                        size="sm"
                        className="text-white/60 hover:text-white p-1 h-auto"
                      >
                        {showEmail ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      {showEmail ? (
                        <p className="text-white/70 text-sm md:text-lg truncate">{user?.email}</p>
                      ) : (
                        <p className="text-white/70 text-sm md:text-lg">••••••••@••••••</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {isEditing ? (
                  <>
                    <ProfileButton
                      onClick={handleSaveProfile}
                      disabled={saving || isLoadingAvatar}
                      icon={Save}
                      variant="default"
                    >
                      {saving ? "Saving..." : "Save"}
                    </ProfileButton>
                    <CancelButton onClick={handleCancelEditing} />
                  </>
                ) : (
                  <>
                    <ShareButton
                      url={shareUrl}
                      title={shareTitle}
                      description={shareDescription}
                      className="border-purple-500/50 bg-purple-600/20 text-purple-300 hover:bg-purple-600/30"
                    />
                    <ProfileButton
                      onClick={handleStartEditing}
                      icon={Edit}
                    >
                      Edit Profile
                    </ProfileButton>
                  </>
                )}
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  value={editProfile.bio || ''}
                  onChange={(e) => setEditProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about your musical journey..."
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