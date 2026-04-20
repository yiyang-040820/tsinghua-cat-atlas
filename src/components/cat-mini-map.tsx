import { useEffect, useRef } from "react";
import L from "leaflet";
import type { Sighting } from "@/hooks/use-cats";

// 清华大学中心坐标
export const TSINGHUA_CENTER: [number, number] = [40.0033, 116.3262];

export function CatMiniMap({ sightings }: { sightings: Sighting[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const center: [number, number] =
      sightings.length > 0
        ? [sightings[0].latitude, sightings[0].longitude]
        : TSINGHUA_CENTER;

    const map = L.map(ref.current, { zoomControl: true, attributionControl: false }).setView(center, 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;

    sightings.forEach((s) => {
      const icon = L.divIcon({
        className: "",
        html: `<div class="cat-marker" style="width:32px;height:32px;">🐱</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      L.marker([s.latitude, s.longitude], { icon })
        .bindPopup(`<strong>${s.location_name}</strong>${s.notes ? `<br/>${s.notes}` : ""}`)
        .addTo(map);
    });

    if (sightings.length > 1) {
      const bounds = L.latLngBounds(sightings.map((s) => [s.latitude, s.longitude]));
      map.fitBounds(bounds, { padding: [30, 30] });
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [sightings]);

  return <div ref={ref} className="h-72 md:h-96 w-full rounded-xl overflow-hidden border border-border" />;
}
