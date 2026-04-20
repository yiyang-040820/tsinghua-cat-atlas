import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Cat = Database["public"]["Tables"]["cats"]["Row"];
export type CatPhoto = Database["public"]["Tables"]["cat_photos"]["Row"];
export type Sighting = Database["public"]["Tables"]["sightings"]["Row"];
export type Relationship = Database["public"]["Tables"]["cat_relationships"]["Row"];

export function useCats() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("cats").select("*").order("created_at", { ascending: false });
    setCats(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { cats, loading, refetch };
}

export function useCat(catId: string | undefined) {
  const [cat, setCat] = useState<Cat | null>(null);
  const [photos, setPhotos] = useState<CatPhoto[]>([]);
  const [sightings, setSightings] = useState<Sighting[]>([]);
  const [relationships, setRelationships] = useState<(Relationship & { other: Cat })[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!catId) return;
    setLoading(true);
    const [catRes, photosRes, sightingsRes, relRes] = await Promise.all([
      supabase.from("cats").select("*").eq("id", catId).maybeSingle(),
      supabase.from("cat_photos").select("*").eq("cat_id", catId).order("created_at", { ascending: false }),
      supabase.from("sightings").select("*").eq("cat_id", catId).order("seen_at", { ascending: false }),
      supabase
        .from("cat_relationships")
        .select("*")
        .or(`cat_a_id.eq.${catId},cat_b_id.eq.${catId}`),
    ]);
    setCat(catRes.data);
    setPhotos(photosRes.data ?? []);
    setSightings(sightingsRes.data ?? []);

    const rels = relRes.data ?? [];
    const otherIds = rels.map((r) => (r.cat_a_id === catId ? r.cat_b_id : r.cat_a_id));
    if (otherIds.length) {
      const { data: others } = await supabase.from("cats").select("*").in("id", otherIds);
      const map = new Map((others ?? []).map((c) => [c.id, c]));
      setRelationships(
        rels
          .map((r) => {
            const otherId = r.cat_a_id === catId ? r.cat_b_id : r.cat_a_id;
            const other = map.get(otherId);
            return other ? { ...r, other } : null;
          })
          .filter((x): x is Relationship & { other: Cat } => x !== null)
      );
    } else {
      setRelationships([]);
    }
    setLoading(false);
  }, [catId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { cat, photos, sightings, relationships, loading, refetch };
}

export function useAllSightings() {
  const [data, setData] = useState<(Sighting & { cat: Cat })[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data: sights } = await supabase
        .from("sightings")
        .select("*, cat:cats(*)")
        .order("seen_at", { ascending: false });
      setData((sights ?? []) as any);
      setLoading(false);
    })();
  }, []);
  return { data, loading };
}

export function useAllRelationships() {
  const [rels, setRels] = useState<Relationship[]>([]);
  const [cats, setCats] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const [r, c] = await Promise.all([
        supabase.from("cat_relationships").select("*"),
        supabase.from("cats").select("*"),
      ]);
      setRels(r.data ?? []);
      setCats(c.data ?? []);
      setLoading(false);
    })();
  }, []);
  return { rels, cats, loading };
}
