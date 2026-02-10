"use client";

import { Trash2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookmarkedHadithCardProps {
  bookmark: {
    id: string;
    item_id: string;
    item_type: string;
    created_at: string;
    hadiths: {
      id: string;
      arabic_text: string;
      english_translation: string;
      collection: string;
      reference: string;
      grade: string;
      summary_line: string;
    };
  };
  onRemove?: () => void;
  onClick?: () => void;
}

const gradeColors: Record<string, string> = {
  sahih: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  hasan: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  daif: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export function BookmarkedHadithCard({
  bookmark,
  onRemove,
  onClick,
}: BookmarkedHadithCardProps) {
  const hadith = bookmark.hadiths;
  if (!hadith) return null;

  return (
    <div className="group premium-card gold-border rounded-xl overflow-hidden transition-all hover:shadow-md">
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left p-4"
      >
        {/* Meta row */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            {hadith.collection}
          </span>
          <span className="text-muted-foreground/40">|</span>
          <span className="text-xs text-muted-foreground">
            {hadith.reference}
          </span>
          {hadith.grade && (
            <span
              className={cn(
                "px-1.5 py-0.5 rounded-full text-[10px] font-medium capitalize",
                gradeColors[hadith.grade?.toLowerCase()] ||
                  "bg-muted text-muted-foreground",
              )}
            >
              {hadith.grade}
            </span>
          )}
        </div>

        {/* Summary or translation */}
        {hadith.summary_line ? (
          <p className="text-sm font-semibold text-foreground mb-1 line-clamp-1">
            {hadith.summary_line}
          </p>
        ) : null}
        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
          {hadith.english_translation}
        </p>

        {/* Saved date */}
        <p className="text-[10px] text-muted-foreground mt-2">
          Saved {new Date(bookmark.created_at).toLocaleDateString()}
        </p>
      </button>

      {/* Action bar */}
      <div className="flex items-center justify-end gap-1 px-3 pb-3">
        <button
          type="button"
          onClick={onClick}
          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          aria-label="View hadith"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-500 transition-colors"
            aria-label="Remove bookmark"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
