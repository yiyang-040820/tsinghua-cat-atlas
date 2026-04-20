export const RELATION_LABELS: Record<string, { label: string; color: string }> = {
  parent: { label: "父母", color: "oklch(0.55 0.2 320)" },
  child: { label: "子女", color: "oklch(0.55 0.2 320)" },
  sibling: { label: "兄弟姐妹", color: "oklch(0.62 0.18 250)" },
  partner: { label: "伴侣", color: "oklch(0.65 0.22 15)" },
  friend: { label: "朋友", color: "oklch(0.7 0.17 145)" },
  neighbor: { label: "邻居", color: "oklch(0.7 0.13 80)" },
  rival: { label: "对头", color: "oklch(0.6 0.22 25)" },
};

export const STATUS_LABELS: Record<string, string> = {
  active: "活跃",
  missing: "失踪",
  passed: "已离世",
  adopted: "已领养",
};

export const GENDER_LABELS: Record<string, string> = {
  male: "公猫 ♂",
  female: "母猫 ♀",
  unknown: "未知",
};
