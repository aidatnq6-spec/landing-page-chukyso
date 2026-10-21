export const company = {
  name: "CÔNG TY TNHH DỊCH VỤ GIẢI PHÁP VI-TECH",
  taxId: "0402346583",
  address: "24 Thành Vinh 1, Phường Sơn Trà, Thành Phố Đà Nẵng, Việt Nam",
  phone: "0968.273.868",
  tel: "0968273868",
  zalo: "https://zalo.me/0968273868",
};
export const plans = [
  { id: "ica-1y", years: 1, price: 1792800, bonus: 0 },
  { id: "ica-2y", years: 2, price: 2690000, bonus: 0 },
  { id: "ica-3y", years: 3, price: 3080000, bonus: 6 },
] as const;
export const planNames: Record<string, string> = {
  "ica-1y": "ICA 1 năm",
  "ica-2y": "ICA 2 năm",
  "ica-3y": "ICA 3 năm + 6 tháng",
  consultation: "Cần tư vấn gói / nhà cung cấp khác",
};
export const statusNames = {
  new: "Mới đăng ký",
  contacted: "Đã liên hệ",
  consulting: "Đang tư vấn",
  completed: "Đã hoàn tất",
  "not-interested": "Không có nhu cầu",
} as const;
export const money = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value) + "đ";
