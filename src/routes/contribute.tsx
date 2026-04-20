import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useUploadPhoto, FormField, inputCls } from "@/components/dialogs/_shared";

export const Route = createFileRoute("/contribute")({
  component: ContributePage,
  head: () => ({
    meta: [
      { title: "贡献新猫咪 · 清华猫咪图鉴" },
      { name: "description", content: "添加一只新的清华校园猫咪到图鉴中，记录它的故事。" },
      { property: "og:title", content: "贡献新猫咪" },
    ],
  }),
});

const schema = z.object({
  name: z.string().trim().min(1, "请填写猫咪名字").max(40),
  nicknames: z.string().trim().max(200).optional(),
  gender: z.enum(["male", "female", "unknown"]),
  status: z.enum(["active", "missing", "passed", "adopted"]),
  color: z.string().trim().max(80).optional(),
  personality: z.string().trim().max(200).optional(),
  bio: z.string().trim().max(2000).optional(),
  first_seen_date: z.string().optional(),
});

function ContributePage() {
  const navigate = useNavigate();
  const { upload, uploading } = useUploadPhoto();
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "",
    nicknames: "",
    gender: "unknown" as const,
    status: "active" as const,
    color: "",
    personality: "",
    bio: "",
    first_seen_date: "",
  });

  const update = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);
    if (file && file.size > 10 * 1024 * 1024) return toast.error("封面图不能超过 10MB");

    setSubmitting(true);
    try {
      let coverUrl: string | null = null;
      if (file) coverUrl = await upload(file);

      const nicknamesArr = form.nicknames
        ? form.nicknames.split(/[,，、\s]+/).filter(Boolean)
        : null;

      const { data, error } = await supabase
        .from("cats")
        .insert([{
          name: form.name.trim(),
          nicknames: nicknamesArr,
          gender: form.gender,
          status: form.status,
          color: form.color.trim() || null,
          personality: form.personality.trim() || null,
          bio: form.bio.trim() || null,
          first_seen_date: form.first_seen_date || null,
          cover_photo_url: coverUrl,
        }])
        .select()
        .single();
      if (error) throw error;
      toast.success(`${form.name} 已加入图鉴！🎉`);
      navigate({ to: "/cats/$catId", params: { catId: data.id } });
    } catch (err: any) {
      toast.error(err.message ?? "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <div className="text-center mb-10">
        <div className="text-5xl mb-3">🐾</div>
        <h1 className="font-display text-3xl md:text-4xl font-bold">贡献一只新猫咪</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          记录它的样子、性格和故事 · 后续还可以补充照片、地点和关系
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 p-6 md:p-8 rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]"
      >
        <FormField label="封面照片" hint="一张代表性的照片（可选，最大 10MB）">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={inputCls}
          />
        </FormField>

        <FormField label="名字" required>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="例如：橘座、二筒"
            className={inputCls}
            maxLength={40}
          />
        </FormField>

        <FormField label="昵称" hint="多个昵称用逗号或空格分隔">
          <input
            value={form.nicknames}
            onChange={(e) => update("nicknames", e.target.value)}
            placeholder="例如：胖橘, 馒头"
            className={inputCls}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="性别">
            <select value={form.gender} onChange={(e) => update("gender", e.target.value)} className={inputCls}>
              <option value="unknown">未知</option>
              <option value="male">公猫 ♂</option>
              <option value="female">母猫 ♀</option>
            </select>
          </FormField>
          <FormField label="状态">
            <select value={form.status} onChange={(e) => update("status", e.target.value)} className={inputCls}>
              <option value="active">活跃</option>
              <option value="missing">失踪</option>
              <option value="adopted">已领养</option>
              <option value="passed">已离世</option>
            </select>
          </FormField>
        </div>

        <FormField label="毛色 / 外貌">
          <input
            value={form.color}
            onChange={(e) => update("color", e.target.value)}
            placeholder="例如：橘白色，大眼睛"
            className={inputCls}
            maxLength={80}
          />
        </FormField>

        <FormField label="性格">
          <input
            value={form.personality}
            onChange={(e) => update("personality", e.target.value)}
            placeholder="例如：亲人，喜欢蹭腿"
            className={inputCls}
            maxLength={200}
          />
        </FormField>

        <FormField label="首次发现日期">
          <input
            type="date"
            value={form.first_seen_date}
            onChange={(e) => update("first_seen_date", e.target.value)}
            className={inputCls}
          />
        </FormField>

        <FormField label="详细介绍">
          <textarea
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="它的故事、习惯、有趣的事..."
            className={`${inputCls} min-h-32 resize-y`}
            maxLength={2000}
          />
        </FormField>

        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elegant)] hover:opacity-90 disabled:opacity-50 transition"
        >
          {submitting || uploading ? "提交中..." : "提交，加入图鉴 🐾"}
        </button>
      </form>
    </div>
  );
}
