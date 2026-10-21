export const nameKey = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ");
export const phoneKey = (s: string) =>
  s.replace(/[\s.()\-]/g, "").replace(/^(\+84|84)/, "0");
