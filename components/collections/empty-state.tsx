import { BookOpen } from "lucide-react"
import Link from "next/link"

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full gold-icon-bg flex items-center justify-center mb-5">
        {icon ?? <BookOpen className="w-8 h-8 text-[#C5A059]" />}
      </div>
      <h3 className="text-lg font-semibold text-[#1a1f36] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="px-5 py-2.5 rounded-lg emerald-button text-sm font-medium"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
