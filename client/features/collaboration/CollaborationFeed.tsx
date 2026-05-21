'use client';

import React, { useState } from 'react';
import { useComments, useCreateComment } from './useCollaboration';
import { CommentThread } from './CommentThread';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { CommentInput } from './CommentInput';

interface CollaborationFeedProps {
  resourceType: 'business' | 'property' | 'document' | 'investment';
  resourceId: string;
}

export const CollaborationFeed = ({ resourceType, resourceId }: CollaborationFeedProps) => {
  const { data: comments, isLoading } = useComments(resourceType, resourceId);
  const { mutate: createComment, isPending } = useCreateComment();
  const [showInput, setShowInput] = useState(false);

  const handlePost = (content: string, mentions: string[]) => {
    createComment({
      content,
      mentionIds: mentions,
      [`${resourceType}Id`]: resourceId,
    }, {
      onSuccess: () => setShowInput(false)
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden backdrop-blur-sm shadow-xl">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
        <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
          Team Collaboration
        </h3>
        <button 
          onClick={() => setShowInput(!showInput)}
          className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors"
        >
          <MessageSquarePlus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[600px]">
        {showInput && (
          <div className="mb-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            <CommentInput onSubmit={handlePost} isSubmitting={isPending} placeholder="Start a new discussion..." />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
        ) : comments?.length === 0 ? (
          <div className="text-center p-8 text-slate-400 border border-dashed border-slate-700 rounded-lg bg-slate-800/20">
            No discussions yet. Be the first to start one!
          </div>
        ) : (
          comments?.map((comment: any) => (
            <CommentThread key={comment.id} comment={comment} resourceType={resourceType} resourceId={resourceId} />
          ))
        )}
      </div>
    </div>
  );
};
