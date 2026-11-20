import { Loader2 } from "lucide-react";

type Props = {
  label?: string;
};

export function LoadingSkeleton({ label = "AI 正在解析你的资料…" }: Props) {
  return (
    <section className="edge-glow p-5 sm:p-6" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-accent-2" />
        <div>
          <p className="text-sm font-semibold text-ink">{label}</p>
          <p className="mt-0.5 font-mono text-[11px] tracking-wider text-ink-3">
            通常需要 30~60 秒 · 免费模型高峰期可能稍慢
          </p>
        </div>
      </div>

      <div className="mt-6 animate-pulse space-y-5">
        <div>
          <div className="h-3 w-24 bg-surface-2" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-3/4 bg-surface-2" />
            <div className="h-4 w-1/2 bg-surface-2" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="border border-edge p-4">
              <div className="h-3 w-16 bg-surface-2" />
              <div className="mt-3 h-4 w-full bg-surface-2" />
              <div className="mt-2 h-4 w-2/3 bg-surface-2" />
              <div className="mt-4 h-3 w-1/2 bg-surface-2" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="border border-edge p-4">
              <div className="h-4 w-1/3 bg-surface-2" />
              <div className="mt-3 space-y-2">
                <div className="h-3 w-full bg-surface-2" />
                <div className="h-3 w-5/6 bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}