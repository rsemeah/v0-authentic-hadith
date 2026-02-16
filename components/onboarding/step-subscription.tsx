"use client"

import { Check, Star, Crown, Zap, Infinity } from "lucide-react"
import { useRouter } from "next/navigation"
import { PRODUCTS } from "@/lib/products"
import type { Product } from "@/lib/products"
import { cn } from "@/lib/utils"

function PriceDisplay({ product }: { product: Product }) {
  if (product.interval === "year") {
    const monthly = (product.priceInCents / 100 / 12).toFixed(2)
    return (
      <div className="text-right shrink-0 ml-4">
        <div className="text-xl font-bold text-foreground">${(product.priceInCents / 100).toFixed(2)}</div>
        <div className="text-xs text-[#C5A059] font-medium">${monthly}/mo</div>
      </div>
    )
  }
  if (product.interval === "month") {
    return (
      <div className="text-right shrink-0 ml-4">
        <div className="text-xl font-bold text-foreground">${(product.priceInCents / 100).toFixed(2)}</div>
        <div className="text-xs text-muted-foreground">per month</div>
      </div>
    )
  }
  return (
    <div className="text-right shrink-0 ml-4">
      <div className="text-xl font-bold text-foreground">${(product.priceInCents / 100).toFixed(2)}</div>
      <div className="text-xs text-muted-foreground">one-time</div>
    </div>
  )
}

const planIcons: Record<string, React.ReactNode> = {
  "monthly-intro": <Zap className="w-4 h-4 text-[#C5A059]" />,
  "monthly-premium": <Star className="w-4 h-4 text-[#C5A059]" />,
  "annual-premium": <Crown className="w-4 h-4 text-[#C5A059]" />,
  "lifetime-access": <Infinity className="w-4 h-4 text-[#C5A059]" />,
}

interface StepSubscriptionProps {
  onSelectPlan: (planId: string) => void
  onContinueFree: () => void
}

export function StepSubscription({ onSelectPlan, onContinueFree }: StepSubscriptionProps) {
  const router = useRouter()

  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-[#C5A059] to-[#E8C77D] flex items-center justify-center">
          <Crown className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Choose Your Plan</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Unlock AI explanations, advanced search, and all learning paths.
        </p>
      </div>

      <div className="space-y-3">
        {PRODUCTS.map((plan) => (
          <button
            key={plan.id}
            type="button"
            onClick={() => onSelectPlan(plan.id)}
            className={cn(
              "w-full text-left rounded-xl p-4 transition-all",
              plan.highlighted
                ? "gold-border premium-card ring-2 ring-[#C5A059]/30"
                : "border border-border bg-card hover:border-[#C5A059]/50",
            )}
          >
            {plan.badge && (
              <span
                className={cn(
                  "inline-block px-2 py-0.5 rounded-full text-white text-[10px] font-bold mb-2",
                  plan.highlighted
                    ? "bg-gradient-to-r from-[#C5A059] to-[#E8C77D]"
                    : plan.id === "lifetime-access"
                      ? "bg-gradient-to-r from-[#1B5E43] to-[#2D7A5B]"
                      : "bg-[#6b7280]",
                )}
              >
                {plan.badge}
              </span>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                  {planIcons[plan.id]}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{plan.name}</h3>
                  {plan.trialDays && (
                    <p className="text-xs text-[#1B5E43] font-medium">{plan.trialDays}-day free trial</p>
                  )}
                </div>
              </div>
              <PriceDisplay product={plan} />
            </div>
            {plan.features && (
              <ul className="mt-3 space-y-1">
                {plan.features.slice(0, 3).map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-xs text-foreground/70">
                    <Check className="w-3 h-3 text-[#1B5E43] shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </button>
        ))}
      </div>

      {/* Free tier option */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onContinueFree}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Continue with free plan
        </button>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Browse collections & basic search included free
        </p>
      </div>
    </div>
  )
}
