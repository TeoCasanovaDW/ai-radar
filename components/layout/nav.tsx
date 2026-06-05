"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/models", label: "Models" },
  { href: "/methodology", label: "Methodology" },
];

export default function Nav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/models") {
      return pathname === "/models" || pathname.startsWith("/models/");
    }
    return pathname === href;
  }

  return (
    <nav className="flex gap-4 px-6 py-3 border-b">
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={isActive(href) ? "font-semibold underline" : "text-muted-foreground"}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
