import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg";
  className?: string;
}

const ShareButton = ({ 
  url, 
  title, 
  description = "Check this out!", 
  image,
  variant = "outline", 
  size = "sm",
  className = ""
}: ShareButtonProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData: ShareData = {
      title,
      text: description,
      url
    };

    // Add image to share data if supported and provided
    if (image && 'files' in navigator && navigator.canShare) {
      try {
        // For platforms that support file sharing, we could potentially share images
        // but for now, we'll include the image URL in the text for better compatibility
        shareData.text = `${description}\n\nImage: ${image}`;
      } catch (error) {
        console.log('Image sharing not supported, falling back to text');
      }
    }

    // Try native sharing first (mobile)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        // Fall back to clipboard if user cancels or error occurs
        console.log('Native sharing cancelled or failed, falling back to clipboard');
      }
    }

    // Fallback to clipboard with enhanced content
    try {
      let shareText = `${title}\n\n${description}\n\n${url}`;
      if (image) {
        shareText += `\n\nThumbnail: ${image}`;
      }
      
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Link Copied!",
        description: "Link with details copied to clipboard"
      });
    } catch (error) {
      // Final fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = `${title}\n\n${description}\n\n${url}`;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      toast({
        title: "Link Copied!",
        description: "Link copied to clipboard"
      });
    }
  };

  return (
    <Button
      onClick={handleShare}
      variant={variant}
      size={size}
      className={`${className}`}
      title={`Share ${title}`}
    >
      <Share className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
};

export default ShareButton;