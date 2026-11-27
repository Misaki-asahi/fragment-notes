import { useEffect, useRef } from "react";
import {
  createShardField,
  drawParticle,
  stepShard,
  type GlassShard,
} from "./glassShards";

function readThemeMix(): number {
  return document.documentElement.dataset.theme === "dark" ? 1 : 0;
}

export function SparkShardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let targetMix = readThemeMix();
    let currentMix = targetMix;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let shards: GlassShard[] = createShardField(width, height);
    let rafId = 0;
    let lastTime = performance.now();

    const syncCanvasSize = () => {
      const nextWidth = window.innerWidth;
      const nextHeight = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = nextWidth;
      height = nextHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (shards.length === 0) {
        shards = createShardField(width, height);
      }
    };

    const renderFrame = (mixValue = currentMix) => {
      ctx.clearRect(0, 0, width, height);
      // smoothstep 缓动让纸飞机与碎玻璃的交叉淡入淡出更温柔自然
      const easedMix = mixValue * mixValue * (3 - 2 * mixValue);
      for (const shard of shards) {
        drawParticle(ctx, shard, width, height, easedMix);
      }
    };

    syncCanvasSize();
    renderFrame();

    const themeObserver = new MutationObserver(() => {
      const next = readThemeMix();
      if (next !== targetMix) {
        targetMix = next;
        if (reduceMotion) {
          currentMix = targetMix;
          renderFrame();
        }
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const onResize = () => {
      syncCanvasSize();
      shards = createShardField(width, height);
      if (reduceMotion) renderFrame();
    };
    window.addEventListener("resize", onResize);

    if (!reduceMotion) {
      const tick = (now: number) => {
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;

        const diff = targetMix - currentMix;
        if (Math.abs(diff) > 0.001) {
          const step = Math.min(Math.abs(diff), dt / 0.65);
          currentMix += Math.sign(diff) * step;
        } else {
          currentMix = targetMix;
        }

        const easedMix = currentMix * currentMix * (3 - 2 * currentMix);
        for (const shard of shards) {
          stepShard(shard, dt, width, height, easedMix);
        }
        renderFrame(currentMix);
        rafId = window.requestAnimationFrame(tick);
      };
      rafId = window.requestAnimationFrame(tick);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
