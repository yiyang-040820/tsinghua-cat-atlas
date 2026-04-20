import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Modal, FormField, inputCls, SubmitButton, useUploadPhoto } from "./_shared";

const schema = z.object({
  caption: z.string().trim().max(200).optional(),
  photographer: z.string().trim().max(50).optional(),
});

export function AddPhotoDialog({
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
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [photographer, setPhotographer] = useState("");
  const { upload, uploading } = useUploadPhoto();
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setFile(null);
    setCaption("");
    setPhotographer("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error("请选择一张照片");
    if (file.size > 10 * 1024 * 1024) return toast.error("图片不能超过 10MB");
    const parsed = schema.safeParse({ caption, photographer });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    setSubmitting(true);
    try {
      const url = await upload(file);
      const { error } = await supabase.from("cat_photos").insert({
        cat_id: catId,
        photo_url: url,
        caption: caption || null,
        photographer: photographer || null,
      });
      if (error) throw error;
      toast.success("照片上传成功 📸");
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message ?? "上传失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="上传猫咪照片">
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="照片" required>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className={inputCls}
          />
        </FormField>
        <FormField label="说明">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="例如：晒太阳的午后"
            className={inputCls}
            maxLength={200}
          />
        </FormField>
        <FormField label="摄影者">
          <input
            type="text"
            value={photographer}
            onChange={(e) => setPhotographer(e.target.value)}
            placeholder="你的名字（可选）"
            className={inputCls}
            maxLength={50}
          />
        </FormField>
        <SubmitButton pending={submitting || uploading}>上传照片</SubmitButton>
      </form>
    </Modal>
  );
}
