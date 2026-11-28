import { useEffect, useState } from "react";
import { SparkLandingMascot } from "./SparkLandingMascot";

function readTheme(): "light" | "dark" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function FieldScenery() {
  return (
    <svg viewBox="0 0 800 520" preserveAspectRatio="none" className="h-full w-full">
      <defs>
        <linearGradient id="field-hill-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dff4e6" />
          <stop offset="100%" stopColor="#bfe8cf" />
        </linearGradient>
        <linearGradient id="field-hill-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b7e2c5" />
          <stop offset="100%" stopColor="#8fd0aa" />
        </linearGradient>
        <linearGradient id="field-hill-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#83c79d" />
          <stop offset="100%" stopColor="#5fb587" />
        </linearGradient>
      </defs>

      <ellipse cx="250" cy="472" rx="290" ry="54" fill="#4f9f76" opacity="0.12" />
      <path
        d="M0 356C118 306 236 308 352 350C472 394 626 402 800 326V520H0Z"
        fill="url(#field-hill-back)"
      />
      <path
        d="M0 414C142 366 270 382 402 422C536 462 674 444 800 390V520H0Z"
        fill="url(#field-hill-mid)"
      />
      <path
        d="M0 472C164 432 312 452 454 482C586 510 698 492 800 458V520H0Z"
        fill="url(#field-hill-front)"
      />

      <g transform="translate(126 238)" opacity="0.92">
        <path d="M0 196C8 150 10 104 4 58" stroke="#7b6a4d" strokeWidth="14" strokeLinecap="round" />
        <path d="M6 118L-38 82M7 96L48 54" stroke="#7b6a4d" strokeWidth="9" strokeLinecap="round" />
        <circle cx="-34" cy="70" r="54" fill="#69b98b" />
        <circle cx="30" cy="42" r="62" fill="#78c697" />
        <circle cx="62" cy="84" r="48" fill="#5bad7e" />
        <circle cx="-4" cy="20" r="46" fill="#8bd3a5" />
      </g>

      <g stroke="#3f8f66" strokeWidth="4" strokeLinecap="round" opacity="0.55">
        <path d="M52 500Q58 466 48 440M62 500Q72 462 88 444M214 512Q220 474 210 452M232 512Q242 478 258 462M356 520Q364 482 354 458M374 520Q386 486 402 470M520 514Q528 480 520 458M540 514Q550 484 566 468M672 506Q680 472 672 450M692 506Q702 476 718 460" />
      </g>

      <g fill="#fff7d6" opacity="0.9">
        <circle cx="86" cy="454" r="5" />
        <circle cx="282" cy="478" r="4" />
        <circle cx="438" cy="492" r="5" />
        <circle cx="612" cy="468" r="4" />
      </g>
      <g fill="#f3b7c8" opacity="0.9">
        <circle cx="196" cy="466" r="5" />
        <circle cx="394" cy="506" r="4" />
        <circle cx="574" cy="486" r="5" />
      </g>
    </svg>
  );
}

function CityScenery() {
  const buildings = [
    { x: 112, y: 322, w: 82, h: 132, tone: "back" },
    { x: 202, y: 268, w: 104, h: 186, tone: "front" },
    { x: 314, y: 344, w: 76, h: 110, tone: "back" },
    { x: 398, y: 224, w: 112, h: 230, tone: "front" },
    { x: 518, y: 304, w: 92, h: 150, tone: "back" },
    { x: 618, y: 252, w: 116, h: 202, tone: "front" },
    { x: 742, y: 330, w: 76, h: 124, tone: "back" },
  ];

  return (
    <svg viewBox="0 0 800 520" preserveAspectRatio="xMaxYMax slice" className="h-full w-full">
      <defs>
        <linearGradient id="city-building-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#283155" />
          <stop offset="100%" stopColor="#171e3a" />
        </linearGradient>
        <linearGradient id="city-building-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c2547" />
          <stop offset="100%" stopColor="#0c1329" />
        </linearGradient>
        <linearGradient id="city-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#141c34" />
          <stop offset="100%" stopColor="#080d1d" />
        </linearGradient>
      </defs>

      <g fill="#b9b5ff" opacity="0.4">
        <circle cx="170" cy="92" r="2" />
        <circle cx="276" cy="142" r="2.5" />
        <circle cx="410" cy="76" r="2" />
        <circle cx="522" cy="128" r="2" />
        <circle cx="718" cy="172" r="2.5" />
      </g>

      <g fill="#20294b" opacity="0.55">
        <rect x="146" y="356" width="58" height="98" />
        <rect x="272" y="330" width="46" height="124" />
        <rect x="474" y="346" width="62" height="108" />
        <rect x="690" y="338" width="52" height="116" />
      </g>

      {buildings.map((building, buildingIndex) => {
        const columns = Math.max(2, Math.floor((building.w - 24) / 24));
        const rows = Math.max(2, Math.floor((building.h - 46) / 30));
        return (
          <g key={building.x}>
            <rect
              x={building.x}
              y={building.y}
              width={building.w}
              height={building.h}
              rx="3"
              fill={`url(#city-building-${building.tone})`}
            />
            <rect
              x={building.x + building.w - 12}
              y={building.y}
              width="12"
              height={building.h}
              fill="#050916"
              opacity="0.18"
            />
            {Array.from({ length: rows }, (_, row) =>
              Array.from({ length: columns }, (_, column) => {
                const warm = (row * 3 + column * 5 + buildingIndex) % 4 !== 0;
                return (
                  <rect
                    key={`${building.x}-${row}-${column}`}
                    x={building.x + 14 + column * 24}
                    y={building.y + 26 + row * 30}
                    width="12"
                    height="9"
                    rx="1.5"
                    fill={warm ? "#f5d67b" : "#89d9ff"}
                    opacity={warm ? 0.72 : 0.42}
                  />
                );
              }),
            )}
          </g>
        );
      })}

      <g stroke="#4d5986" strokeWidth="4" strokeLinecap="round">
        <path d="M454 224V184" />
        <path d="M676 252V218H700V252" />
      </g>
      <circle cx="454" cy="180" r="4" fill="#f5d67b" opacity="0.8" />

      <path d="M92 520V454C276 432 540 434 800 456V520Z" fill="url(#city-road)" />
      <path d="M132 486C324 466 566 468 772 484" stroke="#7782ad" strokeWidth="3" strokeDasharray="22 20" opacity="0.28" />
      <g stroke="#46527e" strokeWidth="5" strokeLinecap="round">
        <path d="M214 438V406M214 406H190M214 406H238" />
        <path d="M590 438V406M590 406H566M590 406H614" />
      </g>
      <g fill="#f5d67b">
        <circle cx="190" cy="406" r="4" />
        <circle cx="238" cy="406" r="4" />
        <circle cx="566" cy="406" r="4" />
        <circle cx="614" cy="406" r="4" />
      </g>
    </svg>
  );
}

export function SparkLandingScenery() {
  const [theme, setTheme] = useState<"light" | "dark">(readTheme);

  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(readTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[44vh] min-h-[300px] overflow-hidden sm:h-[46vh]"
    >
      <div
        className={`absolute inset-y-0 left-0 w-1/2 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none [mask-image:linear-gradient(to_right,black_60%,transparent_100%)] ${
          theme === "light" ? "translate-x-0 opacity-100" : "-translate-x-8 opacity-0"
        }`}
      >
        <FieldScenery />
      </div>
      <div
        className={`absolute inset-y-0 right-0 w-1/2 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none [mask-image:linear-gradient(to_left,black_60%,transparent_100%)] ${
          theme === "dark" ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
        }`}
      >
        <CityScenery />
      </div>
      <SparkLandingMascot theme={theme} />
    </div>
  );
}
