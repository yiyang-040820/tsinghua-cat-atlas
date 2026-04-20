import { Link } from "@tanstack/react-router";
import type { Database } from "@/integrations/supabase/types";

type Cat = Database["public"]["Tables"]["cats"]["Row"];

const statusLabels: Record<string, { label: string; cls: string }> = {
  active: { label: "活跃", cls: "bg-warm/20 text-warm-foreground border-warm/40" },
  missing: { label: "失踪", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  passed: { label: "已离世", cls: "bg-muted text-muted-foreground border-border" },
  adopted: { label: "已领养", cls: "bg-primary/15 text-primary border-primary/30" },
};

const genderEmoji: Record<string, string> = { male: "♂", female: "♀", unknown: "?" };

export function CatCard({ cat }: { cat: Cat }) {
  const status = statusLabels[cat.status ?? "active"] ?? statusLabels.active;
  return (
    <Link
      to="/cats/$catId"
      params={{ catId: cat.id }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1"
      style={{ background: "var(--gradient-card)" }}
    >
      <div className="aspect-square overflow-hidden bg-muted relative">
        {cat.cover_photo_url ? (
          <img
            src={cat.cover_photo_url}
            alt={cat.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-6xl">🐱</div>
        )}
        <span
          className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] rounded-full border backdrop-blur ${status.cls}`}
        >
          {status.label}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-foreground truncate">
            {cat.name}
            <span className="ml-1 text-sm text-muted-foreground">
              {genderEmoji[cat.gender ?? "unknown"]}
            </span>
          </h3>
        </div>
        {cat.color && (
          <p className="text-xs text-muted-foreground mt-1 truncate">{cat.color}</p>
        )}
        {cat.personality && (
          <p className="text-xs text-foreground/70 mt-2 line-clamp-2">{cat.personality}</p>
        )}
      </div>
    </Link>
  );
}
