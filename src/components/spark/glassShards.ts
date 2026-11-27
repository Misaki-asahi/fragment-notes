export type ShardTheme = "light" | "dark";

export interface Point2D {
  x: number;
  y: number;
}

export interface GlassShard {
  x: number;
  y: number;
  size: number;
  depth: number; // 0.35 (远景) ~ 1.0 (近景)
  vy: number;
  vx: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  rotation: number;
  vr: number;
  tiltPhase: number;
  tiltSpeed: number;
  sheenPhase: number;
  sheenSpeed: number;
  glideSpeed: number;
  glideSlope: number;
  wingPhase: number;
  wingSpeed: number;
  heading: number;
  tintIndex: 0 | 1 | 2;
  vertices: Point2D[];
  facetPoly: Point2D[];
  fractureLines: [Point2D, Point2D][];
  bevelOffset: Point2D;
  isMicro: boolean;
}

interface ShardPalette {
  fills: [string, string, string];
  facetHighlight: string;
  bevelEdge: string;
  edge: string;
  litEdge: string;
  sheenCore: string;
  glint: string;
  shadow: string;
  baseAlpha: number;
}

const DARK_PALETTE: ShardPalette = {
  fills: [
    "rgba(196, 181, 253, 0.20)",
    "rgba(226, 176, 255, 0.16)",
    "rgba(139, 92, 246, 0.18)",
  ],
  facetHighlight: "rgba(248, 245, 255, 0.18)",
  bevelEdge: "rgba(139, 92, 246, 0.45)",
  edge: "rgba(196, 181, 253, 0.52)",
  litEdge: "rgba(248, 245, 255, 0.90)",
  sheenCore: "rgba(255, 255, 255, 0.72)",
  glint: "rgba(248, 245, 255, 0.95)",
  shadow: "rgba(5, 2, 16, 0.42)",
  baseAlpha: 0.94,
};

const LIGHT_GLASS_PALETTE: ShardPalette = {
  fills: [
    "rgba(255, 255, 255, 0.76)",
    "rgba(209, 250, 229, 0.46)",
    "rgba(224, 231, 255, 0.44)",
  ],
  facetHighlight: "rgba(255, 255, 255, 0.72)",
  bevelEdge: "rgba(4, 120, 87, 0.22)",
  edge: "rgba(4, 120, 87, 0.34)",
  litEdge: "rgba(255, 255, 255, 0.98)",
  sheenCore: "rgba(255, 255, 255, 0.94)",
  glint: "rgba(255, 255, 255, 0.98)",
  shadow: "rgba(4, 120, 87, 0.11)",
  baseAlpha: 0.96,
};

export function getShardPalette(theme: ShardTheme): ShardPalette {
  return theme === "dark" ? DARK_PALETTE : LIGHT_GLASS_PALETTE;
}

function buildShardPolygon(size: number, isMicro: boolean): {
  vertices: Point2D[];
  facetPoly: Point2D[];
  fractureLines: [Point2D, Point2D][];
  bevelOffset: Point2D;
} {
  const roll = isMicro ? 0.1 : Math.random();
  let vertices: Point2D[];
  let facetPoly: Point2D[];
  const fractureLines: [Point2D, Point2D][] = [];

  if (roll < 0.35) {
    // 1. 长尖刺玻璃片（Splinter）：3 顶点极锐角细长三角
    const len = size * (1.25 + Math.random() * 0.45);
    const baseW = len / (2.7 + Math.random() * 1.2);
    const skew = (Math.random() - 0.35) * baseW * 0.8;
    const apex: Point2D = { x: 0, y: -len * 0.62 };
    const rightBase: Point2D = { x: baseW * 0.52, y: len * 0.36 + skew * 0.45 };
    const leftBase: Point2D = { x: -baseW * 0.48, y: len * 0.24 - skew * 0.35 };
    vertices = [apex, rightBase, leftBase];

    const splitT = 0.32 + Math.random() * 0.36;
    const baseSplit: Point2D = {
      x: leftBase.x + (rightBase.x - leftBase.x) * splitT,
      y: leftBase.y + (rightBase.y - leftBase.y) * splitT,
    };
    facetPoly = [apex, rightBase, baseSplit];
    fractureLines.push([apex, baseSplit]);
  } else if (roll < 0.7) {
    // 2. 斜切楔形玻璃片（Wedge）：4 顶点不对称尖锐楔片
    const len = size * (1.08 + Math.random() * 0.32);
    const w = len * (0.42 + Math.random() * 0.22);
    const apex: Point2D = { x: -w * 0.12, y: -len * 0.62 };
    const shoulderR: Point2D = {
      x: w * (0.48 + Math.random() * 0.22),
      y: -len * 0.04 + Math.random() * len * 0.14,
    };
    const tail: Point2D = {
      x: w * (0.05 + Math.random() * 0.24),
      y: len * (0.42 + Math.random() * 0.18),
    };
    const shoulderL: Point2D = {
      x: -w * (0.44 + Math.random() * 0.2),
      y: len * 0.16 - Math.random() * len * 0.12,
    };
    vertices = [apex, shoulderR, tail, shoulderL];

    facetPoly = [apex, shoulderR, tail];
    fractureLines.push([apex, tail]);
    if (Math.random() < 0.55) {
      const midR: Point2D = {
        x: (apex.x + shoulderR.x) * 0.52,
        y: (apex.y + shoulderR.y) * 0.52,
      };
      fractureLines.push([shoulderL, midR]);
    }
  } else {
    // 3. 缺角爆裂片（Chipped Fracture）：5 顶点带锐利崩口的不规则碎玻璃
    const len = size * (0.95 + Math.random() * 0.28);
    const w = len * (0.58 + Math.random() * 0.24);
    const apex: Point2D = { x: (Math.random() - 0.5) * w * 0.2, y: -len * 0.58 };
    const upperR: Point2D = { x: w * 0.56, y: -len * 0.08 };
    const chip: Point2D = { x: w * 0.3, y: len * 0.22 };
    const bottom: Point2D = { x: -w * 0.14, y: len * 0.52 };
    const leftWing: Point2D = { x: -w * 0.58, y: len * 0.06 };
    vertices = [apex, upperR, chip, bottom, leftWing];

    facetPoly = [apex, upperR, chip, bottom];
    fractureLines.push([apex, chip], [apex, bottom]);
  }

  const bevelScale = Math.max(1.2, Math.min(2.4, size * 0.055));
  const bevelOffset: Point2D = { x: bevelScale, y: bevelScale * 0.85 };
  return { vertices, facetPoly, fractureLines, bevelOffset };
}

function createShard(
  width: number,
  height: number,
  scatterVertically: boolean,
  glideSpawn: boolean,
): GlassShard {
  const depth = 0.36 + Math.random() * 0.64;
  const isMicro = Math.random() < 0.12;
  const size = isMicro ? 10 + depth * 12 : 18 + depth * 32;
  const { vertices, facetPoly, fractureLines, bevelOffset } = buildShardPolygon(size, isMicro);

  let x = Math.random() * width;
  let y = scatterVertically
    ? Math.random() * height * 0.82
    : -size - Math.random() * height * 0.16;

  if (!scatterVertically && glideSpawn) {
    // 纸飞机向右下轻盈滑翔：一部分从顶部进场，一部分从左上侧入场
    if (Math.random() < 0.42) {
      x = -size * 1.4;
      y = Math.random() * height * 0.44;
    } else {
      x = Math.random() * width * 0.88;
      y = -size * 1.2;
    }
  }

  const glideSlope = 0.34 + Math.random() * 0.22;
  const glideSpeed = 26 + depth * 30;

  return {
    x,
    y,
    size,
    depth,
    vy: isMicro ? 22 + depth * 28 : 16 + depth * 25,
    vx: (Math.random() - 0.5) * 9,
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: 0.45 + Math.random() * 0.55,
    swayAmp: 6 + depth * 11,
    rotation: Math.random() * Math.PI * 2,
    vr: (Math.random() - 0.5) * (isMicro ? 0.55 : 0.38),
    tiltPhase: Math.random() * Math.PI * 2,
    tiltSpeed: 0.7 + Math.random() * 0.9,
    sheenPhase: Math.random() * Math.PI * 2,
    sheenSpeed: 0.85 + Math.random() * 0.95,
    glideSpeed,
    glideSlope,
    wingPhase: Math.random() * Math.PI * 2,
    wingSpeed: 1.4 + Math.random() * 1.1,
    heading: glideSlope,
    tintIndex: (Math.floor(Math.random() * 3) % 3) as 0 | 1 | 2,
    vertices,
    facetPoly,
    fractureLines,
    bevelOffset,
    isMicro,
  };
}

export function createShardField(width: number, height: number): GlassShard[] {
  const count = width < 640 ? 18 : 28;
  const shards: GlassShard[] = [];
  for (let i = 0; i < count; i += 1) {
    shards.push(createShard(width, height, true, false));
  }
  shards.sort((a, b) => a.depth - b.depth);
  return shards;
}

/**
 * 垂直渐隐曲线：顶部柔和进入，上中段保持清晰，到界面中下层（52% ~ 85%）逐步消散至 0
 */
export function computeVerticalAlpha(y: number, height: number): number {
  if (height <= 0) return 0;
  const ratio = y / height;
  if (ratio <= 0) return 0;
  if (ratio < 0.1) {
    return ratio / 0.1;
  }
  if (ratio <= 0.52) {
    return 1;
  }
  if (ratio >= 0.85) {
    return 0;
  }
  const fadeProgress = (ratio - 0.52) / (0.85 - 0.52);
  return Math.pow(1 - fadeProgress, 1.85);
}

/**
 * 中央主视觉文字区域柔光避让，防止前景亮边穿过标题笔画干扰阅读
 */
function computeHeroTextAvoidance(
  x: number,
  y: number,
  width: number,
  height: number,
): number {
  const cx = width * 0.5;
  const cy = Math.min(300, height * 0.34);
  const rx = Math.min(310, width * 0.42);
  const ry = 155;
  const d = Math.hypot((x - cx) / Math.max(1, rx), (y - cy) / ry);
  if (d >= 1.15) return 1;
  if (d <= 0.55) return 0.24;
  const t = (d - 0.55) / (1.15 - 0.55);
  return 0.24 + 0.76 * t;
}

export function stepShard(
  shard: GlassShard,
  dt: number,
  width: number,
  height: number,
  themeMix = 1,
): void {
  shard.swayPhase += shard.swaySpeed * dt;
  shard.rotation += shard.vr * dt;
  shard.tiltPhase += shard.tiltSpeed * dt;
  shard.sheenPhase += shard.sheenSpeed * dt;
  shard.wingPhase += shard.wingSpeed * dt;

  const glassVx = shard.vx + Math.sin(shard.swayPhase) * shard.swayAmp * 0.35;
  const glassVy = shard.vy;

  const planeVx = shard.glideSpeed * Math.cos(shard.glideSlope) + Math.cos(shard.wingPhase * 0.6) * 4;
  const planeVy = shard.glideSpeed * Math.sin(shard.glideSlope) + Math.sin(shard.wingPhase) * 6;

  // 随 themeMix（0=纸飞机，1=碎玻璃）连续插值速度向量，保证深浅切换时零跳变
  shard.x += (planeVx * (1 - themeMix) + glassVx * themeMix) * dt;
  shard.y += (planeVy * (1 - themeMix) + glassVy * themeMix) * dt;
  shard.heading = Math.atan2(planeVy, planeVx);

  const glideMode = themeMix < 0.5;
  if (!glideMode) {
    if (shard.x < -shard.size * 1.4) shard.x = width + shard.size * 1.4;
    if (shard.x > width + shard.size * 1.4) shard.x = -shard.size * 1.4;
  }

  if (shard.y > height * 0.86 || (glideMode && shard.x > width + shard.size * 1.8)) {
    const fresh = createShard(width, height, false, glideMode);
    Object.assign(shard, fresh);
  }
}

function tracePolygon(ctx: CanvasRenderingContext2D, pts: Point2D[]): void {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i += 1) {
    ctx.lineTo(pts[i].x, pts[i].y);
  }
  ctx.closePath();
}

export function drawShard(
  ctx: CanvasRenderingContext2D,
  shard: GlassShard,
  palette: ShardPalette,
  width: number,
  height: number,
  alphaScale = 1,
): void {
  if (alphaScale <= 0.01) return;
  const verticalAlpha = computeVerticalAlpha(shard.y, height);
  if (verticalAlpha <= 0.01) return;

  const avoidance = computeHeroTextAvoidance(shard.x, shard.y, width, height);
  const ratio = shard.y / Math.max(1, height);
  const fadeScale = ratio > 0.52 ? 1 - Math.min(0.16, ((ratio - 0.52) / 0.33) * 0.16) : 1;
  const tiltScale = 0.54 + 0.46 * Math.abs(Math.cos(shard.tiltPhase));
  const glareStrength = Math.pow(Math.max(0, Math.sin(shard.sheenPhase)), 3);

  ctx.save();
  ctx.translate(shard.x, shard.y);
  ctx.rotate(shard.rotation);
  ctx.scale(fadeScale, fadeScale * tiltScale);
  ctx.lineJoin = "miter";
  ctx.miterLimit = 8;

  const baseOpacity =
    verticalAlpha * avoidance * alphaScale * palette.baseAlpha * (0.58 + 0.42 * shard.depth);
  ctx.globalAlpha = baseOpacity;

  const pts = shard.vertices;

  // 1. 玻璃厚边切口折射层
  ctx.save();
  ctx.translate(shard.bevelOffset.x, shard.bevelOffset.y);
  tracePolygon(ctx, pts);
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = palette.bevelEdge;
  ctx.stroke();
  ctx.restore();

  // 2. 主体玻璃填充 + 轻微投影
  tracePolygon(ctx, pts);
  ctx.shadowColor = palette.shadow;
  ctx.shadowBlur = 9 * shard.depth;
  ctx.shadowOffsetY = 4 * shard.depth;

  const grad = ctx.createLinearGradient(-shard.size, -shard.size, shard.size, shard.size);
  grad.addColorStop(0, palette.litEdge);
  grad.addColorStop(0.24, palette.fills[shard.tintIndex]);
  grad.addColorStop(1, palette.fills[(shard.tintIndex + 1) % 3]);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 3. 切面反光 + 硬边双条镜面高光扫光
  ctx.save();
  tracePolygon(ctx, pts);
  ctx.clip();

  tracePolygon(ctx, shard.facetPoly);
  ctx.fillStyle = palette.facetHighlight;
  ctx.fill();

  const sweep = Math.cos(shard.sheenPhase) * shard.size * 1.15;
  ctx.save();
  ctx.rotate(-0.42);
  ctx.globalAlpha = baseOpacity * (0.28 + 0.62 * glareStrength);
  ctx.fillStyle = palette.sheenCore;
  ctx.fillRect(sweep - shard.size * 0.14, -shard.size * 2, shard.size * 0.18, shard.size * 4);
  ctx.globalAlpha = baseOpacity * (0.18 + 0.45 * glareStrength);
  ctx.fillRect(sweep + shard.size * 0.11, -shard.size * 2, shard.size * 0.06, shard.size * 4);
  ctx.restore();
  ctx.restore();

  // 4. 锐利玻璃外轮廓与内部碎裂折线
  tracePolygon(ctx, pts);
  ctx.lineWidth = 0.95;
  ctx.strokeStyle = palette.edge;
  ctx.stroke();

  for (const [a, b] of shard.fractureLines) {
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineWidth = 0.75;
    ctx.strokeStyle = palette.edge;
    ctx.stroke();
  }

  // 5. 尖端两条迎光主棱边高光
  ctx.beginPath();
  ctx.moveTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
  ctx.lineTo(pts[0].x, pts[0].y);
  ctx.lineTo(pts[1].x, pts[1].y);
  ctx.lineWidth = 1.25;
  ctx.strokeStyle = palette.litEdge;
  ctx.stroke();

  // 6. 迎光瞬间尖端微光星芒
  if (glareStrength > 0.68 && shard.depth > 0.55) {
    const tip = pts[0];
    const starSize = (3.5 + shard.depth * 3.5) * glareStrength;
    ctx.save();
    ctx.translate(tip.x, tip.y);
    ctx.globalAlpha = baseOpacity * glareStrength * 0.85;
    ctx.strokeStyle = palette.glint;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-starSize, 0);
    ctx.lineTo(starSize, 0);
    ctx.moveTo(0, -starSize);
    ctx.lineTo(0, starSize);
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

export function drawPaperPlane(
  ctx: CanvasRenderingContext2D,
  shard: GlassShard,
  width: number,
  height: number,
  alphaScale = 1,
): void {
  if (alphaScale <= 0.01) return;
  const verticalAlpha = computeVerticalAlpha(shard.y, height);
  if (verticalAlpha <= 0.01) return;

  const avoidance = computeHeroTextAvoidance(shard.x, shard.y, width, height);
  const ratio = shard.y / Math.max(1, height);
  const fadeScale = ratio > 0.52 ? 1 - Math.min(0.18, ((ratio - 0.52) / 0.33) * 0.18) : 1;
  const bank = 0.88 + 0.12 * Math.sin(shard.wingPhase);
  const len = (shard.isMicro ? shard.size * 1.15 : shard.size * 0.86) * fadeScale;

  const nose: Point2D = { x: len * 0.78, y: 0 };
  const topWing: Point2D = { x: -len * 0.62, y: -len * 0.48 * bank };
  const valley: Point2D = { x: -len * 0.36, y: -len * 0.06 };
  const keel: Point2D = { x: -len * 0.48, y: len * 0.22 };
  const bottomWing: Point2D = { x: -len * 0.5, y: len * 0.12 * (2 - bank) };

  const baseOpacity =
    verticalAlpha * avoidance * alphaScale * (0.64 + 0.34 * shard.depth);

  ctx.save();
  ctx.translate(shard.x, shard.y);
  ctx.rotate(shard.heading);
  ctx.lineJoin = "miter";
  ctx.miterLimit = 6;

  // 前景纸飞机淡雅微风尾迹
  if (!shard.isMicro && shard.depth > 0.56) {
    const trailGrad = ctx.createLinearGradient(-len * 0.5, 0, -len * 1.65, 0);
    trailGrad.addColorStop(0, "rgba(16, 185, 129, 0.22)");
    trailGrad.addColorStop(1, "rgba(16, 185, 129, 0)");
    ctx.globalAlpha = baseOpacity * 0.75;
    ctx.strokeStyle = trailGrad;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-len * 0.48, 0.5);
    ctx.lineTo(-len * 1.65, 2.5);
    ctx.stroke();
  }

  ctx.globalAlpha = baseOpacity;
  ctx.shadowColor = "rgba(4, 120, 87, 0.11)";
  ctx.shadowBlur = 9 * shard.depth;
  ctx.shadowOffsetY = 5 * shard.depth;

  // 1. 下（远侧）机翼：清透淡翡翠白
  tracePolygon(ctx, [nose, valley, bottomWing]);
  ctx.fillStyle = "rgba(232, 248, 240, 0.94)";
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // 2. 机身龙骨暗折面：柔和翡翠绿纸影，塑造立体折纸感
  tracePolygon(ctx, [nose, valley, keel]);
  ctx.fillStyle = "rgba(167, 243, 208, 0.85)";
  ctx.fill();

  // 3. 上（受光）机翼：纯净纸白渐变
  const topGrad = ctx.createLinearGradient(-len * 0.6, -len * 0.45, len * 0.75, 0);
  topGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
  topGrad.addColorStop(1, "rgba(244, 251, 247, 0.95)");
  tracePolygon(ctx, [nose, topWing, valley]);
  ctx.fillStyle = topGrad;
  ctx.fill();

  // 4. 折痕与纸边细腻勾线
  ctx.lineWidth = 0.85;
  ctx.strokeStyle = "rgba(4, 120, 87, 0.34)";
  tracePolygon(ctx, [nose, valley, bottomWing]);
  ctx.stroke();
  tracePolygon(ctx, [nose, valley, keel]);
  ctx.stroke();
  tracePolygon(ctx, [nose, topWing, valley]);
  ctx.stroke();

  // 迎光主翼前缘白边提亮
  ctx.beginPath();
  ctx.moveTo(topWing.x, topWing.y);
  ctx.lineTo(nose.x, nose.y);
  ctx.lineWidth = 1.1;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
  ctx.stroke();

  ctx.restore();
}

export function drawParticle(
  ctx: CanvasRenderingContext2D,
  shard: GlassShard,
  width: number,
  height: number,
  themeMix: number,
): void {
  if (themeMix < 0.99) {
    drawPaperPlane(ctx, shard, width, height, 1 - themeMix);
  }
  if (themeMix > 0.01) {
    drawShard(ctx, shard, DARK_PALETTE, width, height, themeMix);
  }
}
