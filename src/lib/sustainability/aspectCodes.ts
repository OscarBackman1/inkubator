import { categoryCodePrefixes } from "./labels";

type AspectCodeCategory = keyof typeof categoryCodePrefixes;

export function formatCategoryAspectCode(category: AspectCodeCategory, categoryIndex: number) {
  return `${categoryCodePrefixes[category]}-${String(categoryIndex + 1).padStart(2, "0")}`;
}

export function createCategoryAspectDisplayCodes<T extends { category: AspectCodeCategory }>(aspects: T[]) {
  const categoryCounts: Record<AspectCodeCategory, number> = {
    ENVIRONMENT: 0,
    SOCIAL: 0,
    GOVERNANCE: 0,
    CUSTOM: 0
  };

  return aspects.map((aspect) => {
    const displayCode = formatCategoryAspectCode(aspect.category, categoryCounts[aspect.category]);
    categoryCounts[aspect.category] += 1;
    return displayCode;
  });
}
