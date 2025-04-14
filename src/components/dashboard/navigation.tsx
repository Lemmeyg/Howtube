import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Home,
  FileText,
  Settings,
  Video,
  Edit,
} from 'lucide-react';

export function DashboardNavigation() {
  const pathname = usePathname();

  const links = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Home,
    },
    {
      href: '/dashboard/videos',
      label: 'Videos',
      icon: Video,
    },
    {
      href: '/editor',
      label: 'Editor',
      icon: Edit,
    },
    {
      href: '/dashboard/documents',
      label: 'Documents',
      icon: FileText,
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Button
            key={link.href}
            variant={isActive ? 'secondary' : 'ghost'}
            className={cn(
              'justify-start',
              isActive && 'bg-accent'
            )}
            asChild
          >
            <Link href={link.href}>
              <link.icon className="mr-2 h-4 w-4" />
              {link.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
} 