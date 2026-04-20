import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useCats } from "@/hooks/use-cats";
import { CatCard } from "@/components/cat-card";
import { STATUS_LABELS } from "@/lib/cat-constants";

export const Route = createFileRoute("/cats")({
  component: CatsPage,
  head: () => ({
    meta: [
      { title: "猫咪图鉴 · 清华猫咪图鉴" },
      { name: "description", content: "浏览清华园所有已记录的猫咪档案，按状态、毛色筛选搜索。" },
      { property: "og:title", content: "猫咪图鉴" },
      { property: "og:description", content: "浏览清华园所有已记录的猫咪档案。" },
    ],
  }),
});

function CatsPage() {
  const { cats, loading } = useCats();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    return cats.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (!q) return true;
      const hay = `${c.name} ${c.nicknames?.join(" ") ?? ""} ${c.color ?? ""} ${c.personality ?? ""}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [cats, q, status]);

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">猫咪图鉴</h1>
          <p className="text-muted-foreground mt-1 text-sm">共收录 {cats.length} 只校园猫咪</p>
        </div>
        <Link
          to="/contribute"
          className="self-start inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:scale-105 transition-transform"
        >
          + 贡献新猫咪
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索名字、昵称、毛色、性格..."
          className="flex-1 rounded-full border border-border bg-card px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="flex gap-2 flex-wrap">
          {[["all", "全部"], ...Object.entries(STATUS_LABELS)].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setStatus(v)}
              className={`px-4 py-2 rounded-full text-xs transition-colors ${
                status === v
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border hover:bg-accent"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground py-16">载入中...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border bg-muted/30">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-muted-foreground">没有找到符合条件的猫咪</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((cat) => (
            <CatCard key={cat.id} cat={cat} />
          ))}
        </div>
      )}
    </div>
  );
}
