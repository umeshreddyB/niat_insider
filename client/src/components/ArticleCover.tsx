import { useState } from 'react';

type Props = {
  src?: string;
  alt: string;
  className?: string;
};

/** Cover image with gradient fallback when missing or failed to load. */
export function ArticleCover({ src, alt, className = '' }: Props) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src && !failed);

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-violet-500/90 via-fuchsia-600/80 to-amber-500/70 ${className}`}
    >
      {showImg ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
          onError={() => setFailed(true)}
          loading="lazy"
          decoding="async"
        />
      ) : null}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center justify-center ${showImg ? 'bg-gradient-to-t from-black/25 to-transparent' : ''}`}
        aria-hidden
      >
        {!showImg ? (
          <div className="flex flex-col items-center gap-2 p-6 text-center text-white/90">
            <svg
              className="h-14 w-14 opacity-80"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3A1.5 1.5 0 001.5 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <span className="max-w-[12rem] text-xs font-medium leading-snug opacity-90">
              Add a cover URL when editing
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
