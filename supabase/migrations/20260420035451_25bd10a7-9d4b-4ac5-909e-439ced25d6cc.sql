-- Cats table
CREATE TABLE public.cats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  nicknames TEXT[],
  gender TEXT CHECK (gender IN ('male','female','unknown')) DEFAULT 'unknown',
  color TEXT,
  personality TEXT,
  bio TEXT,
  first_seen_date DATE,
  status TEXT CHECK (status IN ('active','missing','passed','adopted')) DEFAULT 'active',
  cover_photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cat photos
CREATE TABLE public.cat_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cat_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  caption TEXT,
  photographer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sightings (locations where cats are seen)
CREATE TABLE public.sightings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cat_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  notes TEXT,
  reporter TEXT,
  seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Relationships between cats
CREATE TYPE public.cat_relation_type AS ENUM ('parent','child','sibling','partner','friend','neighbor','rival');

CREATE TABLE public.cat_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cat_a_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  cat_b_id UUID NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  relation_type public.cat_relation_type NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_relation CHECK (cat_a_id <> cat_b_id)
);

CREATE INDEX idx_sightings_cat ON public.sightings(cat_id);
CREATE INDEX idx_photos_cat ON public.cat_photos(cat_id);
CREATE INDEX idx_rel_a ON public.cat_relationships(cat_a_id);
CREATE INDEX idx_rel_b ON public.cat_relationships(cat_b_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_cats_updated_at
BEFORE UPDATE ON public.cats
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sightings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cat_relationships ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Anyone can view cats" ON public.cats FOR SELECT USING (true);
CREATE POLICY "Anyone can view photos" ON public.cat_photos FOR SELECT USING (true);
CREATE POLICY "Anyone can view sightings" ON public.sightings FOR SELECT USING (true);
CREATE POLICY "Anyone can view relationships" ON public.cat_relationships FOR SELECT USING (true);

-- Public insert (wiki-style contribution)
CREATE POLICY "Anyone can add cats" ON public.cats FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can add photos" ON public.cat_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can add sightings" ON public.sightings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can add relationships" ON public.cat_relationships FOR INSERT WITH CHECK (true);

-- Public update for cats only (so editors can refine bio/status). Photos/sightings/rels are append-only.
CREATE POLICY "Anyone can update cats" ON public.cats FOR UPDATE USING (true) WITH CHECK (true);

-- Storage bucket for cat photos
INSERT INTO storage.buckets (id, name, public) VALUES ('cat-photos', 'cat-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Cat photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'cat-photos');

CREATE POLICY "Anyone can upload cat photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cat-photos');