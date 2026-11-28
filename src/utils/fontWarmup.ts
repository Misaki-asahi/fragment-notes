const CJK_FONT_SHORTHAND = '400 1rem "Noto Sans SC Variable"';

/**
 * 提前拉取中文字形子集。
 * 工作台会用到落地页没有的字符，@fontsource 的 Noto Sans SC 按 unicode-range 切成 107 个子集，
 * 若等到点击进入才首次下载，字体替换会触发整页重排（实测一次长任务 200ms+ 表现为明显卡顿）。
 */
export function warmCjkFontSubsets(text: string): void {
  if (typeof document === "undefined" || !document.fonts?.load) return;
  void document.fonts.load(CJK_FONT_SHORTHAND, text).catch(() => {});
}
