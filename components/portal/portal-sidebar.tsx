"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Icon } from "@/components/icon";
import { PORTAL_NAV } from "@/components/portal/portal-nav";
import { cn } from "@/lib/utils";

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
      <div className="flex h-16 items-center gap-2 px-6">
        <Logo className="text-2xl text-sidebar-foreground" />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {PORTAL_NAV.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <p className="px-3 pb-2 text-xs font-medium text-sidebar-foreground/50">{section.heading}</p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                        active
                          ? "bg-sidebar-foreground/10 font-medium text-sidebar-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground",
                      )}
                    >
                      <Icon name={item.icon} className="size-[18px]" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border/40 p-4 text-xs text-sidebar-foreground/50">
        بوابة الشركاء · SellerCtrl
      </div>
    </aside>
  );
}
