import { useEffect, useState } from "react";

function readDocumentTheme(): "dark" | "light" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyTheme(next: "dark" | "light") {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("fb-theme", next);
  } catch {
    // 隐私模式或存储受限时静默忽略
  }
}

interface WingPaletteRefs {
  shadowFill: string;
  upperFill: string;
  midFill: string;
  lowerFill: string;
  covertFill: string;
  stroke: string;
  strokeOpacity: number;
  leadingEdge: string;
  leadingOpacity: number;
  rachis: string;
  rachisOpacity: number;
  sparkFill: string;
}

const DARK_WING_REFS: WingPaletteRefs = {
  shadowFill: "#1a0736",
  upperFill: "url(#seraph-dark-upper)",
  midFill: "url(#seraph-dark-mid)",
  lowerFill: "url(#seraph-dark-lower)",
  covertFill: "url(#seraph-dark-covert)",
  stroke: "#d8b4fe",
  strokeOpacity: 0.72,
  leadingEdge: "#ffffff",
  leadingOpacity: 0.88,
  rachis: "#f3e8ff",
  rachisOpacity: 0.72,
  sparkFill: "#e2b0ff",
};

const LIGHT_WING_REFS: WingPaletteRefs = {
  shadowFill: "#064e3b",
  upperFill: "url(#seraph-light-upper)",
  midFill: "url(#seraph-light-mid)",
  lowerFill: "url(#seraph-light-lower)",
  covertFill: "url(#seraph-light-covert)",
  stroke: "#047857",
  strokeOpacity: 0.48,
  leadingEdge: "#ffffff",
  leadingOpacity: 0.96,
  rachis: "#047857",
  rachisOpacity: 0.34,
  sparkFill: "#10b981",
};

/**
 * 单侧炽天使三翼（上冠翼 + 中主翼 + 下护翼），右侧通过镜像复用以保证严格对称
 */
function SeraphHalfWing({ refs }: { refs: WingPaletteRefs }) {
  return (
    <>
      {/* ===== 第 1 对：高扬上冠翼（42° 斜上展开） ===== */}
      <g>
        {/* 3D 底层投影羽 */}
        <g transform="translate(-5 7)" opacity="0.52">
          <path
            d="M470 174 C402 118 258 46 92 14 C122 40 162 56 204 68 C154 66 122 72 98 84 C144 96 196 102 248 104 C206 112 174 122 152 134 C218 138 296 138 378 148 C414 154 446 164 470 174 Z"
            fill={refs.shadowFill}
          />
        </g>

        {/* 上翼 5 片叠压主飞羽 */}
        <path
          d="M470 174 C402 118 258 44 90 12 C136 48 214 78 312 104 L468 170 Z"
          fill={refs.upperFill}
          stroke={refs.stroke}
          strokeOpacity={refs.strokeOpacity}
          strokeWidth="0.95"
        />
        <path
          d="M466 172 C390 126 242 74 96 76 C158 96 248 112 344 128 L466 172 Z"
          fill={refs.upperFill}
          stroke={refs.stroke}
          strokeOpacity={refs.strokeOpacity}
          strokeWidth="0.9"
        />
        <path
          d="M464 173 C384 138 252 104 128 112 C196 124 276 132 362 142 L464 173 Z"
          fill={refs.upperFill}
          stroke={refs.stroke}
          strokeOpacity={refs.strokeOpacity}
          strokeWidth="0.9"
        />
        <path
          d="M464 175 C390 148 282 128 178 138 C242 146 312 150 388 156 L464 175 Z"
          fill={refs.covertFill}
          stroke={refs.stroke}
          strokeOpacity={refs.strokeOpacity * 0.85}
          strokeWidth="0.85"
        />
        {/* 上翼内层覆羽与发光羽轴 */}
        <path
          d="M466 172 C414 134 334 94 236 68 C274 94 328 116 392 136 L466 172 Z"
          fill={refs.covertFill}
          opacity="0.85"
        />
        <path
          d="M468 172 C390 116 248 48 96 16 M464 172 C382 126 248 80 108 78 M462 173 C384 140 264 110 142 114"
          fill="none"
          stroke={refs.rachis}
          strokeOpacity={refs.rachisOpacity}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M470 174 C402 118 258 44 90 12"
          fill="none"
          stroke={refs.leadingEdge}
          strokeOpacity={refs.leadingOpacity}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>

      {/* ===== 第 2 对：宏展中主翼（水平外铺最宽翼） ===== */}
      <g>
        {/* 3D 底层投影羽 */}
        <g transform="translate(-6 9)" opacity="0.52">
          <path
            d="M464 192 C368 164 196 138 22 146 C76 164 140 174 206 180 C134 184 74 192 38 204 C104 208 174 206 244 204 C172 214 114 226 76 242 C154 238 238 224 326 212 C384 204 432 198 464 192 Z"
            fill={refs.shadowFill}
          />
        </g>

        {/* 中翼 6 片错落修长飞羽 */}
        <path
          d="M464 190 C366 156 196 132 18 144 C98 166 226 176 364 186 L464 192 Z"
          fill={refs.midFill}
          stroke={refs.stroke}
          strokeOpacity={refs.strokeOpacity}
          strokeWidth="1"
        />
        <path
          d="M462 191 C364 168 202 154 34 180 C122 190 242 190 368 192 L462 193 Z"
          fill={refs.midFill}
          stroke={refs.stroke}
          strokeOpacity={refs.strokeOpacity}
          strokeWidth="0.95"
        />
        <path
          d="M462 193 C364 182 212 178 60 212 C152 214 268 204 382 198 L462 195 Z"
          fill={refs.midFill}
          stroke={refs.stroke}
          strokeOpacity={refs.strokeOpacity}
          strokeWidth="0.95"
        />
        <path
          d="M462 194 C368 196 232 204 102 242 C194 236 298 218 398 202 L462 196 Z"
          fill={refs.midFill}
          stroke={refs.stroke}
          strokeOpacity={refs.strokeOpacity}
          strokeWidth="0.9"
        />
        <path
          d="M464 196 C382 206 276 222 162 256 C248 244 338 222 418 202 L464 196 Z"
          fill={refs.covertFill}
          stroke={refs.stroke}
          strokeOpacity={refs.strokeOpacity * 0.85}
          strokeWidth="0.85"
        />
        {/* 中翼前缘叠层覆羽 */}
        <path
          d="M460 191 C388 166 286 152 178 158 C236 176 312 186 392 190 L460 191 Z"
          fill={refs.covertFill}
          opacity="0.9"
        />
        {/* 中翼羽轴脉络 */}
        <path
          d="M462 190 C358 158 196 138 30 146 M460 192 C358 172 206 162 48 180 M460 193 C364 186 222 186 76 212 M460 195 C372 202 248 210 116 240"
          fill="none"
          stroke={refs.rachis}
          strokeOpacity={refs.rachisOpacity}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M464 190 C366 156 196 132 18 144"
          fill="none"
          stroke={refs.leadingEdge}
          strokeOpacity={refs.leadingOpacity}
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>

      {/* ===== 第 3 对：垂曳下护翼（弧形下展、合拢成六翼闭环） ===== */}
      <g>
        {/* 3D 底层投影羽 */}
        <g transform="translate(-5 8)" opacity="0.52">
          <path
            d="M470 212 C394 238 268 258 148 294 C188 296 226 288 262 278 C212 308 178 334 166 364 C216 346 254 322 292 296 C262 332 246 356 244 374 C296 346 334 314 366 282 C360 314 358 336 366 352 C406 314 442 266 472 214 Z"
            fill={refs.shadowFill}
          />
        </g>

        {/* 下翼 5 片垂曳弧羽 */}
        <path
          d="M470 210 C394 234 270 254 146 292 C218 286 304 260 392 232 L470 212 Z"
          fill={refs.lowerFill}
          stroke={refs.stroke}
          strokeOpacity={refs.strokeOpacity}
          strokeWidth="0.95"
        />
        <path
          d="M470 212 C392 252 272 294 166 362 C236 334 316 284 404 238 L470 214 Z"
          fill={refs.lowerFill}
          stroke={refs.stroke}
          strokeOpacity={refs.strokeOpacity}
          strokeWidth="0.95"
        />
        <path
          d="M471 213 C400 264 304 316 242 374 C298 338 358 286 420 242 L471 215 Z"
          fill={refs.lowerFill}
          stroke={refs.stroke}
          strokeOpacity={refs.strokeOpacity}
          strokeWidth="0.9"
        />
        <path
          d="M472 214 C418 268 362 316 328 360 C370 326 414 278 446 238 L472 214 Z"
          fill={refs.covertFill}
          stroke={refs.stroke}
          strokeOpacity={refs.strokeOpacity * 0.85}
          strokeWidth="0.85"
        />
        <path
          d="M472 214 C432 258 394 298 372 340 C406 306 438 266 462 228 Z"
          fill={refs.covertFill}
          opacity="0.88"
        />
        {/* 下翼羽轴与前缘亮边 */}
        <path
          d="M470 212 C392 238 272 260 158 290 M470 213 C392 258 278 300 178 354 M471 214 C402 270 314 322 252 366"
          fill="none"
          stroke={refs.rachis}
          strokeOpacity={refs.rachisOpacity}
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M470 210 C394 234 270 254 146 292"
          fill="none"
          stroke={refs.leadingEdge}
          strokeOpacity={refs.leadingOpacity * 0.82}
          strokeWidth="1.35"
          strokeLinecap="round"
        />
      </g>

      {/* ===== 翼梢飘散光羽与碎晶 ===== */}
      <g>
        <polygon points="62,22 82,16 72,30" fill={refs.sparkFill} fillOpacity="0.86" />
        <polygon points="6,158 28,150 18,166" fill={refs.sparkFill} fillOpacity="0.82" />
        <polygon points="78,256 98,248 90,264" fill={refs.sparkFill} fillOpacity="0.72" />
        <polygon points="148,370 166,358 158,378" fill={refs.sparkFill} fillOpacity="0.78" />
      </g>
    </>
  );
}

export function SparkDualWings() {
  const [theme, setTheme] = useState<"dark" | "light">(readDocumentTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const next = readDocumentTheme();
      setTheme((prev) => (prev === next ? prev : next));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const isDark = theme === "dark";

  return (
    <section
      aria-label="双色六翼天使光翼主题切换视觉"
      className="landing-fade-in absolute right-4 top-3 z-20 w-32 shrink-0 select-none sm:right-8 sm:top-6 sm:w-48"
    >
      {/* 柔和双层交叉渐隐底光（避免切主题时瞬间闪光） */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 bottom-0 top-0 rounded-full blur-2xl transition-opacity duration-700 ease-out"
        style={{
          opacity: isDark ? 1 : 0,
          background:
            "radial-gradient(ellipse at 34% 52%, rgba(139, 92, 246, 0.28) 0%, rgba(192, 132, 252, 0.14) 40%, transparent 72%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-3 bottom-0 top-0 rounded-full blur-2xl transition-opacity duration-700 ease-out"
        style={{
          opacity: isDark ? 0 : 1,
          background:
            "radial-gradient(ellipse at 66% 52%, rgba(16, 185, 129, 0.18) 0%, rgba(4, 120, 87, 0.09) 40%, transparent 72%)",
        }}
      />

      <div className="relative mx-auto aspect-[960/390] w-full">
        {/* 可点击透明热区：左三翼切深紫暗色、右三翼切暖白浅色 */}
        <button
          type="button"
          onClick={() => applyTheme("dark")}
          aria-pressed={isDark}
          aria-label="点击左侧三翼切换到深紫夜韵主题"
          title="切换到深紫夜韵主题"
          className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer rounded-l-3xl focus-visible:outline-2 focus-visible:outline-accent"
        />
        <button
          type="button"
          onClick={() => applyTheme("light")}
          aria-pressed={!isDark}
          aria-label="点击右侧三翼切换到暖白翡翠主题"
          title="切换到暖白翡翠主题"
          className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer rounded-r-3xl focus-visible:outline-2 focus-visible:outline-accent"
        />

        <svg
          viewBox="0 0 960 390"
          className="h-full w-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {/* 静态星轨圆环双色渐变 */}
            <linearGradient id="seraph-ring-dark" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.82" />
              <stop offset="48%" stopColor="#e2b0ff" stopOpacity="0.88" />
              <stop offset="56%" stopColor="#6ee7b7" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.22" />
            </linearGradient>
            <linearGradient id="seraph-ring-light" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.24" />
              <stop offset="44%" stopColor="#a78bfa" stopOpacity="0.28" />
              <stop offset="52%" stopColor="#34d399" stopOpacity="0.82" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.72" />
            </linearGradient>

            {/* 深紫模式（左三翼）固定渐变 */}
            <linearGradient id="seraph-dark-upper" x1="95%" y1="88%" x2="8%" y2="8%">
              <stop offset="0%" stopColor="#f3e8ff" stopOpacity="0.96" />
              <stop offset="28%" stopColor="#c084fc" stopOpacity="0.92" />
              <stop offset="68%" stopColor="#7c3aed" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#2e1065" stopOpacity="0.78" />
            </linearGradient>
            <linearGradient id="seraph-dark-mid" x1="96%" y1="50%" x2="4%" y2="48%">
              <stop offset="0%" stopColor="#f5f3ff" stopOpacity="0.96" />
              <stop offset="25%" stopColor="#a78bfa" stopOpacity="0.92" />
              <stop offset="64%" stopColor="#6d28d9" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#1e0b3a" stopOpacity="0.78" />
            </linearGradient>
            <linearGradient id="seraph-dark-lower" x1="94%" y1="10%" x2="18%" y2="92%">
              <stop offset="0%" stopColor="#e2b0ff" stopOpacity="0.94" />
              <stop offset="38%" stopColor="#8b5cf6" stopOpacity="0.88" />
              <stop offset="76%" stopColor="#4c1d95" stopOpacity="0.86" />
              <stop offset="100%" stopColor="#1a0736" stopOpacity="0.72" />
            </linearGradient>
            <linearGradient id="seraph-dark-covert" x1="95%" y1="50%" x2="12%" y2="35%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.82" />
              <stop offset="48%" stopColor="#d8b4fe" stopOpacity="0.58" />
              <stop offset="100%" stopColor="#5b21b6" stopOpacity="0.32" />
            </linearGradient>

            {/* 浅色模式（右三翼，镜像坐标系 x: 0~480 为外侧）固定渐变 */}
            <linearGradient id="seraph-light-upper" x1="95%" y1="88%" x2="8%" y2="8%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
              <stop offset="30%" stopColor="#ecfdf5" stopOpacity="0.95" />
              <stop offset="68%" stopColor="#6ee7b7" stopOpacity="0.84" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.68" />
            </linearGradient>
            <linearGradient id="seraph-light-mid" x1="96%" y1="50%" x2="4%" y2="48%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
              <stop offset="28%" stopColor="#d1fae5" stopOpacity="0.94" />
              <stop offset="68%" stopColor="#34d399" stopOpacity="0.82" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.68" />
            </linearGradient>
            <linearGradient id="seraph-light-lower" x1="94%" y1="10%" x2="18%" y2="92%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
              <stop offset="36%" stopColor="#a7f3d0" stopOpacity="0.9" />
              <stop offset="76%" stopColor="#10b981" stopOpacity="0.78" />
              <stop offset="100%" stopColor="#065f46" stopOpacity="0.64" />
            </linearGradient>
            <linearGradient id="seraph-light-covert" x1="95%" y1="50%" x2="12%" y2="35%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
              <stop offset="52%" stopColor="#d1fae5" stopOpacity="0.76" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.38" />
            </linearGradient>

            {/* 双层垂直圣光中轴与炽天星核辉光 */}
            <linearGradient id="seraph-axis-dark" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0" />
              <stop offset="48%" stopColor="#f3e8ff" stopOpacity="0.88" />
              <stop offset="52%" stopColor="#e2b0ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="seraph-axis-light" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0" />
              <stop offset="48%" stopColor="#047857" stopOpacity="0.65" />
              <stop offset="52%" stopColor="#10b981" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="seraph-core-dark" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
              <stop offset="38%" stopColor="#e2b0ff" stopOpacity="0.64" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="seraph-core-light" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.96" />
              <stop offset="42%" stopColor="#6ee7b7" stopOpacity="0.58" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. 同心星轨光环 & 炽天使冠环 */}
          <g transform="translate(480 188)">
            <g
              style={{
                opacity: isDark ? 1 : 0,
                transition: "opacity 0.68s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <circle r="164" fill="none" stroke="url(#seraph-ring-dark)" strokeWidth="1.2" />
              <circle
                r="134"
                fill="none"
                stroke="url(#seraph-ring-dark)"
                strokeWidth="0.95"
                strokeDasharray="7 8"
                className="wing-orbit-slow"
              />
              <circle r="96" fill="none" stroke="url(#seraph-ring-dark)" strokeWidth="0.8" />
              {/* 顶部天使小光环 */}
              <ellipse
                cx="0"
                cy="-58"
                rx="24"
                ry="6.5"
                fill="none"
                stroke="#e2b0ff"
                strokeOpacity="0.72"
                strokeWidth="1.1"
              />
              <circle cx="0" cy="-164" r="5" fill="none" stroke="#e2b0ff" strokeWidth="1" />
              <circle cx="0" cy="-134" r="2.5" fill="#e2b0ff" />
            </g>

            <g
              style={{
                opacity: isDark ? 0 : 1,
                transition: "opacity 0.68s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <circle r="164" fill="none" stroke="url(#seraph-ring-light)" strokeWidth="1.2" />
              <circle
                r="134"
                fill="none"
                stroke="url(#seraph-ring-light)"
                strokeWidth="0.95"
                strokeDasharray="7 8"
                className="wing-orbit-slow"
              />
              <circle r="96" fill="none" stroke="url(#seraph-ring-light)" strokeWidth="0.8" />
              <ellipse
                cx="0"
                cy="-58"
                rx="24"
                ry="6.5"
                fill="none"
                stroke="#059669"
                strokeOpacity="0.62"
                strokeWidth="1.1"
              />
              <circle cx="0" cy="-164" r="5" fill="none" stroke="#059669" strokeWidth="1" />
              <circle cx="0" cy="-134" r="2.5" fill="#10b981" />
            </g>
          </g>

          {/* 垂直神圣星轴 */}
          <line
            x1="480"
            y1="8"
            x2="480"
            y2="380"
            stroke="url(#seraph-axis-dark)"
            strokeWidth="1.25"
            style={{
              opacity: isDark ? 0.92 : 0,
              transition: "opacity 0.68s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
          <line
            x1="480"
            y1="8"
            x2="480"
            y2="380"
            stroke="url(#seraph-axis-light)"
            strokeWidth="1.25"
            style={{
              opacity: isDark ? 0 : 0.85,
              transition: "opacity 0.68s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />

          {/* 2. 左侧三翼（深色模式主色调） */}
          <g
            style={{
              transformOrigin: "480px 192px",
              transform: isDark ? "scale(1.03)" : "scale(0.95)",
              opacity: isDark ? 0.98 : 0.26,
              filter: isDark
                ? "drop-shadow(0 6px 22px rgba(139, 92, 246, 0.44))"
                : "drop-shadow(0 2px 6px rgba(76, 29, 149, 0.14))",
              transition:
                "opacity 0.68s cubic-bezier(0.4, 0, 0.2, 1), transform 0.68s cubic-bezier(0.4, 0, 0.2, 1), filter 0.68s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <g className="wing-flutter-left">
              <SeraphHalfWing refs={DARK_WING_REFS} />
            </g>
          </g>

          {/* 3. 右侧三翼（浅色模式主色调，严格水平镜像） */}
          <g
            style={{
              transformOrigin: "480px 192px",
              transform: !isDark ? "scale(1.03)" : "scale(0.95)",
              opacity: !isDark ? 0.98 : 0.24,
              filter: !isDark
                ? "drop-shadow(0 8px 20px rgba(4, 120, 87, 0.22))"
                : "drop-shadow(0 2px 6px rgba(16, 185, 129, 0.14))",
              transition:
                "opacity 0.68s cubic-bezier(0.4, 0, 0.2, 1), transform 0.68s cubic-bezier(0.4, 0, 0.2, 1), filter 0.68s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <g className="wing-flutter-right">
              <g transform="translate(960 0) scale(-1 1)">
                <SeraphHalfWing refs={LIGHT_WING_REFS} />
              </g>
            </g>
          </g>

          {/* 4. 底部对称圣屑 */}
          <g>
            <polygon
              points="376,348 402,334 394,360"
              fill="#8b5cf6"
              style={{
                opacity: isDark ? 0.56 : 0.16,
                transition: "opacity 0.68s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            <polygon
              points="434,360 450,346 456,370"
              fill="#c4b5fd"
              style={{
                opacity: isDark ? 0.66 : 0.2,
                transition: "opacity 0.68s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            <polygon
              points="584,348 558,334 566,360"
              fill="#10b981"
              style={{
                opacity: isDark ? 0.16 : 0.46,
                transition: "opacity 0.68s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            <polygon
              points="526,360 510,346 504,370"
              fill="#34d399"
              style={{
                opacity: isDark ? 0.2 : 0.56,
                transition: "opacity 0.68s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </g>

          {/* 5. 炽天使四角星核（修长十字圣芒，去蝴蝶触角/虫身） */}
          <g transform="translate(480 192)" className="wing-core-pulse">
            <circle
              r="42"
              fill="url(#seraph-core-dark)"
              style={{
                opacity: isDark ? 0.92 : 0,
                transition: "opacity 0.68s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            <circle
              r="42"
              fill="url(#seraph-core-light)"
              style={{
                opacity: isDark ? 0 : 0.9,
                transition: "opacity 0.68s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
            {/* 纤长菱形圣光星芒 */}
            <path
              d="M0 -30 L5.5 -5.5 L24 0 L5.5 5.5 L0 30 L-5.5 5.5 L-24 0 L-5.5 -5.5 Z"
              fill={isDark ? "#f8f5ff" : "#ffffff"}
              stroke={isDark ? "#c4b5fd" : "#047857"}
              strokeOpacity="0.62"
              strokeWidth="0.95"
            />
            <circle
              r="3.4"
              fill={isDark ? "#c084fc" : "#10b981"}
              style={{ transition: "fill 0.55s ease" }}
            />
          </g>
        </svg>
      </div>
    </section>
  );
}
