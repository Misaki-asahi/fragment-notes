import { useEffect, useMemo, useState } from "react";

interface FormulaTextProps {
  text: string;
  className?: string;
}

type FormulaSegment =
  | { type: "text"; value: string }
  | { type: "formula"; value: string; display: boolean };

type KatexRenderer = (
  formula: string,
  options: {
    displayMode: boolean;
    throwOnError: boolean;
    trust: boolean;
    strict: string;
  },
) => string;

let katexLoader: Promise<KatexRenderer> | null = null;

function loadKatex(): Promise<KatexRenderer> {
  if (!katexLoader) {
    katexLoader = import("katex").then(async (module) => {
      await import("katex/dist/katex.min.css");
      const candidate = module.default as unknown as KatexRenderer | { renderToString: KatexRenderer };
      return typeof candidate === "function" ? candidate : candidate.renderToString.bind(candidate);
    });
  }
  return katexLoader;
}

function splitFormulaText(text: string): FormulaSegment[] {
  const segments: FormulaSegment[] = [];
  const pattern = /\$\$([\s\S]+?)\$\$|\$([^\n$]+?)\$/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) segments.push({ type: "text", value: text.slice(cursor, match.index) });
    segments.push({
      type: "formula",
      value: match[1] ?? match[2] ?? "",
      display: match[1] !== undefined,
    });
    cursor = pattern.lastIndex;
  }
  if (cursor < text.length) segments.push({ type: "text", value: text.slice(cursor) });
  return segments;
}

function renderFormula(
  renderer: KatexRenderer,
  formula: string,
  display: boolean,
): string | null {
  try {
    return renderer(formula, {
      displayMode: display,
      throwOnError: false,
      trust: false,
      strict: "ignore",
    });
  } catch {
    return null;
  }
}

export function FormulaText({ text, className = "" }: FormulaTextProps) {
  const segments = useMemo(() => splitFormulaText(text), [text]);
  const hasFormula = segments.some((segment) => segment.type === "formula");
  const [renderer, setRenderer] = useState<KatexRenderer | null>(null);

  useEffect(() => {
    if (!hasFormula || renderer) return;
    let active = true;
    void loadKatex().then((loaded) => {
      if (active) setRenderer(() => loaded);
    });
    return () => {
      active = false;
    };
  }, [hasFormula, renderer]);

  return (
    <div className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "text") return <span key={index}>{segment.value}</span>;
        const html = renderer ? renderFormula(renderer, segment.value, segment.display) : null;
        if (!html) {
          return (
            <span key={index} className="whitespace-pre-wrap">
              {segment.display ? `$$${segment.value}$$` : `$${segment.value}$`}
            </span>
          );
        }
        return segment.display ? (
          <div
            key={index}
            className="my-2 overflow-x-auto py-1"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ) : (
          <span
            key={index}
            className="inline-block max-w-full align-middle"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
}
