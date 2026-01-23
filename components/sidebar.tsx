"use client";

import {
  Package,
  LayoutDashboard,
  BoxesIcon,
  Settings,
  BarChart3,
  X,
} from "lucide-react";
import Image from "next/image";

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  return (
    <>
      {/* Slim Sidebar */}
      <aside className="w-20 bg-card border-r hidden md:flex flex-col items-center py-4 gap-4">
        <div className="w-12 h-12 flex items-center justify-center mb-4">
          {/* <Package className="w-6 h-6 text-primary" /> */}
          <Image
            src="/images/hkscss-logo.svg"
            alt="HKCSS Logo"
            width={120}
            height={80}
            className="object-contain"
          />
        </div>
        <nav className="flex flex-col gap-3">
          <button
            title="Dashboard"
            className="p-3 rounded-lg hover:bg-accent transition-colors text-foreground"
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>
          {/* <button
            title="Products"
            className="p-3 rounded-lg hover:bg-accent transition-colors text-foreground"
          >
            <BoxesIcon className="w-5 h-5" />
          </button>
          <button
            title="Settings"
            className="p-3 rounded-lg hover:bg-accent transition-colors text-foreground"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            title="Reports"
            className="p-3 rounded-lg hover:bg-accent transition-colors text-foreground"
          >
            <BarChart3 className="w-5 h-5" />
          </button> */}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        >
          <aside className="w-64 bg-card h-full border-r">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Menu</h2>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent text-sm font-medium text-foreground">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent text-sm font-medium text-foreground">
                <BoxesIcon className="w-4 h-4" />
                Products
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent text-sm font-medium text-foreground">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent text-sm font-medium text-foreground">
                <BarChart3 className="w-4 h-4" />
                Reports
              </button>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
