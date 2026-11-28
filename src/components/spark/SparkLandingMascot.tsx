import type { AppTheme } from "../../utils/theme";

interface SparkLandingMascotProps {
  theme: AppTheme;
}

const STAR_FIREFLIES = [
  { className: "left-[2%] top-[18%] h-2 w-2", delay: "0s" },
  { className: "left-[24%] top-[8%] h-1.5 w-1.5", delay: "-1.5s" },
  { className: "-left-[6%] top-[38%] h-2 w-2", delay: "-2.8s" },
  { className: "left-[16%] top-[50%] h-1.5 w-1.5", delay: "-4.1s" },
  { className: "left-[86%] top-[24%] h-1.5 w-1.5", delay: "-2.2s" },
];

export function SparkLandingMascot({ theme }: SparkLandingMascotProps) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[2]">
      <style>{`
        @keyframes mascot-plane-float {
          0%, 100% { transform: translate(0, 0) rotate(-6deg); }
          50% { transform: translate(6px, -12px) rotate(1deg); }
        }
        @keyframes mascot-star-twinkle {
          0%, 100% { opacity: 0.35; transform: scale(0.82); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .mascot-plane-float { animation: mascot-plane-float 3.4s ease-in-out infinite; }
        .mascot-star-twinkle { animation: mascot-star-twinkle 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mascot-plane-float, .mascot-star-twinkle { animation: none; }
        }
      `}</style>

      {/* 深色模式小人：捧起星辉（保留原 star.png，叠加三层星辉、接触影与星尘萤火） */}
      <div
        className={`absolute bottom-2 left-[79%] h-[148px] -translate-x-1/2 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none sm:bottom-3 sm:left-[77%] sm:h-[224px] lg:h-[268px] ${
          theme === "dark" ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
        }`}
      >
        <div className="mascot-gentle-bob relative h-full w-auto">
          {/* 地面接触影与紫夜柔光 */}
          <div className="absolute -bottom-1 left-1/2 h-5 w-[74%] -translate-x-1/2 rounded-full bg-[#070214]/70 blur-md" />
          <div className="absolute -bottom-0.5 left-1/2 h-2.5 w-[56%] -translate-x-1/2 rounded-full bg-[#a78bfa]/25 blur-sm" />

          <img
            src="./mascot/star.png"
            alt=""
            draggable={false}
            decoding="async"
            className="relative z-[1] h-full w-auto drop-shadow-[0_14px_24px_rgba(12,4,32,0.52)]"
          />

          {/* 双手捧星处三层暖金星辉光晕 */}
          <div className="absolute left-[1%] top-[27%] z-[2] h-16 w-16 rounded-full bg-[#e2b0ff]/35 blur-2xl sm:h-28 sm:w-28" />
          <div className="absolute left-[5%] top-[31%] z-[2] h-12 w-12 rounded-full bg-[#fde68a]/45 blur-xl sm:h-20 sm:w-20" />
          <div className="absolute left-[10%] top-[34%] z-[2] h-7 w-7 rounded-full bg-[#fffbe6]/70 blur-md sm:h-11 sm:w-11" />

          {/* 错峰闪烁四芒星 */}
          <svg
            viewBox="0 0 40 40"
            className="mascot-star-twinkle absolute left-[7%] top-[20%] z-[3] h-5 w-5 text-[#fff4bd] sm:h-7 sm:w-7"
          >
            <path d="M20 0C22 13 27 18 40 20C27 22 22 27 20 40C18 27 13 22 0 20C13 18 18 13 20 0Z" fill="currentColor" />
          </svg>
          <svg
            viewBox="0 0 40 40"
            className="mascot-star-twinkle absolute left-[26%] top-[15%] z-[3] h-3.5 w-3.5 text-[#e9d5ff] sm:h-4 sm:w-4"
            style={{ animationDelay: "-1.1s" }}
          >
            <path d="M20 0C22 13 27 18 40 20C27 22 22 27 20 40C18 27 13 22 0 20C13 18 18 13 20 0Z" fill="currentColor" />
          </svg>
          <svg
            viewBox="0 0 40 40"
            className="mascot-star-twinkle absolute -left-[4%] top-[42%] z-[3] h-3.5 w-3.5 text-[#fff4bd] sm:h-4 sm:w-4"
            style={{ animationDelay: "-0.5s" }}
          >
            <path d="M20 0C22 13 27 18 40 20C27 22 22 27 20 40C18 27 13 22 0 20C13 18 18 13 20 0Z" fill="currentColor" />
          </svg>
          <svg
            viewBox="0 0 40 40"
            className="mascot-star-twinkle absolute left-[88%] top-[34%] z-[3] h-3 w-3 text-[#c4b5fd] sm:h-3.5 sm:w-3.5"
            style={{ animationDelay: "-1.8s" }}
          >
            <path d="M20 0C22 13 27 18 40 20C27 22 22 27 20 40C18 27 13 22 0 20C13 18 18 13 20 0Z" fill="currentColor" />
          </svg>

          {/* 缓缓升起的星尘萤火粒子 */}
          {STAR_FIREFLIES.map((firefly) => (
            <span
              key={firefly.className}
              className={`scenery-firefly-rise absolute z-[3] rounded-full bg-[#fef08a] shadow-[0_0_8px_#fde68a] ${firefly.className}`}
              style={{ animationDelay: firefly.delay }}
            />
          ))}
        </div>
      </div>

      {/* 浅色模式小人：放飞纸飞机（保留原 plane.png，叠加草坡接触影、微风轨迹与精致纸飞机） */}
      <div
        className={`absolute bottom-2 left-[19%] h-[148px] -translate-x-1/2 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none sm:bottom-3 sm:left-[21%] sm:h-[224px] lg:left-[22%] lg:h-[268px] ${
          theme === "light" ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
        }`}
      >
        <div className="mascot-gentle-bob relative h-full w-auto">
          {/* 双层草地接触影与暖日轮廓光 */}
          <div className="absolute -bottom-1 left-[52%] h-5 w-[68%] -translate-x-1/2 rounded-full bg-[#1f5e41]/30 blur-md" />
          <div className="absolute -bottom-0.5 left-[52%] h-2.5 w-[48%] -translate-x-1/2 rounded-full bg-[#14532d]/20 blur-sm" />
          <div className="absolute -right-[10%] top-[20%] h-20 w-20 rounded-full bg-[#d1fae5]/45 blur-2xl sm:h-28 sm:w-28" />

          <img
            src="./mascot/plane.png"
            alt=""
            draggable={false}
            decoding="async"
            className="relative z-[1] h-full w-auto drop-shadow-[0_14px_22px_rgba(34,89,61,0.22)]"
          />

          {/* 脚边极轻的前景草叶遮挡，融合草地景深 */}
          <svg
            viewBox="0 0 120 34"
            className="absolute -bottom-1 left-[44%] z-[2] w-20 -translate-x-1/2 sm:w-28"
          >
            <path
              d="M14 32Q20 14 12 4M28 32Q36 16 48 8M64 32Q68 15 62 6M82 32Q90 16 102 10"
              stroke="#45986d"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.72"
            />
          </svg>

          {/* 顺着伸出手方向画出的微风轨迹与悬浮多折纸飞机 */}
          <svg
            viewBox="0 0 120 72"
            className="absolute -right-[38%] top-[18%] z-[2] w-24 sm:-right-[42%] sm:top-[16%] sm:w-36"
          >
            <path
              d="M6 58C34 52 54 34 78 24"
              fill="none"
              stroke="#10b981"
              strokeOpacity="0.45"
              strokeWidth="2"
              strokeDasharray="5 6"
              strokeLinecap="round"
            />
          </svg>
          <svg
            viewBox="0 0 64 64"
            className="mascot-plane-float absolute -right-[30%] top-[12%] z-[3] w-12 drop-shadow-[0_10px_14px_rgba(4,120,87,0.24)] sm:-right-[34%] sm:top-[10%] sm:w-20"
          >
            <path d="M4 31L60 8L38 56L28 37L4 31Z" fill="#ecfdf5" stroke="#059669" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M28 37L60 8L33 44Z" fill="#a7f3d0" />
            <path d="M28 37L33 44L38 56Z" fill="#6ee7b7" />
            <path d="M4 31L60 8L28 37Z" fill="#ffffff" fillOpacity="0.88" />
          </svg>

          {/* 身侧轻盈粉白花瓣 */}
          <span className="scenery-petal-fall absolute -left-[6%] top-[34%] z-[3] h-2 w-3 rounded-full bg-[#fbcfe8] opacity-85" />
          <span
            className="scenery-petal-fall absolute right-[2%] top-[56%] z-[3] h-1.5 w-2.5 rounded-full bg-[#d1fae5] opacity-85"
            style={{ animationDelay: "-3.1s" }}
          />
        </div>
      </div>
    </div>
  );
}
