/// <reference types="vite-plugin-pwa/client" />
import React, { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReloadPrompt() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        console.log('PWA Service Worker registered successfully! Checking for updates...');
        // Check immediately
        r.update().catch(err => console.error('Error checking for initial SW update:', err));
        
        // Active periodic checks every 5 minutes
        const intervalId = setInterval(() => {
          console.log('Periodic PWA background update check running...');
          r.update().catch(err => console.error('Error running strategic SW update check:', err));
        }, 1000 * 60 * 5);

        // Strategic check when user brings the app back to foreground / focus
        const handleVisibilityChange = () => {
          if (document.visibilityState === 'visible') {
            console.log('App prioritized/focused! Proactively fetching SW update check...');
            r.update().catch(err => console.error('Error running focused SW update check:', err));
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Cleanup periodic and visibility event listeners if service worker updates/rebinds
        return () => {
          clearInterval(intervalId);
          document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
      }
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  useEffect(() => {
    // If the registered check reports that a new service worker is waiting/refresh is needed,
    // immediately instruct it to download, take control, and skip waiting.
    if (needRefresh) {
      console.log('New update detected! Informing Service Worker to activate...');
      updateServiceWorker(true);
    }
  }, [needRefresh, updateServiceWorker]);

  useEffect(() => {
    // Listen to when the active controller transitions. Under 'autoUpdate', 
    // the new SW skips waiting and becomes the controller automatically.
    // Triggering a clean reload here applies the new resources instantly without blocking user's manual action.
    if ('serviceWorker' in navigator) {
      const handleControllerChange = () => {
        console.log('New PWA version is ready! Reloading page to apply updates instantly...');
        window.location.reload();
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  return null;
}
