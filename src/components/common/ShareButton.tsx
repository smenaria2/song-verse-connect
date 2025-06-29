import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  url: string;
  title: string;
  description?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg";
  className?: string;
}

const ShareButton = ({ 
  url, 
  title, 
  description = "Check this out!", 
  variant = "outline", 
  size = "sm",
  className = ""
}: ShareButtonProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareData = {
      title,
      text: description,
      url
    };

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

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link Copied!",
        description: "Link copied to clipboard"
      });
    } catch (error) {
      // Final fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
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