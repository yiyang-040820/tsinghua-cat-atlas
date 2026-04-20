import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCats } from "@/hooks/use-cats";
import { Modal, FormField, inputCls, SubmitButton } from "./_shared";
import { RELATION_LABELS } from "@/lib/cat-constants";

export function AddRelationshipDialog({
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
  const { cats } = useCats();
  const others = cats.filter((c) => c.id !== catId);
  const [otherId, setOtherId] = useState("");
  const [type, setType] = useState<keyof typeof RELATION_LABELS>("friend");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otherId) return toast.error("请选择另一只猫");
    setSubmitting(true);
    try {
      const { error } = await supabase.from("cat_relationships").insert({
        cat_a_id: catId,
        cat_b_id: otherId,
        relation_type: type,
        description: desc.trim() || null,
      });
      if (error) throw error;
      toast.success("关系已记录 💞");
      setOtherId("");
      setDesc("");
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message ?? "添加失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="添加猫咪关系">
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField label="关联到哪只猫" required>
          <select value={otherId} onChange={(e) => setOtherId(e.target.value)} className={inputCls}>
            <option value="">— 选择一只猫 —</option>
            {others.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </FormField>
        <FormField label="关系类型" required>
          <select value={type} onChange={(e) => setType(e.target.value as any)} className={inputCls}>
            {Object.entries(RELATION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </FormField>
        <FormField label="关系说明">
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="例如：经常一起吃饭"
            className={inputCls}
            maxLength={200}
          />
        </FormField>
        <SubmitButton pending={submitting}>添加关系</SubmitButton>
      </form>
    </Modal>
  );
}
