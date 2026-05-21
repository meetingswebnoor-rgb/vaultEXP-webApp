'use client';
import React from 'react';
import { CheckCircle, Clock, Calendar, Mail, Phone, Users } from 'lucide-react';

export function ActivityTimeline({ activities }: { activities: any[] }) {
  if (!activities || activities.length === 0) {
    return <p className="text-sm text-gray-500">No activities recorded yet.</p>;
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
      {activities.map((activity, idx) => (
        <div key={activity.id || idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/10 bg-vault-darker text-gray-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {activity.type === 'call' && <Phone size={14} />}
            {activity.type === 'email' && <Mail size={14} />}
            {activity.type === 'meeting' && <Users size={14} />}
            {activity.type === 'task' && <CheckCircle size={14} />}
            {!['call', 'email', 'meeting', 'task'].includes(activity.type) && <Clock size={14} />}
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/[0.05] bg-white/[0.02] shadow">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-bold text-white">{activity.title}</h4>
              <time className="text-xs text-gray-500">
                {new Date(activity.scheduledFor).toLocaleDateString()}
              </time>
            </div>
            {activity.description && <p className="text-xs text-gray-400 mt-1">{activity.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
