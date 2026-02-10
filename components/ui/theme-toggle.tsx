"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "default" | "compact" | "settings";
  className?: string;
}

export function ThemeToggle({
  variant = "default",
  className,
}: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn("h-10 w-10 rounded-lg bg-muted animate-pulse", className)}
      />
    );
  }

  if (variant === "compact") {
    return (
      <button
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        className={cn(
          "relative inline-flex h-10 w-10 items-center justify-center rounded-lg",
          "border border-[#e5e7eb] bg-[#F8F6F2] hover:border-[#C5A059]",
          "dark:border-[#374151] dark:bg-[#1f2937] dark:hover:border-[#C5A059]",
          "transition-colors duration-200",
          className,
        )}
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-[#C5A059]" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-[#C5A059]" />
      </button>
    );
  }

  if (variant === "settings") {
    const themes = [
      { value: "light", icon: Sun, label: "Light" },
      { value: "dark", icon: Moon, label: "Dark" },
      { value: "system", icon: Monitor, label: "System" },
    ];

    return (
      <div className={cn("space-y-3", className)}>
        {themes.map((item) => (
          <button
            key={item.value}
            onClick={() => setTheme(item.value)}
            className={cn(
              "w-full rounded-xl p-4 flex items-center gap-4 text-left transition-all",
              "border",
              theme === item.value
                ? "border-[#C5A059] bg-[#C5A059]/10 dark:bg-[#C5A059]/20"
                : "border-[#e5e7eb] dark:border-[#374151] bg-white dark:bg-[#1f2937] hover:border-[#C5A059]/50",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                theme === item.value
                  ? "bg-[#C5A059] text-white"
                  : "bg-[#C5A059]/10 text-[#C5A059]",
              )}
            >
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3
                className={cn(
                  "font-medium",
                  theme === item.value
                    ? "text-[#C5A059]"
                    : "text-[#1a1f36] dark:text-white",
                )}
              >
                {item.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {item.value === "light" && "Always use light mode"}
                {item.value === "dark" && "Always use dark mode"}
                {item.value === "system" && "Match your device settings"}
              </p>
            </div>
            {theme === item.value && (
              <div className="w-5 h-5 rounded-full bg-[#C5A059] flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Default variant - dropdown style
  return (
    <div
      className={cn(
        "relative inline-flex gap-1 p-1 rounded-lg border border-[#e5e7eb] dark:border-[#374151] bg-[#F8F6F2] dark:bg-[#1f2937]",
        className,
      )}
    >
      {[
        { value: "light", icon: Sun },
        { value: "system", icon: Monitor },
        { value: "dark", icon: Moon },
      ].map((item) => (
        <button
          key={item.value}
          onClick={() => setTheme(item.value)}
          className={cn(
            "relative inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            theme === item.value
              ? "bg-white dark:bg-[#374151] shadow-sm text-[#C5A059]"
              : "text-[#6b7280] hover:text-[#C5A059]",
          )}
          aria-label={`${item.value} theme`}
        >
          <item.icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

// Export a simple hook for checking dark mode
export function useIsDarkMode() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? resolvedTheme === "dark" : false;
}
