type LandingTheme = "light" | "dark";

interface SparkLandingMascotProps {
  theme: LandingTheme;
}

export function SparkLandingMascot({ theme }: SparkLandingMascotProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2]">
      <style>{`
        @keyframes mascot-plane-float {
          0%, 100% { transform: translateY(0) rotate(-8deg); }
          50% { transform: translateY(-14px) rotate(-2deg); }
        }
        @keyframes mascot-star-twinkle {
          0%, 100% { opacity: 0.35; transform: scale(0.82); }
          50% { opacity: 1; transform: scale(1.12); }
        }
        .mascot-plane-float { animation: mascot-plane-float 3s ease-in-out infinite; }
        .mascot-star-twinkle { animation: mascot-star-twinkle 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mascot-plane-float, .mascot-star-twinkle { animation: none; }
        }
      `}</style>

      <div
        className={`absolute bottom-2 left-[64%] h-[150px] -translate-x-1/2 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none sm:bottom-4 sm:h-[230px] lg:h-[270px] ${
          theme === "dark" ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
        }`}
      >
        <div className="relative h-full w-auto">
          <img
            src="./mascot/star.png"
            alt=""
            draggable={false}
            decoding="async"
            className="h-full w-auto drop-shadow-[0_18px_24px_rgba(0,0,0,0.35)]"
          />
          <div className="absolute left-[2%] top-[29%] h-16 w-16 rounded-full bg-[#fff2a8] opacity-45 blur-xl motion-reduce:animate-none sm:h-24 sm:w-24" />
          <svg
            viewBox="0 0 40 40"
            className="absolute left-[7%] top-[22%] h-5 w-5 text-[#fff4bd] mascot-star-twinkle sm:h-7 sm:w-7"
          >
            <path d="M20 0C22 13 27 18 40 20C27 22 22 27 20 40C18 27 13 22 0 20C13 18 18 13 20 0Z" fill="currentColor" />
          </svg>
          <svg
            viewBox="0 0 40 40"
            className="absolute left-[24%] top-[17%] h-3 w-3 text-[#fff4bd] mascot-star-twinkle sm:h-4 sm:w-4"
            style={{ animationDelay: "-1.1s" }}
          >
            <path d="M20 0C22 13 27 18 40 20C27 22 22 27 20 40C18 27 13 22 0 20C13 18 18 13 20 0Z" fill="currentColor" />
          </svg>
          <svg
            viewBox="0 0 40 40"
            className="absolute -left-[3%] top-[42%] h-3 w-3 text-[#fff4bd] mascot-star-twinkle sm:h-4 sm:w-4"
            style={{ animationDelay: "-0.5s" }}
          >
            <path d="M20 0C22 13 27 18 40 20C27 22 22 27 20 40C18 27 13 22 0 20C13 18 18 13 20 0Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      <div
        className={`absolute bottom-2 left-[24%] h-[150px] -translate-x-1/2 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none sm:bottom-4 sm:h-[230px] lg:h-[270px] ${
          theme === "light" ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
        }`}
      >
        <div className="relative h-full w-auto">
          <img
            src="./mascot/plane.png"
            alt=""
            draggable={false}
            decoding="async"
            className="h-full w-auto drop-shadow-[0_18px_24px_rgba(63,125,91,0.2)]"
          />
          <svg
            viewBox="0 0 64 64"
            className="absolute -right-[12%] top-[24%] w-12 -rotate-12 drop-shadow-[0_8px_10px_rgba(63,125,91,0.22)] mascot-plane-float sm:w-20"
          >
            <path d="M4 30L60 8L38 56L28 36L4 30Z" fill="#c8ead8" stroke="#69ad89" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M28 36L60 8L38 56L28 36Z" fill="#9ed6b8" />
            <path d="M28 36L4 30L28 36Z" fill="#e5f5eb" />
          </svg>
        </div>
      </div>
    </div>
  );
}
