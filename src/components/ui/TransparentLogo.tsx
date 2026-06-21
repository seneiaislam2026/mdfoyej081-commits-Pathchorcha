import React, { useId } from 'react';

interface TransparentLogoProps {
  src: string;
  alt: string;
  className?: string;
  id?: string;
}

export const TransparentLogo: React.FC<TransparentLogoProps> = ({
  src,
  alt,
  className = "",
  id,
}) => {
  const filterId = useId().replace(/:/g, '-');

  if (!src) return null;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} id={id}>
      {/* 
        Dynamic SVG Filter:
        Eliminates default white (#FFFFFF) or very light backgrounds cleanly 
        by mapping near-white values directly to transparent alpha.
        This operates entirely client-side on the GPU, avoiding any Canvas elements or CORS limitations.
      */}
      <svg className="absolute w-0 h-0 hidden" aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id={`filter-remove-white-${filterId}`}>
            <feColorMatrix
              type="matrix"
              values="
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                -3.8 -3.8 -3.8 11 -0.5
              "
            />
          </filter>
        </defs>
      </svg>

      {/* Light Mode: Renders with the high-contrast transparency mask filter */}
      <img
        src={src}
        alt={alt}
        className="h-full w-auto object-contain block dark:hidden"
        style={{ filter: `url(#filter-remove-white-${filterId})` }}
      />

      {/* Dark Mode: Automatically inverts contrast colors and screens to render brilliantly on dark canvases */}
      <img
        src={src}
        alt={alt}
        className="h-full w-auto object-contain hidden dark:block invert filter"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
};
