import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useCat } from "@/hooks/use-cats";
import { GENDER_LABELS, RELATION_LABELS, STATUS_LABELS } from "@/lib/cat-constants";
import { AddPhotoDialog } from "@/components/dialogs/add-photo-dialog";
import { AddSightingDialog } from "@/components/dialogs/add-sighting-dialog";
import { AddRelationshipDialog } from "@/components/dialogs/add-relationship-dialog";
import { CatMiniMap } from "@/components/cat-mini-map";

export const Route = createFileRoute("/cats/$catId")({
  component: CatDetail,
  head: ({ params }) => ({
    meta: [
      { title: `猫咪档案 · 清华猫咪图鉴` },
      { name: "description", content: `查看清华园猫咪的详细档案、照片、出没地点与社交关系。` },
      { property: "og:title", content: `猫咪档案 · 清华猫咪图鉴` },
    ],
  }),
});

function CatDetail() {
  const { catId } = Route.useParams();
  const navigate = useNavigate();
  const { cat, photos, sightings, relationships, loading, refetch } = useCat(catId);
  const [openPhoto, setOpenPhoto] = useState(false);
  const [openSight, setOpenSight] = useState(false);
  const [openRel, setOpenRel] = useState(false);

  if (loading) return <p className="text-center py-20 text-muted-foreground">载入中...</p>;
  if (!cat) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😿</div>
        <h1 className="font-display text-2xl font-bold">没找到这只猫</h1>
        <Link to="/cats" className="text-primary hover:underline mt-4 inline-block">
          ← 返回图鉴
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <Link to="/cats" className="text-sm text-muted-foreground hover:text-primary">
        ← 返回图鉴
      </Link>

      {/* Header */}
      <div className="grid md:grid-cols-[300px_1fr] gap-8 mt-6">
        <div className="aspect-square rounded-2xl overflow-hidden bg-muted shadow-[var(--shadow-elegant)]">
          {cat.cover_photo_url ? (
            <img src={cat.cover_photo_url} alt={cat.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-8xl">🐱</div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 text-[10px] rounded-full bg-primary/15 text-primary border border-primary/30">
              {STATUS_LABELS[cat.status ?? "active"]}
            </span>
            <span className="text-xs text-muted-foreground">
              {GENDER_LABELS[cat.gender ?? "unknown"]}
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold">{cat.name}</h1>
          {cat.nicknames && cat.nicknames.length > 0 && (
            <p className="text-muted-foreground mt-2">
              又名：{cat.nicknames.join("、")}
            </p>
          )}
          {cat.color && (
            <div className="mt-4">
              <span className="text-xs text-muted-foreground">毛色</span>
              <p className="text-foreground">{cat.color}</p>
            </div>
          )}
          {cat.personality && (
            <div className="mt-3">
              <span className="text-xs text-muted-foreground">性格</span>
              <p className="text-foreground">{cat.personality}</p>
            </div>
          )}
          {cat.first_seen_date && (
            <div className="mt-3">
              <span className="text-xs text-muted-foreground">首次发现</span>
              <p className="text-foreground">{cat.first_seen_date}</p>
            </div>
          )}
          {cat.bio && (
            <div className="mt-4 p-4 rounded-xl bg-muted/50 border border-border/60">
              <p className="text-sm leading-relaxed whitespace-pre-line">{cat.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* Photos */}
      <Section
        title="照片墙"
        count={photos.length}
        action={<button onClick={() => setOpenPhoto(true)} className="action-btn">+ 上传照片</button>}
      >
        {photos.length === 0 ? (
          <EmptySectionHint text="还没有照片，第一张就由你上传吧 📸" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((p) => (
              <figure key={p.id} className="rounded-xl overflow-hidden bg-muted group">
                <img src={p.photo_url} alt={p.caption ?? cat.name} className="aspect-square w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                {(p.caption || p.photographer) && (
                  <figcaption className="p-2 text-xs">
                    {p.caption && <p className="text-foreground line-clamp-1">{p.caption}</p>}
                    {p.photographer && <p className="text-muted-foreground">📷 {p.photographer}</p>}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        )}
      </Section>

      {/* Sightings */}
      <Section
        title="常出没地点"
        count={sightings.length}
        action={<button onClick={() => setOpenSight(true)} className="action-btn">+ 标记地点</button>}
      >
        {sightings.length === 0 ? (
          <EmptySectionHint text="还没有出没记录，看到它在哪里了？📍" />
        ) : (
          <div className="grid md:grid-cols-[1fr_320px] gap-4">
            <CatMiniMap sightings={sightings} />
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {sightings.map((s) => (
                <li key={s.id} className="p-3 rounded-xl border border-border/60 bg-card text-sm">
                  <div className="font-medium">{s.location_name}</div>
                  {s.notes && <p className="text-xs text-muted-foreground mt-1">{s.notes}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(s.seen_at).toLocaleDateString("zh-CN")}
                    {s.reporter && ` · ${s.reporter}`}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      {/* Relationships */}
      <Section
        title="社交关系"
        count={relationships.length}
        action={<button onClick={() => setOpenRel(true)} className="action-btn">+ 添加关系</button>}
      >
        {relationships.length === 0 ? (
          <EmptySectionHint text="它有什么朋友、伴侣或对头吗？记录下来 💞" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {relationships.map((r) => {
              const meta = RELATION_LABELS[r.relation_type] ?? { label: r.relation_type, color: "var(--primary)" };
              return (
                <Link
                  key={r.id}
                  to="/cats/$catId"
                  params={{ catId: r.other.id }}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card hover:shadow-md transition-shadow"
                >
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {r.other.cover_photo_url ? (
                      <img src={r.other.cover_photo_url} alt={r.other.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xl">🐱</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{r.other.name}</p>
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-[10px] text-white"
                      style={{ background: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </Section>

      <style>{`.action-btn { font-size: 0.75rem; padding: 0.4rem 0.85rem; border-radius: 9999px; background: var(--color-primary); color: var(--color-primary-foreground); transition: opacity 0.2s; } .action-btn:hover { opacity: 0.9; }`}</style>

      <AddPhotoDialog open={openPhoto} onOpenChange={setOpenPhoto} catId={cat.id} onSuccess={refetch} />
      <AddSightingDialog open={openSight} onOpenChange={setOpenSight} catId={cat.id} onSuccess={refetch} />
      <AddRelationshipDialog open={openRel} onOpenChange={setOpenRel} catId={cat.id} onSuccess={refetch} />
    </div>
  );
}

function Section({
  title,
  count,
  action,
  children,
}: {
  title: string;
  count: number;
  action: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl font-bold">
          {title} <span className="text-sm text-muted-foreground font-normal">({count})</span>
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptySectionHint({ text }: { text: string }) {
  return (
    <div className="text-center py-8 rounded-xl border-2 border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
      {text}
    </div>
  );
}
