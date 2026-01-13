"use client"

import { useRouter } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const router = useRouter()

  return (
    <nav aria-label="Breadcrumb navigation" className="hidden md:flex items-center gap-1 text-sm overflow-x-auto">
      <button
        onClick={() => router.push("/home")}
        className="flex items-center gap-1 text-muted-foreground hover:text-[#C5A059] transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center gap-1">
            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            {isLast ? (
              <span className="font-semibold text-[#C5A059] truncate max-w-[200px]">{item.label}</span>
            ) : (
              <button
                onClick={() => item.href && router.push(item.href)}
                className={cn(
                  "text-muted-foreground hover:text-[#C5A059] transition-colors truncate max-w-[150px]",
                  !item.href && "cursor-default",
                )}
              >
                {item.label}
              </button>
            )}
          </div>
        )
      })}
    </nav>
  )
}
