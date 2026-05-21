'use client';

import React, { useState } from 'react';
import { useCreateComment } from './useCollaboration';
import { CommentInput } from './CommentInput';
import { CornerDownRight, MessageSquare } from 'lucide-react';

export const CommentThread = ({ comment, resourceType, resourceId }: { comment: any, resourceType: string, resourceId: string }) => {
  const [isReplying, setIsReplying] = useState(false);
  const { mutate: createComment, isPending } = useCreateComment();

  const handleReply = (content: string, mentions: string[]) => {
    createComment({
      content,
      mentionIds: mentions,
      parentId: comment.id,
      [`${resourceType}Id`]: resourceId,
    }, {
      onSuccess: () => setIsReplying(false)
    });
  };

  const formatDate = (date: string) => new Date(date).toLocaleString();

  return (
    <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/50">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold">
          {comment.user.name[0]}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-baseline">
            <span className="font-semibold text-slate-200">{comment.user.name}</span>
            <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
          </div>
          <p className="text-slate-300 mt-1 whitespace-pre-wrap">{comment.content}</p>
          
          <button 
            onClick={() => setIsReplying(!isReplying)}
            className="text-xs text-indigo-400 hover:text-indigo-300 mt-2 flex items-center gap-1 transition-colors"
          >
            <MessageSquare className="w-3 h-3" /> Reply
          </button>
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 pl-4 space-y-3 border-l-2 border-slate-700/50">
          {comment.replies.map((reply: any) => (
            <div key={reply.id} className="flex items-start gap-3 ml-4">
              <CornerDownRight className="w-4 h-4 text-slate-600 mt-1" />
              <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold mt-0.5">
                {reply.user.name[0]}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <span className="font-medium text-slate-300 text-sm">{reply.user.name}</span>
                  <span className="text-xs text-slate-500">{formatDate(reply.createdAt)}</span>
                </div>
                <p className="text-slate-400 text-sm mt-0.5 whitespace-pre-wrap">{reply.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isReplying && (
        <div className="mt-3 ml-11">
          <CommentInput onSubmit={handleReply} isSubmitting={isPending} placeholder="Write a reply..." />
        </div>
      )}
    </div>
  );
};
