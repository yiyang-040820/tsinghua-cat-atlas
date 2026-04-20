import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import L from "leaflet";
import { supabase } from "@/integrations/supabase/client";
import { Modal, FormField, inputCls, SubmitButton } from "./_shared";
import { TSINGHUA_CENTER } from "@/components/cat-mini-map";

const schema = z.object({
  location_name: z.string().trim().min(1, "请填写地点名").max(80),
  notes: z.string().trim().max(300).optional(),
  reporter: z.string().trim().max(50).optional(),
});

export function AddSightingDialog({
  open,
  onOpenChange,
  catId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  catId: string;
  onSuccess: () => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInst = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [coords, setCoords] = useState<[number, number]>(TSINGHUA_CENTER);
  const [locationName, setLocationName] = useState("");
  const [notes, setNotes] = useState("");
  const [reporter, setReporter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !mapRef.current || mapInst.current) return;
    const map = L.map(mapRef.current, { attributionControl: false }).setView(TSINGHUA_CENTER, 15);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    const icon = L.divIcon({
      className: "",
      html: `<div class="cat-marker" style="width:32px;height:32px;">🐱</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
    markerRef.current = L.marker(TSINGHUA_CENTER, { icon, draggable: true }).addTo(map);
    markerRef.current.on("dragend", (e) => {
      const ll = (e.target as L.Marker).getLatLng();
      setCoords([ll.lat, ll.lng]);
    });
    map.on("click", (e) => {
      markerRef.current?.setLatLng(e.latlng);
      setCoords([e.latlng.lat, e.latlng.lng]);
    });
    mapInst.current = map;
    setTimeout(() => map.invalidateSize(), 100);
    return () => {
      map.remove();
      mapInst.current = null;
      markerRef.current = null;
    };
  }, [open]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ location_name: locationName, notes, reporter });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    setSubmitting(true);
    try {
      const { error } = await supabase.from("sightings").insert({
        cat_id: catId,
        location_name: locationName.trim(),
        latitude: coords[0],
        longitude: coords[1],
        notes: notes.trim() || null,
        reporter: reporter.trim() || null,
      });
      if (error) throw error;
      toast.success("出没地点已记录 📍");
      setLocationName("");
      setNotes("");
      setReporter("");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message ?? "记录失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="标记出没地点">
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="在地图上点击或拖动猫咪图标" required hint="默认中心为清华园">
          <div ref={mapRef} className="h-56 w-full rounded-lg overflow-hidden border border-border" />
        </FormField>
        <FormField label="地点名" required>
          <input
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="例如：紫荆 1 号楼前"
            className={inputCls}
            maxLength={80}
          />
        </FormField>
        <FormField label="备注">
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="经常在傍晚出现"
            className={inputCls}
            maxLength={300}
          />
        </FormField>
        <FormField label="报告人">
          <input
            value={reporter}
            onChange={(e) => setReporter(e.target.value)}
            placeholder="你的名字（可选）"
            className={inputCls}
            maxLength={50}
          />
        </FormField>
        <SubmitButton pending={submitting}>记录地点</SubmitButton>
      </form>
    </Modal>
  );
}
