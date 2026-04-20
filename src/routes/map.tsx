import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import L from "leaflet";
import { useAllSightings } from "@/hooks/use-cats";
import { TSINGHUA_CENTER } from "@/components/cat-mini-map";

export const Route = createFileRoute("/map")({
  component: MapPage,
  head: () => ({
    meta: [
      { title: "出没地图 · 清华猫咪图鉴" },
      { name: "description", content: "在清华校园地图上查看每只猫咪的出没地点，点击可跳转猫咪详情。" },
      { property: "og:title", content: "出没地图" },
      { property: "og:description", content: "在地图上发现身边的猫咪。" },
    ],
  }),
});

function MapPage() {
  const { data, loading } = useAllSightings();
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current).setView(TSINGHUA_CENTER, 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || loading) return;
    const layer = L.layerGroup().addTo(map);
    data.forEach((s) => {
      const icon = L.divIcon({
        className: "",
        html: `<div class="cat-marker" style="width:38px;height:38px;font-size:20px;">🐱</div>`,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });
      const popupHtml = `
        <div style="min-width:180px">
          ${s.cat?.cover_photo_url ? `<img src="${s.cat.cover_photo_url}" style="width:100%;height:120px;object-fit:cover;border-radius:8px;margin-bottom:8px"/>` : ""}
          <div style="font-weight:700;font-size:15px;margin-bottom:2px">${s.cat?.name ?? "未知"}</div>
          <div style="font-size:12px;color:#666;margin-bottom:6px">📍 ${s.location_name}</div>
          ${s.notes ? `<div style="font-size:11px;color:#888;margin-bottom:6px">${s.notes}</div>` : ""}
          <a href="/cats/${s.cat_id}" style="display:inline-block;padding:4px 10px;background:var(--color-primary);color:white;border-radius:9999px;font-size:11px;text-decoration:none">查看档案 →</a>
        </div>`;
      L.marker([s.latitude, s.longitude], { icon }).bindPopup(popupHtml).addTo(layer);
    });
    return () => {
      layer.remove();
    };
  }, [data, loading]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">猫咪出没地图</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            校园里共记录 {data.length} 个出没点 · 点击图标查看猫咪
          </p>
        </div>
        <Link
          to="/cats"
          className="text-sm text-primary hover:underline"
        >
          浏览图鉴 →
        </Link>
      </div>
      <div
        ref={ref}
        className="h-[70vh] w-full rounded-2xl overflow-hidden border border-border shadow-[var(--shadow-soft)]"
      />
      {!loading && data.length === 0 && (
        <p className="text-center text-muted-foreground mt-6 text-sm">
          还没有任何出没记录，进入猫咪详情页来标记它们的位置吧 📍
        </p>
      )}
    </div>
  );
}
