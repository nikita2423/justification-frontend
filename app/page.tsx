"use client";

import { useCallback, useState } from "react";
import { ProgressStepper } from "@/components/progress-stepper";
import { Stage1Upload } from "@/components/stage-1-upload";
import { Stage2Preview } from "@/components/stage-2-preview";
import { Stage3Approval } from "@/components/stage-3-approval";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { useProductStore } from "@/lib/store";
import type { Stage } from "@/lib/types";

function ProductManagementPage() {
  const { currentStage, setStage, resetStore, products } = useProductStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleStageClick = useCallback(
    (stage: Stage) => {
      setStage(stage);
    },
    [setStage],
  );

  const handleNext = useCallback(() => {
    if (currentStage < 3) {
      setStage((currentStage + 1) as Stage);
    }
  }, [currentStage, setStage]);

  const handleBack = useCallback(() => {
    if (currentStage > 1) {
      setStage((currentStage - 1) as Stage);
    }
  }, [currentStage, setStage]);

  const handleComplete = useCallback(() => {
    // Show completion state or reset
    alert("Workflow completed successfully!");
    resetStore();
  }, [resetStore]);

  const approvedCount = products.filter((p) => p.status === "approved").length;
  const rejectedCount = products.filter((p) => p.status === "rejected").length;

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

        {/* Progress Stepper */}
        <div className="border-b bg-card/30">
          <div className="px-4">
            <ProgressStepper
              currentStage={currentStage}
              onStageClick={handleStageClick}
              showOnlyCurrentStep={currentStage === 3}
            />
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 py-8">
          {currentStage === 1 && <Stage1Upload onNext={handleNext} />}
          {currentStage === 2 && (
            <Stage2Preview onNext={handleNext} onBack={handleBack} />
          )}
          {currentStage === 3 && (
            <Stage3Approval onBack={handleBack} onComplete={handleComplete} />
          )}
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

export default function ProtectedProductManagementPage() {
  return (
    <ProtectedRoute>
      <ProductManagementPage />
    </ProtectedRoute>
  );
}
