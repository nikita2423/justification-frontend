"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  RotateCcw,
  LogOut,
  User,
  ChevronDown,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { useLogout } from "@/hooks/use-logout";

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  products: any[];
  resetStore: () => void;
}

export function Header({
  mobileMenuOpen,
  setMobileMenuOpen,
  products,
  resetStore,
}: HeaderProps) {
  const router = useRouter();
  const { user, logout: contextLogout } = useAuth();
  const { logout, loading: logoutLoading } = useLogout();
  const approvedCount = products.filter((p) => p.status === "approved").length;
  const rejectedCount = products.filter((p) => p.status === "rejected").length;

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      contextLogout();
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, [logout, contextLogout, router]);

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              {/* <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div> */}
              <div>
                <h1 className="text-lg font-bold text-foreground">
                  Justification Generator
                </h1>
                <p className="text-xs text-muted-foreground">
                  Data Management & Approval System
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {products.length > 0 && (
              <div className="hidden sm:flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {products.length}
                  </span>{" "}
                  products
                </span>
                {approvedCount > 0 && (
                  <span className="text-success">
                    <span className="font-medium">{approvedCount}</span>{" "}
                    approved
                  </span>
                )}
                {rejectedCount > 0 && (
                  <span className="text-destructive">
                    <span className="font-medium">{rejectedCount}</span>{" "}
                    rejected
                  </span>
                )}
              </div>
            )}

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>
                      {user?.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-3 px-2 py-1.5">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>
                      {user?.name
                        ? user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">
                      {user?.name || "User"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {/* <DropdownMenuItem className="gap-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator /> */}
                <DropdownMenuItem
                  className="gap-2 text-destructive cursor-pointer"
                  onClick={handleLogout}
                  disabled={logoutLoading}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{logoutLoading ? "Logging out..." : "Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {products.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetStore}
                className="gap-2 bg-transparent hidden sm:flex"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
