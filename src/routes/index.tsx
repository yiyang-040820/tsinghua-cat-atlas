import { createFileRoute, Link } from "@tanstack/react-router";
import { useCats } from "@/hooks/use-cats";
import { CatCard } from "@/components/cat-card";
import heroImg from "@/assets/hero-campus-cats.jpg";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "清华猫咪图鉴 · 首页" },
      { name: "description", content: "清华园里的每一只猫，都值得被认识、被记住。浏览猫咪图鉴，查看出没地图，了解它们的故事。" },
      { property: "og:title", content: "清华猫咪图鉴" },
      { property: "og:description", content: "清华园里的每一只猫，都值得被认识、被记住。" },
    ],
  }),
});

function Index() {
  const { cats, loading } = useCats();
  const featured = cats.slice(0, 8);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="清华园里的猫咪"
            className="h-full w-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>
        <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
          <p className="inline-block px-4 py-1 rounded-full bg-primary/10 backdrop-blur text-primary text-xs font-medium tracking-wider mb-6">
            清华大学小动物保护协会出品
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight">
            清华园的<span className="text-primary">每一只猫</span>
            <br />
            都值得被记住
          </h1>
          <p className="mt-6 text-base md:text-lg text-foreground/80 max-w-2xl mx-auto">
            浏览校园猫咪档案，标记出没地点，记录它们之间温暖或微妙的关系。
            欢迎所有清华人共同贡献这份温柔的图鉴。
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/cats"
              className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elegant)] hover:scale-105 transition-transform"
            >
              进入图鉴 →
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center justify-center rounded-full border border-primary/30 bg-background/60 backdrop-blur px-6 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
            >
              查看出没地图
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-3xl mx-auto rounded-2xl border border-border/60 bg-card p-4 md:p-6 shadow-[var(--shadow-soft)]">
          <Stat value={cats.length} label="只猫咪" />
          <Stat value={cats.filter((c) => c.status === "active").length} label="活跃中" />
          <Stat value={cats.filter((c) => c.status === "missing").length} label="待寻找" />
        </div>
      </section>

      {/* Featured */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold">最近收录</h2>
            <p className="text-sm text-muted-foreground mt-1">新加入图鉴的小毛球们</p>
          </div>
          <Link to="/cats" className="text-sm text-primary hover:underline">
            查看全部 →
          </Link>
        </div>
        {loading ? (
          <p className="text-center text-muted-foreground py-12">载入中...</p>
        ) : featured.length === 0 ? (
          <EmptyHomeState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((cat) => (
              <CatCard key={cat.id} cat={cat} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-2xl md:text-4xl font-bold text-primary">{value}</div>
      <div className="text-xs md:text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function EmptyHomeState() {
  return (
    <div className="text-center py-16 rounded-2xl border-2 border-dashed border-border bg-muted/30">
      <div className="text-6xl mb-4">🐾</div>
      <h3 className="font-display text-xl font-bold">图鉴还是空的</h3>
      <p className="text-muted-foreground mt-2 mb-6 text-sm">成为第一个记录清华猫咪的人吧！</p>
      <Link
        to="/contribute"
        className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
      >
        贡献第一只猫
      </Link>
    </div>
  );
}
