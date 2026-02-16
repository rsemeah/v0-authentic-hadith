"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const steps = [{ label: "Profile Setup" }, { label: "Preferences" }, { label: "Safety Guidelines" }, { label: "Choose Your Plan" }]

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Progress Dots */}
      <div className="flex items-center gap-3">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isActive = stepNumber === currentStep

          return (
            <div key={index} className="flex items-center">
              <div
                className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300",
                  isCompleted && "bg-[#1B5E43]",
                  isActive && "gold-dot-active",
                  !isCompleted && !isActive && "bg-[#d4d4d8]",
                )}
              >
                {isCompleted && <Check className="w-3 h-3 text-white" />}
              </div>
              {index < totalSteps - 1 && (
                <div
                  className={cn(
                    "w-8 h-0.5 ml-3 transition-colors duration-300",
                    stepNumber < currentStep ? "bg-[#1B5E43]" : "bg-[#d4d4d8]",
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Step Label */}
      <p className="text-sm text-muted-foreground">
        Step {currentStep} of {totalSteps}: {steps[currentStep - 1]?.label}
      </p>
    </div>
  )
}
