import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Menu, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ThemeToggle } from "../theme/ThemeToggle";
import { supabase } from "../../lib/supabaseClient";

export type ShellNavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
};

export function signOutLocal(navigate: ReturnType<typeof useNavigate>) {
  localStorage.removeItem("userLoggedIn");
  localStorage.removeItem("fullName");
  localStorage.removeItem("userId");
  void supabase.auth.signOut();
  navigate("/");
}

function NavButtons({
  items,
  activeId,
  onNav,
  extra,
  onPicked,
}: {
  items: ShellNavItem[];
  activeId: string;
  onNav: (id: string) => void;
  extra?: React.ReactNode;
  onPicked?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 px-3" aria-label="Main">
      {items.map((item) => {
        const current = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-current={current ? "page" : undefined}
            onClick={() => {
              onNav(item.id);
              onPicked?.();
            }}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all",
              current
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            )}
          >
            <item.icon size={18} aria-hidden />
            {item.label}
          </button>
        );
      })}
      {extra}
    </nav>
  );
}

export function AppShell({
  title,
  subtitle,
  navItems,
  activeId,
  onNav,
  extraNav,
  headerExtra,
  userName,
  userCaption,
  userMenu,
  children,
}: {
  title: string;
  subtitle?: React.ReactNode;
  navItems: ShellNavItem[];
  activeId: string;
  onNav: (id: string) => void;
  extraNav?: React.ReactNode;
  headerExtra?: React.ReactNode;
  userName: string;
  userCaption: string;
  userMenu?: React.ReactNode;
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const brand = (
    <Link to="/" className="flex items-center gap-2.5 px-6 py-6 transition-opacity hover:opacity-90">
      <img src="/greentech-logo.png" alt="" className="h-7 w-7 object-contain" />
      <span className="font-display text-lg font-bold tracking-tight text-foreground">GreenTech</span>
    </Link>
  );

  const signOut = (
    <div className="border-t border-border/40 px-3 py-4">
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={() => signOutLocal(navigate)}
      >
        <LogOut size={18} />
        Sign Out
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground dark-glow-bg">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border/40 bg-card/80 backdrop-blur-xl md:flex">
        {brand}
        <NavButtons items={navItems} activeId={activeId} onNav={onNav} extra={extraNav} />
        {signOut}
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex w-72 flex-col p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          {brand}
          <NavButtons
            items={navItems}
            activeId={activeId}
            onNav={onNav}
            extra={extraNav}
            onPicked={() => setOpen(false)}
          />
          {signOut}
        </SheetContent>
      </Sheet>

      <main id="main-content" className="flex min-h-screen flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-30 border-b border-border/40 bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-8 md:py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-xl md:hidden"
                aria-label="Open navigation"
                onClick={() => setOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div className="min-w-0">
                <h1 className="font-display truncate text-xl font-bold tracking-tight text-foreground md:text-2xl">
                  {title}
                </h1>
                {subtitle && <div className="text-sm text-muted-foreground">{subtitle}</div>}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 md:gap-4">
              {headerExtra}
              <ThemeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2 rounded-xl px-3 py-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 font-semibold text-primary">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden max-w-[120px] truncate text-sm font-medium sm:inline">{userName}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{userName}</p>
                      <p className="text-xs font-normal text-muted-foreground">{userCaption}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userMenu}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-destructive focus:text-destructive"
                    onClick={() => signOutLocal(navigate)}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
