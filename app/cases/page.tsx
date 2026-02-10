"use client";

import { CasesList } from "@/components/cases-list";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { useProductStore } from "@/lib/store";
import { useState } from "react";

function CasesPage() {
  const { products, resetStore } = useProductStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col">
        <Header
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          products={products}
          resetStore={resetStore}
        />

        <main className="flex-1 px-4 py-8">
          <CasesList />
        </main>

        {/* Footer */}
        <footer className="border-t py-4 mt-auto">
          <div className="px-4">
            <p className="text-center text-sm text-muted-foreground">
              Product Data Management System • AI-Powered Approval Workflow
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function ProtectedCasesPage() {
  return (
    <ProtectedRoute>
      <CasesPage />
    </ProtectedRoute>
  );
}
