'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Package,
  FileText,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { ApiSettings } from './api-settings'
import { useState } from 'react'

export function Navigation() {
  const pathname = usePathname()
  const [showSettings, setShowSettings] = useState(false)

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      active: pathname === '/dashboard',
    },
    {
      label: 'Products',
      icon: Package,
      href: '/products',
      active: pathname === '/products',
    },
    {
      label: 'Invoices',
      icon: FileText,
      href: '/invoices',
      active: pathname === '/invoices',
    },
  ]

  return (
    <>
      <aside className="fixed left-0 top-0 h-screen w-64 border-r border-border/50 bg-background/80 backdrop-blur-xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border/30">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Inventory
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            API Showcase
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2">
          {routes.map((route) => {
            const Icon = route.icon
            return (
              <Link key={route.href} href={route.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 text-base',
                    route.active &&
                      'bg-primary/10 text-primary hover:bg-primary/20'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1 text-left">{route.label}</span>
                  {route.active && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-border/30">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="w-5 h-5" />
            <span>API Settings</span>
          </Button>
        </div>
      </aside>

      {/* Settings Dialog */}
      <ApiSettings open={showSettings} onOpenChange={setShowSettings} />

      {/* Main Content */}
      <div className="ml-64 min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        <div className="h-full">
          {/* This div will be replaced with page content via children in layout */}
        </div>
      </div>
    </>
  )
}
