import * as React from 'react';

export function useIsPWA() {
  const [isPWA, setIsPWA] = React.useState(false);

  React.useEffect(() => {
    const checkIsPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
        || ('standalone' in navigator && (navigator as any).standalone)
        || document.referrer.includes('android-app://');
      
      return isStandalone;
    };

    setIsPWA(checkIsPWA());

    // Optional: listen for changes if they install while app is open
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const onChange = (e: MediaQueryListEvent) => setIsPWA(e.matches || ('standalone' in navigator && (navigator as any).standalone));
    
    // Fallback support for addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', onChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(onChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', onChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(onChange);
      }
    };
  }, []);

  return isPWA;
}
