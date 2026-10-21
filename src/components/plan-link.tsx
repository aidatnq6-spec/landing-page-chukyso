"use client";
export default function PlanLink({
  plan,
  children,
  className = "button",
}: {
  plan?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={plan ? `?plan=${plan}#dang-ky` : "#dang-ky"}
      onClick={(e) => {
        e.preventDefault();
        const url = new URL(window.location.href);
        if (plan) url.searchParams.set("plan", plan);
        else url.searchParams.delete("plan");
        url.hash = "dang-ky";
        window.history.replaceState(null, "", url);
        window.dispatchEvent(new Event("vitech:plan"));
        document.getElementById("dang-ky")?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "instant"
            : "smooth",
        });
      }}
    >
      {children}
    </a>
  );
}
