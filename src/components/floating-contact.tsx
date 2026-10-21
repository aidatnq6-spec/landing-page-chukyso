"use client";
import { useEffect, useState } from "react";
import { Headset } from "lucide-react";
import { company } from "@/lib/business";
export default function FloatingContact() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const form = document.getElementById("dang-ky");
    if (!form) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(!entry.isIntersecting),
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);
  return visible ? (
    <a
      className="floating-contact"
      href={company.zalo}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Liên hệ VI-TECH qua Zalo"
    >
      <Headset size={22} />
      <span>Zalo tư vấn</span>
    </a>
  ) : null;
}
