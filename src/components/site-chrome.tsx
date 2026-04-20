import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "首页" },
  { to: "/cats", label: "猫咪图鉴" },
  { to: "/map", label: "出没地图" },
  { to: "/relationships", label: "关系网络" },
  { to: "/contribute", label: "贡献新猫" },
] as const;

export function SiteHeader() {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl">🐾</span>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold text-primary">清华猫咪图鉴</span>
            <span className="text-[10px] text-muted-foreground tracking-wider">THU CAT ATLAS</span>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "px-3 py-2 text-sm rounded-md transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          to="/contribute"
          className="md:hidden inline-flex items-center justify-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
        >
          + 贡献
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30 mt-16">
      <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p className="font-display">由清华大学小动物保护协会维护 · 用爱记录每一只校园喵 🐱</p>
        <p className="mt-2 text-xs">所有数据由热心师生共同贡献，欢迎补充</p>
      </div>
    </footer>
  );
}
