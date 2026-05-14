'use client';

import { motion } from 'framer-motion';
import { Bell, ChevronDown, Scan } from 'lucide-react';

interface MobileHeaderProps {
  greeting?: string;
  userName?: string;
  notificationCount?: number;
  onAvatarPress?: () => void;
  onNotificationPress?: () => void;
  onScanPress?: () => void;
}

export function MobileHeader({
  greeting = 'Good evening',
  userName = 'Vault Admin',
  notificationCount = 3,
  onAvatarPress,
  onNotificationPress,
  onScanPress,
}: MobileHeaderProps) {
  const firstName = (userName || 'Vault').split(' ')[0];

  return (
    <header className="flex-shrink-0 px-5 pt-4 pb-3 z-20 relative">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px
                      bg-gradient-to-r from-transparent via-vault-green/30 to-transparent" />

      <div className="flex items-center justify-between">
        {/* Left: Avatar + Greeting */}
        <motion.button
          id="mobile-header-avatar"
          onClick={onAvatarPress}
          whileTap={{ scale: 0.93 }}
          className="flex items-center gap-3 min-w-0"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-vault-green/40 to-emerald-500/20
                            border-2 border-vault-green/40 flex items-center justify-center
                            text-vault-green text-sm font-bold shadow-[0_0_12px_rgba(0,255,136,0.25)]">
              {firstName.charAt(0)}A
            </div>
            {/* Online dot */}
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-vault-green
                             border-2 border-vault-darker shadow-[0_0_6px_rgba(0,255,136,0.6)]" />
          </div>

          {/* Greeting */}
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-[15px] font-bold text-white leading-none truncate tracking-tight">{greeting}, {firstName} 👋</p>
              <ChevronDown size={13} className="text-gray-500 flex-shrink-0" />
            </div>
            <p className="text-[11px] font-medium text-vault-green/80 mt-1.5 leading-none uppercase tracking-wider">Premium Member</p>
          </div>
        </motion.button>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* QR Scan */}
          <motion.button
            id="mobile-header-scan"
            onClick={onScanPress}
            whileTap={{ scale: 0.88 }}
            className="h-9 w-9 rounded-xl bg-vault-card border border-vault-border
                       flex items-center justify-center text-gray-400
                       hover:text-white hover:border-vault-green/30 transition-colors"
          >
            <Scan size={17} />
          </motion.button>

          {/* Notifications */}
          <motion.button
            id="mobile-header-notifications"
            onClick={onNotificationPress}
            whileTap={{ scale: 0.88 }}
            className="relative h-9 w-9 rounded-xl bg-vault-card border border-vault-border
                       flex items-center justify-center text-gray-400
                       hover:text-white hover:border-vault-green/30 transition-colors"
          >
            <Bell size={17} />
            {notificationCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-vault-green
                           flex items-center justify-center text-[9px] font-bold text-vault-dark
                           shadow-[0_0_8px_rgba(0,255,136,0.5)]"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
