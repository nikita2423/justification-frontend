"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Stage } from "@/lib/types";

interface ProgressStepperProps {
  currentStage: Stage;
  onStageClick?: (stage: Stage) => void;
  showOnlyCurrentStep?: boolean;
}

const stages = [
  {
    id: 1,
    label: "Upload Products",
    description: "Add files for each product",
  },
  { id: 2, label: "Preview & Edit", description: "Review and modify data" },
  { id: 3, label: "Justification", description: "Submit for justification" },
] as const;

export function ProgressStepper({
  currentStage,
  onStageClick,
  showOnlyCurrentStep = false,
}: ProgressStepperProps) {
  // Filter stages based on showOnlyCurrentStep prop
  const displayStages = showOnlyCurrentStep
    ? stages.filter((stage) => stage.id === currentStage)
    : stages;

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {displayStages.map((stage, index) => {
          const isCompleted = currentStage > stage.id;
          const isCurrent = currentStage === stage.id;
          const isClickable = stage.id <= currentStage;

          return (
            <div key={stage.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <button
                  onClick={() =>
                    isClickable && onStageClick?.(stage.id as Stage)
                  }
                  disabled={!isClickable}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                    isCompleted &&
                      "bg-primary border-primary text-primary-foreground",
                    isCurrent && "border-primary bg-primary/10 text-primary",
                    !isCompleted &&
                      !isCurrent &&
                      "border-muted-foreground/30 text-muted-foreground/50",
                    isClickable && "cursor-pointer hover:scale-105",
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="text-lg font-semibold">{stage.id}</span>
                  )}
                </button>
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      "font-medium text-sm",
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {stage.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
                    {stage.description}
                  </p>
                </div>
              </div>

              {index < displayStages.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-4 transition-colors duration-300",
                    currentStage > stage.id ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
