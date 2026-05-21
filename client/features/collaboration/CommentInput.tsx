'use client';

import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface CommentInputProps {
  onSubmit: (content: string, mentionIds: string[]) => void;
  isSubmitting?: boolean;
  placeholder?: string;
}

export const CommentInput = ({ onSubmit, isSubmitting, placeholder = "Type your message..." }: CommentInputProps) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;
    
    // Future: implement mention extraction here.
    onSubmit(content, []);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        disabled={isSubmitting}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] resize-y"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <button
        type="submit"
        disabled={!content.trim() || isSubmitting}
        className="absolute bottom-3 right-3 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 rounded-md text-white transition-colors"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </form>
  );
};
