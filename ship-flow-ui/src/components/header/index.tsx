'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { Menu } from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);

  // Safely get toggleSidebar function
  let toggleSidebar = onToggleSidebar;
  try {
    const sidebar = useSidebar();
    toggleSidebar = sidebar.toggleSidebar;
  } catch (error) {
    // useSidebar must be used within a SidebarProvider
    // Use the onToggleSidebar prop if provided, otherwise don't show toggle button
  }

  const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register');

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Domestic', href: '/domestic' },
    { name: 'Production', href: '/production' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'Import', href: '/import' },
    { name: 'Exports', href: '/exports' },
    { name: 'Reports', href: '/reports' },
    { name: 'Subscription', href: '/subscription' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {toggleSidebar && (
            <button
              onClick={toggleSidebar}
              className="size-8 rounded-full text-foreground/60 hover:bg-muted/70 flex items-center justify-center"
            >
              <Menu className="size-4" />
            </button>
          )}
          <Link href="/" className="font-semibold text-sm">
            SWIFTLY TRADE
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href === '/reports' && pathname.startsWith('/reports'));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-2 py-1 text-xs rounded-md transition ${
                    isActive ? 'bg-blue-50 text-blue-600' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 pr-6">
          <Button className="text-xs px-3 py-1 rounded-md">Find Buyers</Button>

          {!isAuthPage && (
            <Link href="/designSystem">
              <Button variant="ghost" className="text-xs px-2 py-1">
                Design
              </Button>
            </Link>
          )}

          {token ? (
            <Button
              variant="outline"
              className="text-xs px-2 py-1"
              onClick={() => {
                logout();
                router.push('/login');
              }}
            >
              Logout
            </Button>
          ) : !isAuthPage ? (
            <>
              <Link href="/login">
                <Button variant="outline" className="text-xs px-2 py-1">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="text-xs px-2 py-1">Register</Button>
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
