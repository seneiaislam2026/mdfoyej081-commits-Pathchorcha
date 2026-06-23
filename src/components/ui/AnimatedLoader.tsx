import React from "react";

interface AnimatedLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  className = "",
  size = "md",
}) => {
  // Determine dimensions based on size prop
  const containerSize = 
    size === "sm" ? "w-24 h-24 rounded-2xl" : 
    size === "lg" ? "w-[220px] h-[220px] rounded-[48px]" : 
    "w-[180px] h-[180px] rounded-[40px]";
    
  const logoSize = 
    size === "sm" ? "w-16 h-16" : 
    size === "lg" ? "w-[170px] h-[170px]" : 
    "w-[140px] h-[140px]";

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      {/* Container with premium breathing glow, rotating gradient ring, and bouncy hover feeling */}
      <div className="relative flex items-center justify-center">
        {/* Outer Rotating Gradient Aura (Premium visual effect) */}
        <div className="absolute inset-0 rounded-[44px] bg-gradient-to-tr from-[#0F2744] via-[#00B074]/30 to-[#ff9800]/40 blur-md opacity-75 animate-[spin_4s_linear_infinite]" />
        
        {/* Spin Ring Border */}
        <div className="absolute -inset-1.5 rounded-[42px] border-2 border-transparent border-t-[#00B074] border-r-[#ff9800]/50 animate-spin" style={{ animationDuration: '1.2s' }} />

        {/* Card housing the logo */}
        <div className={`${containerSize} bg-card flex items-center justify-center shadow-[0_12px_40px_rgba(15,39,68,0.12)] border border-slate-100/50 dark:border-slate-800/80 overflow-hidden p-4 relative z-10 animate-[pulse_1.8s_ease-in-out_infinite]`}>
          <img 
            src="https://i.ibb.co/7dGVYGFD/SAVE-20260621-201151.jpg" 
            alt="Logo" 
            className={`${logoSize} object-contain rounded-3xl animate-[bounce_1.8s_ease-in-out_infinite]`}
            style={{ 
              animationDelay: '0.1s',
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.05))"
            }}
            referrerPolicy="no-referrer" 
          />
        </div>
      </div>
      
      {/* Soft elegant progress dots */}
      <div className="flex gap-1.5 mt-6 justify-center">
        <span className="w-2.5 h-2.5 rounded-full bg-[#0F2744] dark:bg-[#00B074] animate-[bounce_1.2s_infinite_100ms]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#00B074] dark:bg-amber-500 animate-[bounce_1.2s_infinite_300ms]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff9800] dark:bg-[#00B074] animate-[bounce_1.2s_infinite_500ms]" />
      </div>
    </div>
  );
};
