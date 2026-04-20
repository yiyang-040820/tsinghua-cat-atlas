import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { useAllRelationships } from "@/hooks/use-cats";
import { RELATION_LABELS } from "@/lib/cat-constants";

export const Route = createFileRoute("/relationships")({
  component: RelGraph,
  head: () => ({
    meta: [
      { title: "关系网络 · 清华猫咪图鉴" },
      { name: "description", content: "用网络图查看清华园猫咪之间的家族、伴侣、朋友与对头关系。" },
      { property: "og:title", content: "猫咪关系网络" },
    ],
  }),
});

function RelGraph() {
  const { rels, cats, loading } = useAllRelationships();
  const ref = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || !ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();
    const width = ref.current.clientWidth;
    const height = ref.current.clientHeight;

    if (cats.length === 0) return;

    const nodes = cats.map((c) => ({
      id: c.id,
      name: c.name,
      img: c.cover_photo_url,
    }));
    const links = rels.map((r) => ({
      source: r.cat_a_id,
      target: r.cat_b_id,
      type: r.relation_type,
    }));

    const sim = d3
      .forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(110))
      .force("charge", d3.forceManyBody().strength(-260))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide(38));

    const defs = svg.append("defs");
    nodes.forEach((n) => {
      if (!n.img) return;
      const pat = defs.append("pattern")
        .attr("id", `img-${n.id}`)
        .attr("width", 1)
        .attr("height", 1);
      pat.append("image")
        .attr("href", n.img)
        .attr("width", 60)
        .attr("height", 60)
        .attr("preserveAspectRatio", "xMidYMid slice");
    });

    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d: any) => RELATION_LABELS[d.type]?.color ?? "#999")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.6);

    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .on("click", (_e, d: any) => navigate({ to: "/cats/$catId", params: { catId: d.id } }))
      .call(
        d3
          .drag<any, any>()
          .on("start", (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) sim.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    node
      .append("circle")
      .attr("r", 30)
      .attr("fill", (d: any) => (d.img ? `url(#img-${d.id})` : "oklch(0.62 0.22 295)"))
      .attr("stroke", "white")
      .attr("stroke-width", 3);

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", 48)
      .attr("font-size", 12)
      .attr("font-weight", 600)
      .attr("fill", "currentColor")
      .text((d: any) => d.name);

    sim.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => {
      sim.stop();
    };
  }, [cats, rels, loading, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold">猫咪关系网络</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {cats.length} 只猫 · {rels.length} 条关系 · 拖动节点探索，点击进入档案
        </p>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-[var(--shadow-soft)]">
        <svg ref={ref} className="w-full h-[70vh]" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {Object.entries(RELATION_LABELS).map(([k, v]) => (
          <span
            key={k}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-card border border-border"
          >
            <span className="w-3 h-0.5" style={{ background: v.color }} />
            {v.label}
          </span>
        ))}
      </div>
      {!loading && cats.length === 0 && (
        <p className="text-center text-muted-foreground mt-6 text-sm">
          图鉴中还没有猫咪
        </p>
      )}
    </div>
  );
}
