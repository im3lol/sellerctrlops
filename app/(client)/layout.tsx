import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { Logo } from "@/components/brand/logo";
import { UserMenu } from "@/components/app-shell/user-menu";
import { PortalSidebar } from "@/components/portal/portal-sidebar";
import type { Role } from "@/lib/rbac";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  // Staff belong in the main app; only partners use the portal.
  if (user.role !== "client") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-muted/30">
      <PortalSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
          <Logo className="text-2xl text-primary lg:hidden" />
          <span className="hidden text-sm font-medium text-muted-foreground lg:block">بوابة الشركاء</span>
          <UserMenu name={user.name} email={user.email} role={user.role as Role} avatarUrl={user.avatarUrl} />
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
