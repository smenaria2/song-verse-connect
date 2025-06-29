import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ThumbsUp, 
  MessageCircle, 
  Send, 
  Flag, 
  Trash2, 
  AlertTriangle,
  X
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  useReviewComments, 
  useReviewUpvotes, 
  useUserUpvoteStatus,
  useAddComment,
  useToggleUpvote,
  useReportComment,
  useDeleteComment
} from "@/hooks/useReviewInteractions";
import { getRandomAvatarColor, getUserInitials } from "@/utils/profileUtils";

interface ReviewInteractionsProps {
  reviewId: string;
  reviewAuthorId: string;
}

const ReviewInteractions = ({ reviewId, reviewAuthorId }: ReviewInteractionsProps) => {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);

  const { data: comments = [] } = useReviewComments(reviewId);
  const { data: upvotes = [] } = useReviewUpvotes(reviewId);
  const { data: hasUserUpvoted = false } = useUserUpvoteStatus(reviewId);
  
  const addComment = useAddComment();
  const toggleUpvote = useToggleUpvote();
  const reportComment = useReportComment();
  const deleteComment = useDeleteComment();

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      await addComment.mutateAsync({
        reviewId,
        commentText: newComment
      });
      setNewComment("");
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleToggleUpvote = async () => {
    if (!user) return;
    
    try {
      await toggleUpvote.mutateAsync(reviewId);
    } catch (error) {
      console.error('Failed to toggle upvote:', error);
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (!reportReason.trim()) return;
    
    try {
      await reportComment.mutateAsync({
        commentId,
        reason: reportReason
      });
      setReportReason("");
      setReportingCommentId(null);
    } catch (error) {
      console.error('Failed to report comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment.mutateAsync(commentId);
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="mt-3 space-y-2">
      {/* Interaction buttons - Transparent without text */}
      <div className="flex items-center space-x-3 text-sm">
        <Button
          onClick={handleToggleUpvote}
          variant="ghost"
          size="sm"
          className={`flex items-center space-x-1 px-2 py-1 h-8 rounded-md transition-all duration-200 ${
            hasUserUpvoted 
              ? 'text-purple-400 bg-purple-400/10 hover:bg-purple-400/20' 
              : 'text-white/60 bg-transparent hover:bg-white/10 hover:text-purple-400'
          }`}
          disabled={!user}
          title={`${hasUserUpvoted ? 'Remove upvote' : 'Upvote'} (${upvotes.length})`}
        >
          <ThumbsUp className={`h-4 w-4 ${hasUserUpvoted ? 'fill-current' : ''}`} />
          <span className="text-xs font-medium">{upvotes.length}</span>
        </Button>

        <Button
          onClick={() => setShowComments(!showComments)}
          variant="ghost"
          size="sm"
          className="flex items-center space-x-1 px-2 py-1 h-8 rounded-md transition-all duration-200 text-white/60 bg-transparent hover:bg-white/10 hover:text-purple-400"
          title={`${showComments ? 'Hide' : 'Show'} comments (${comments.length})`}
        >
          <MessageCircle className="h-4 w-4" />
          <span className="text-xs font-medium">{comments.length}</span>
        </Button>
      </div>

      {/* Comments section - Improved mobile layout */}
      {showComments && (
        <div className="bg-white/5 rounded-lg p-3 space-y-3 border border-white/10 max-w-full overflow-hidden">
          {/* Add comment form */}
          {user && (
            <div className="space-y-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="bg-white/10 border-white/20 text-white placeholder-white/60 text-sm resize-none min-h-[60px] w-full"
                rows={2}
                maxLength={5000}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">
                  {newComment.length}/5000
                </span>
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || addComment.isPending}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white h-8 px-3 text-xs"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Post
                </Button>
              </div>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-3 max-w-full">
            {comments.length === 0 ? (
              <p className="text-white/50 text-sm text-center py-2">
                No comments yet. {user ? 'Be the first to comment!' : 'Sign in to add a comment.'}
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white/5 rounded-lg p-3 border border-white/10 max-w-full overflow-hidden">
                  <div className="flex items-start space-x-2">
                    <Avatar className="w-6 h-6 flex-shrink-0">
                      <AvatarImage src={comment.commenter_avatar} />
                      <AvatarFallback className={`text-xs text-white ${getRandomAvatarColor(comment.commenter_id)}`}>
                        {getUserInitials(comment.commenter_username)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 max-w-full">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <span className="text-white text-sm font-medium truncate">
                            {comment.commenter_username}
                          </span>
                          <span className="text-white/50 text-xs flex-shrink-0">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        
                        {/* Comment actions - Transparent buttons */}
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {user && user.id === comment.commenter_id && (
                            <Button
                              onClick={() => handleDeleteComment(comment.id)}
                              variant="ghost"
                              size="sm"
                              className="text-white/40 hover:text-red-400 hover:bg-red-400/10 p-1 h-6 w-6 rounded-md transition-all duration-200"
                              title="Delete comment"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                          
                          {user && user.id !== comment.commenter_id && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white/40 hover:text-orange-400 hover:bg-orange-400/10 p-1 h-6 w-6 rounded-md transition-all duration-200"
                                  title="Report comment"
                                >
                                  <Flag className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-black/90 border-white/20 text-white max-w-sm mx-4">
                                <DialogHeader>
                                  <DialogTitle className="text-base">Report Comment</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <p className="text-sm text-white/70">
                                    Why are you reporting this comment?
                                  </p>
                                  <Textarea
                                    value={reportReason}
                                    onChange={(e) => setReportReason(e.target.value)}
                                    placeholder="Please describe why this comment should be reviewed..."
                                    className="bg-white/10 border-white/20 text-white placeholder-white/60 text-sm"
                                    rows={3}
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      onClick={() => {
                                        setReportReason("");
                                        setReportingCommentId(null);
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="border-white/20 text-white hover:bg-white/10 text-xs"
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => handleReportComment(comment.id)}
                                      disabled={!reportReason.trim() || reportComment.isPending}
                                      size="sm"
                                      className="bg-red-600 hover:bg-red-700 text-white text-xs"
                                    >
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      Report
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                      
                      <div className="max-w-full overflow-hidden">
                        <p className="text-white/80 text-sm break-words leading-relaxed whitespace-pre-wrap">
                          {comment.comment_text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {!user && (
            <div className="text-center py-2">
              <p className="text-white/50 text-sm">
                <a href="/auth" className="text-purple-400 hover:text-purple-300 transition-colors">
                  Sign in
                </a> to join the conversation
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewInteractions;