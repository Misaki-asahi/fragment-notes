import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { DeckPayload } from "../api/generateDeck";

export const PDF_MAX_PAGES = 15;
export const PDF_MAX_CHARS = 12000;
export const IMAGE_MAX_EDGE = 1600;
export const TEXT_MAX_CHARS = 16000;

export type PdfExtract = {
  text: string;
  totalPages: number;
  usedPages: number;
  notice: string | null;
};

export async function extractPdfText(file: File): Promise<PdfExtract> {
  const { getDocument, GlobalWorkerOptions } = await import("pdfjs-dist");
  GlobalWorkerOptions.workerSrc = workerUrl;
  const data = await file.arrayBuffer();
  const task = getDocument({ data });
  try {
    const doc = await task.promise;
    const totalPages = doc.numPages;
    const pageLimit = Math.min(totalPages, PDF_MAX_PAGES);
    let usedPages = 0;
    let text = "";
    let stoppedEarly = false;
    for (let i = 1; i <= pageLimit; i++) {
      const page = await doc.getPage(i);
      usedPages = i;
      const content = await page.getTextContent();
      const line = content.items
        .map((item) => ("str" in item ? item.str + (item.hasEOL ? "\n" : " ") : ""))
        .join("")
        .trim();
      if (line) text += line + "\n";
      if (text.length >= PDF_MAX_CHARS) {
        stoppedEarly = true;
        break;
      }
    }
    const notices: string[] = [];
    if (totalPages > PDF_MAX_PAGES) {
      notices.push(`课件共 ${totalPages} 页，已提取前 ${usedPages} 页`);
    }
    if (stoppedEarly || text.length > PDF_MAX_CHARS) {
      text = text.slice(0, PDF_MAX_CHARS);
      notices.push(`文本超过 ${PDF_MAX_CHARS} 字，已截取前 ${PDF_MAX_CHARS} 字`);
    }
    if (text.trim() === "") {
      throw new Error("这份 PDF 没有提取到文字（可能是扫描版），请改拍笔记照片上传");
    }
    return { text, totalPages, usedPages, notice: notices.length ? notices.join("；") : null };
  } finally {
    await task.destroy();
  }
}

export async function compressImageToBase64(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, IMAGE_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("当前浏览器不支持图片压缩，请换用 Chrome / Edge");
    // JPEG 没有透明通道，先铺纸白色，避免透明笔记变成黑底。
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    bitmap.close();
  }
}

export async function fileToPayload(
  file: File,
): Promise<{ payload: DeckPayload; notice: string | null }> {
  const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
  if (file.size > 20 * 1024 * 1024) throw new Error("文件超过 20MB，请拆分 PDF 或压缩照片后重试");
  if (isPdf) {
    try {
      const result = await extractPdfText(file);
      return { payload: { kind: "pdf", text: result.text }, notice: result.notice };
    } catch (error) {
      if (error instanceof Error && error.name === "PasswordException") throw new Error("这份 PDF 已加密，请先解锁后上传");
      if (error instanceof Error && error.message.includes("没有提取到文字")) throw error;
      throw new Error("PDF 无法解析，请确认文件未损坏，或换一份课件重试");
    }
  }
  if (file.type === "image/jpeg" || file.type === "image/png") {
    const imageBase64 = await compressImageToBase64(file);
    return { payload: { kind: "image", imageBase64 }, notice: null };
  }
  throw new Error("仅支持 JPG / PNG 照片或 PDF 课件");
}