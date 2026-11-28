import { useEffect, useState } from "react";
import { readAppTheme, type AppTheme } from "../../utils/theme";
import { SparkLandingMascot } from "./SparkLandingMascot";

const TWINKLE_STARS = [
  { x: 112, y: 58, r: 1.8, delay: "0s", tone: "#e9d5ff" },
  { x: 184, y: 94, r: 1.3, delay: "-0.8s", tone: "#fde68a" },
  { x: 268, y: 42, r: 2.1, delay: "-1.6s", tone: "#f5f3ff" },
  { x: 356, y: 112, r: 1.4, delay: "-2.3s", tone: "#c4b5fd" },
  { x: 462, y: 66, r: 1.7, delay: "-0.4s", tone: "#fde68a" },
  { x: 548, y: 124, r: 1.2, delay: "-1.9s", tone: "#ddd6fe" },
  { x: 642, y: 48, r: 1.9, delay: "-1.1s", tone: "#e9d5ff" },
  { x: 744, y: 98, r: 1.5, delay: "-2.7s", tone: "#a5f3fc" },
  { x: 836, y: 52, r: 2.0, delay: "-0.6s", tone: "#f5f3ff" },
  { x: 928, y: 116, r: 1.3, delay: "-1.4s", tone: "#c4b5fd" },
  { x: 1034, y: 64, r: 1.8, delay: "-2.1s", tone: "#fde68a" },
  { x: 1148, y: 102, r: 1.5, delay: "-0.9s", tone: "#e9d5ff" },
  { x: 1246, y: 46, r: 2.2, delay: "-1.8s", tone: "#f5f3ff" },
  { x: 1344, y: 88, r: 1.4, delay: "-2.5s", tone: "#a5f3fc" },
  { x: 1388, y: 146, r: 1.6, delay: "-1.2s", tone: "#ddd6fe" },
];

const FALLING_PETALS = [
  { x: 196, y: 162, delay: "0s" },
  { x: 382, y: 138, delay: "-2.1s" },
  { x: 590, y: 184, delay: "-4.4s" },
  { x: 840, y: 152, delay: "-1.3s" },
  { x: 1080, y: 168, delay: "-5.7s" },
  { x: 1270, y: 140, delay: "-3.5s" },
];

interface BuildingSpec {
  x: number;
  y: number;
  w: number;
  h: number;
  tone: "back" | "mid" | "front";
  roof?: "spire" | "slant" | "crown";
}

const CITY_BUILDINGS: BuildingSpec[] = [
  { x: 18, y: 248, w: 68, h: 150, tone: "back" },
  { x: 96, y: 204, w: 84, h: 194, tone: "mid", roof: "crown" },
  { x: 190, y: 256, w: 64, h: 142, tone: "back" },
  { x: 264, y: 176, w: 94, h: 222, tone: "front", roof: "spire" },
  { x: 368, y: 232, w: 74, h: 166, tone: "mid" },
  { x: 454, y: 266, w: 66, h: 132, tone: "back" },
  { x: 534, y: 212, w: 88, h: 186, tone: "mid", roof: "slant" },
  { x: 638, y: 258, w: 72, h: 140, tone: "back" },
  { x: 724, y: 192, w: 92, h: 206, tone: "front", roof: "crown" },
  { x: 828, y: 246, w: 70, h: 152, tone: "back" },
  { x: 910, y: 156, w: 102, h: 242, tone: "front", roof: "spire" },
  { x: 1022, y: 218, w: 82, h: 180, tone: "mid" },
  { x: 1114, y: 184, w: 96, h: 214, tone: "front", roof: "crown" },
  { x: 1222, y: 234, w: 78, h: 164, tone: "mid", roof: "slant" },
  { x: 1310, y: 198, w: 98, h: 200, tone: "front" },
  { x: 1412, y: 252, w: 54, h: 146, tone: "back" },
];

function FieldScenery() {
  return (
    <svg
      viewBox="0 0 1440 440"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
    >
      <defs>
        <radialGradient id="field-sun-glow" cx="76%" cy="22%" r="48%">
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.62" />
          <stop offset="45%" stopColor="#d1fae5" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#f7f7f4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="field-hill-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e3f5ea" />
          <stop offset="100%" stopColor="#cbead8" />
        </linearGradient>
        <linearGradient id="field-hill-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c7ebd5" />
          <stop offset="100%" stopColor="#9cdab6" />
        </linearGradient>
        <linearGradient id="field-hill-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9edbb6" />
          <stop offset="100%" stopColor="#72c295" />
        </linearGradient>
        <linearGradient id="field-hill-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#75c597" />
          <stop offset="100%" stopColor="#4da377" />
        </linearGradient>
        <linearGradient id="field-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="field-path" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f5efe0" stopOpacity="0.58" />
          <stop offset="100%" stopColor="#e5dfc8" stopOpacity="0.88" />
        </linearGradient>
      </defs>

      {/* 右上暖日晨雾光晕 */}
      <rect width="1440" height="440" fill="url(#field-sun-glow)" />

      {/* 缓慢飘移的柔云 */}
      <g className="scenery-cloud-drift" fill="#ffffff" opacity="0.72">
        <path d="M180 124C180 110 194 98 212 98C222 86 244 82 262 92C276 88 296 96 300 110C314 112 322 122 318 134H180Z" />
        <path d="M980 96C980 80 998 68 1018 70C1032 54 1060 52 1080 66C1098 62 1122 72 1126 88C1142 90 1152 102 1146 114H980Z" />
      </g>

      {/* 第 1 层：远方淡雾山峦 */}
      <path
        d="M0 246C180 202 330 204 516 244C706 286 894 214 1098 228C1242 238 1352 212 1440 198V440H0Z"
        fill="url(#field-hill-far)"
      />

      {/* 第 2 层：薄荷中远坡 + 远处小风车 */}
      <path
        d="M0 282C210 242 420 278 654 294C892 310 1138 236 1440 264V440H0Z"
        fill="url(#field-hill-back)"
      />
      <g transform="translate(1168 230)" opacity="0.68">
        <path d="M-8 44L-4 0H4L8 44Z" fill="#f7f7f4" />
        <path d="M-6 0L0 -10L6 0Z" fill="#059669" opacity="0.7" />
        <g stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round">
          <path d="M0 0L-18 -14M0 0L14 -18M0 0L18 14M0 0L-14 18" />
        </g>
        <circle cx="0" cy="0" r="2.6" fill="#047857" />
      </g>

      {/* 谷间晨雾带 */}
      <rect x="0" y="256" width="1440" height="58" fill="url(#field-mist)" />

      {/* 第 3 层：暖翠主丘陵 + 蜿蜒原野小径 */}
      <path
        d="M0 318C176 280 390 294 612 340C842 388 1136 304 1440 316V440H0Z"
        fill="url(#field-hill-mid)"
      />
      <path
        d="M558 440C592 396 664 366 742 346C806 330 854 316 892 296C868 320 822 340 768 358C708 378 656 404 636 440Z"
        fill="url(#field-path)"
      />

      {/* 左侧繁茂樱翠树群（与左前方奔跑小人自然搭台） */}
      <g transform="translate(92 184)">
        <path d="M0 164C6 122 8 84 2 44" stroke="#6f5c43" strokeWidth="14" strokeLinecap="round" />
        <path d="M4 98L-34 66M4 76L44 42" stroke="#6f5c43" strokeWidth="9" strokeLinecap="round" />
        <circle cx="-38" cy="58" r="50" fill="#59ad7d" />
        <circle cx="28" cy="34" r="56" fill="#6cc190" />
        <circle cx="58" cy="74" r="44" fill="#4f9f71" />
        <circle cx="-4" cy="14" r="42" fill="#8bd7ab" />
        {/* 淡樱花点缀，呼应小人发色 */}
        <circle cx="16" cy="24" r="6" fill="#fbcfe8" opacity="0.88" />
        <circle cx="-22" cy="48" r="5" fill="#fce7f3" opacity="0.9" />
        <circle cx="42" cy="60" r="5.5" fill="#fbcfe8" opacity="0.82" />
      </g>

      {/* 右侧远景树簇 */}
      <g transform="translate(1324 226)" opacity="0.9">
        <path d="M0 110C4 80 4 56 0 28" stroke="#6f5c43" strokeWidth="10" strokeLinecap="round" />
        <circle cx="-24" cy="38" r="34" fill="#5fb484" />
        <circle cx="20" cy="24" r="40" fill="#77cb9c" />
        <circle cx="0" cy="10" r="28" fill="#98dfb6" />
        <circle cx="14" cy="18" r="4.5" fill="#fbcfe8" opacity="0.85" />
      </g>

      {/* 第 4 层：近景草坡 */}
      <path
        d="M0 374C224 342 446 376 692 386C948 396 1192 350 1440 364V440H0Z"
        fill="url(#field-hill-front)"
      />

      {/* 近景柔弧草叶与野花 */}
      <g stroke="#3c8a62" strokeWidth="3.5" strokeLinecap="round" opacity="0.58">
        <path d="M44 434Q50 400 40 374M56 434Q66 398 82 380M176 436Q182 402 172 380M192 436Q204 404 218 390M434 438Q442 406 432 386M450 438Q462 408 478 394M794 438Q800 406 792 386M812 438Q822 408 838 394M1066 436Q1074 402 1064 380M1084 436Q1096 404 1112 390M1364 434Q1372 400 1362 378M1382 434Q1392 402 1408 386" />
      </g>
      <g fill="#fff8dc" opacity="0.92">
        <circle cx="96" cy="404" r="4.5" />
        <circle cx="496" cy="412" r="4" />
        <circle cx="742" cy="418" r="4.5" />
        <circle cx="1028" cy="406" r="4" />
        <circle cx="1296" cy="400" r="4.5" />
      </g>
      <g fill="#fbcfe8" opacity="0.92">
        <circle cx="148" cy="414" r="4.8" />
        <circle cx="546" cy="422" r="4.2" />
        <circle cx="888" cy="414" r="4.8" />
        <circle cx="1182" cy="416" r="4.4" />
      </g>

      {/* 飘落花瓣 */}
      {FALLING_PETALS.map((petal, idx) => (
        <ellipse
          key={`${petal.x}-${idx}`}
          cx={petal.x}
          cy={petal.y}
          rx="5"
          ry="2.6"
          fill={idx % 2 === 0 ? "#fbcfe8" : "#ecfdf5"}
          className="scenery-petal-fall"
          style={{ animationDelay: petal.delay }}
        />
      ))}
    </svg>
  );
}

function CityScenery() {
  return (
    <svg
      viewBox="0 0 1440 440"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
    >
      <defs>
        <radialGradient id="city-moon-glow" cx="16%" cy="22%" r="36%">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.34" />
          <stop offset="45%" stopColor="#a78bfa" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#0d0620" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="city-horizon-haze" cx="62%" cy="84%" r="54%">
          <stop offset="0%" stopColor="#6d28d9" stopOpacity="0.32" />
          <stop offset="55%" stopColor="#4c1d95" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#0d0620" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="city-building-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#27174d" />
          <stop offset="100%" stopColor="#140b2e" />
        </linearGradient>
        <linearGradient id="city-building-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2f1c5d" />
          <stop offset="100%" stopColor="#150b31" />
        </linearGradient>
        <linearGradient id="city-building-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d113d" />
          <stop offset="100%" stopColor="#0b051b" />
        </linearGradient>
        <linearGradient id="city-promenade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#180d36" />
          <stop offset="100%" stopColor="#080416" />
        </linearGradient>
      </defs>

      {/* 夜空紫韵星云与左上月晕 */}
      <rect width="1440" height="440" fill="url(#city-moon-glow)" />
      <rect width="1440" height="440" fill="url(#city-horizon-haze)" />

      {/* 发光弯月 */}
      <g transform="translate(216 88)">
        <circle r="28" fill="#fef08a" opacity="0.16" />
        <path
          d="M6 -18A18 18 0 1 0 20 8A14 14 0 1 1 6 -18Z"
          fill="#fef3c7"
          opacity="0.92"
        />
      </g>

      {/* 闪烁星群 */}
      {TWINKLE_STARS.map((star, idx) => (
        <circle
          key={`${star.x}-${idx}`}
          cx={star.x}
          cy={star.y}
          r={star.r}
          fill={star.tone}
          className="scenery-star-twinkle"
          style={{
            transformBox: "fill-box",
            transformOrigin: "center",
            animationDelay: star.delay,
          }}
        />
      ))}

      {/* 柔和流星微光 */}
      <line
        x1="980"
        y1="44"
        x2="1044"
        y2="18"
        stroke="#e9d5ff"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="scenery-meteor-glide"
      />

      {/* 远景朦胧塔楼剪影 */}
      <g fill="#190e39" opacity="0.7">
        <rect x="64" y="232" width="46" height="168" rx="2" />
        <rect x="160" y="220" width="54" height="180" rx="2" />
        <rect x="424" y="210" width="52" height="190" rx="2" />
        <rect x="692" y="228" width="48" height="172" rx="2" />
        <rect x="876" y="216" width="56" height="184" rx="2" />
        <rect x="1202" y="224" width="54" height="176" rx="2" />
      </g>

      {/* 中近景紫夜天际线建筑群 */}
      {CITY_BUILDINGS.map((b, bIdx) => {
        const cols = Math.max(2, Math.floor((b.w - 22) / 22));
        const rows = Math.max(2, Math.floor((b.h - 46) / 26));
        return (
          <g key={`${b.x}-${b.w}`}>
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx="4"
              fill={`url(#city-building-${b.tone})`}
            />
            {/* 建筑受星光侧高光边 */}
            <rect
              x={b.x}
              y={b.y}
              width="2"
              height={b.h}
              fill="#a78bfa"
              opacity={b.tone === "front" ? 0.24 : 0.14}
            />
            {/* 屋顶装饰轮廓 */}
            {b.roof === "spire" && (
              <g stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round">
                <path d={`M${b.x + b.w * 0.5} ${b.y}V${b.y - 32}`} />
                <circle
                  cx={b.x + b.w * 0.5}
                  cy={b.y - 35}
                  r="3"
                  fill="#fde68a"
                  stroke="none"
                />
              </g>
            )}
            {b.roof === "crown" && (
              <rect
                x={b.x + 12}
                y={b.y - 10}
                width={b.w - 24}
                height="10"
                rx="2"
                fill={`url(#city-building-${b.tone})`}
              />
            )}
            {b.roof === "slant" && (
              <polygon
                points={`${b.x},${b.y} ${b.x + b.w},${b.y - 16} ${b.x + b.w},${b.y}`}
                fill={`url(#city-building-${b.tone})`}
              />
            )}
            {/* 错落点亮的万家灯火 */}
            {Array.from({ length: rows }, (_, row) =>
              Array.from({ length: cols }, (_, col) => {
                const seed = (row * 7 + col * 11 + bIdx * 13) % 10;
                if (seed < 3) return null;
                const fill =
                  seed >= 7 ? "#fde68a" : seed >= 5 ? "#e9d5ff" : "#a5f3fc";
                const opacity = seed >= 7 ? 0.78 : 0.48;
                return (
                  <rect
                    key={`${b.x}-${row}-${col}`}
                    x={b.x + 12 + col * 22}
                    y={b.y + 22 + row * 26}
                    width="10"
                    height="7"
                    rx="1.5"
                    fill={fill}
                    opacity={opacity}
                  />
                );
              }),
            )}
          </g>
        );
      })}

      {/* 近景紫夜步道、柔光灯影与地面衔接 */}
      <path
        d="M0 440V388C340 364 760 392 1440 368V440Z"
        fill="url(#city-promenade)"
      />
      <path
        d="M0 390C340 366 760 394 1440 370"
        stroke="#8b5cf6"
        strokeOpacity="0.34"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M84 416C420 394 880 418 1368 400"
        stroke="#c4b5fd"
        strokeWidth="2.5"
        strokeDasharray="20 22"
        opacity="0.22"
        fill="none"
      />

      {/* 暖金夜灯柱 */}
      {[320, 680, 990, 1290].map((lx) => (
        <g key={lx}>
          <path
            d={`M${lx} 386V350`}
            stroke="#5b488f"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx={lx} cy="348" r="14" fill="#fde68a" opacity="0.18" />
          <circle cx={lx} cy="348" r="3.5" fill="#fef08a" opacity="0.92" />
        </g>
      ))}
    </svg>
  );
}

export function SparkLandingScenery() {
  const [theme, setTheme] = useState<AppTheme>(readAppTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const next = readAppTheme();
      setTheme((prev) => (prev === next ? prev : next));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const isLight = theme === "light";

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[44vh] min-h-[300px] max-h-[460px] overflow-hidden sm:h-[48vh] [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%,black_100%)]"
    >
      {/* 浅色模式：全宽晨风翡翠原野画卷 */}
      <div
        className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
          isLight
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.985] opacity-0"
        }`}
      >
        <FieldScenery />
      </div>

      {/* 深色模式：全宽星夜紫韵天际线画卷 */}
      <div
        className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
          !isLight
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-[0.985] opacity-0"
        }`}
      >
        <CityScenery />
      </div>

      <SparkLandingMascot theme={theme} />
    </div>
  );
}
