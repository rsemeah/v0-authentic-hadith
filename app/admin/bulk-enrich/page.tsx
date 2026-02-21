"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Play, Square, Loader2, Zap } from "lucide-react"

export default function BulkEnrichPage() {
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState<string[]>([])
  const [stats, setStats] = useState({ success: 0, failed: 0, rounds: 0 })
  const [batchSize, setBatchSize] = useState(25)
  const [totalHadiths, setTotalHadiths] = useState(0)
  const [totalEnriched, setTotalEnriched] = useState(0)
  const stopRef = useRef(false)
  const logEndRef = useRef<HTMLDivElement>(null)

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }, [])

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [log])

  // Fetch counts on mount
  useEffect(() => {
    async function fetchCounts() {
      const supabase = getSupabaseBrowserClient()
      const { count: total } = await supabase.from("hadiths").select("id", { count: "exact", head: true })
      const { count: enriched } = await supabase.from("hadith_enrichment").select("id", { count: "exact", head: true })
      setTotalHadiths(total || 0)
      setTotalEnriched(enriched || 0)
    }
    fetchCounts()
  }, [stats])

  const getToken = async () => {
    const supabase = getSupabaseBrowserClient()
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token || ""
  }

  const runBatch = async () => {
    stopRef.current = false
    setRunning(true)
    setLog([])
    setStats({ success: 0, failed: 0, rounds: 0 })

    addLog(`Starting bulk enrichment (batch size: ${batchSize})...`)

    const token = await getToken()
    if (!token) {
      addLog("ERROR: Not authenticated. Please sign in first.")
      setRunning(false)
      return
    }

    let offset = 0
    let totalSuccess = 0
    let totalFailed = 0
    let round = 0
    let consecutiveEmpty = 0

    while (!stopRef.current) {
      round++
      addLog(`Round ${round} (offset: ${offset})...`)

      try {
        const res = await fetch("/api/enrich/bulk-process", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            offset,
            batch_size: batchSize,
          }),
        })

        const result = await res.json()

        if (!res.ok) {
          addLog(`ERROR: ${result.error || res.statusText}`)
          // Wait and retry
          await new Promise((r) => setTimeout(r, 5000))
          continue
        }

        totalSuccess += result.success || 0
        totalFailed += result.failed || 0
        setStats({ success: totalSuccess, failed: totalFailed, rounds: round })

        addLog(`  +${result.success} success, ${result.failed} failed (total: ${totalSuccess})`)

        if (result.errors?.length > 0) {
          for (const err of result.errors.slice(0, 3)) {
            addLog(`  ERR: ${err}`)
          }
        }

        if (result.processed === 0) {
          consecutiveEmpty++
          if (consecutiveEmpty >= 3) {
            addLog("No more hadiths to process! All done.")
            break
          }
        } else {
          consecutiveEmpty = 0
        }

        offset = result.next_offset || offset + batchSize * 4

        // Brief delay between batches
        await new Promise((r) => setTimeout(r, 500))
      } catch (err) {
        addLog(`Network error: ${err instanceof Error ? err.message : "unknown"}`)
        await new Promise((r) => setTimeout(r, 3000))
        offset += batchSize * 4
      }
    }

    if (stopRef.current) {
      addLog("Stopped by user.")
    }

    addLog(`=== COMPLETE: ${totalSuccess} success, ${totalFailed} failed in ${round} rounds ===`)
    setRunning(false)
  }

  const stopBatch = () => {
    stopRef.current = true
    addLog("Stopping after current batch...")
  }

  const remaining = totalHadiths - totalEnriched
  const pct = totalHadiths > 0 ? Math.round((totalEnriched / totalHadiths) * 100) : 0

  return (
    <div className="min-h-screen bg-[#f8f7f4] p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-[#1a1f36]">Bulk Hadith Enrichment</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Process all hadiths through GPT-4o-mini to generate key teachings, summaries, categories, and tags.
            </p>
          </div>
          <Zap className="w-8 h-8 text-[#C5A059]" />
        </div>

        {/* Progress */}
        <div className="premium-card rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[#1a1f36]">Enrichment Progress</span>
            <span className="text-muted-foreground">
              {totalEnriched.toLocaleString()} / {totalHadiths.toLocaleString()} ({pct}%)
            </span>
          </div>
          <div className="w-full h-3 bg-[#e5e7eb] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#C5A059] to-[#e0c77d] rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {remaining.toLocaleString()} hadiths remaining
          </p>
        </div>

        {/* Controls */}
        <div className="premium-card rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[#1a1f36]">Batch Size:</label>
              <select
                value={batchSize}
                onChange={(e) => setBatchSize(Number(e.target.value))}
                disabled={running}
                className="border border-[#e5e7eb] rounded-lg px-3 py-2 text-sm bg-white"
              >
                {[10, 15, 20, 25, 30].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {!running ? (
              <button
                onClick={runBatch}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#C5A059] text-white hover:bg-[#b8933f] transition-colors"
              >
                <Play className="w-4 h-4" />
                Start Bulk Enrichment
              </button>
            ) : (
              <button
                onClick={stopBatch}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                <Square className="w-4 h-4" />
                Stop
              </button>
            )}
          </div>

          {running && (
            <div className="flex items-center gap-2 text-sm text-[#C5A059]">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing... Round {stats.rounds} | {stats.success} enriched | {stats.failed} failed
            </div>
          )}
        </div>

        {/* Log Output */}
        {log.length > 0 && (
          <div className="rounded-xl bg-[#1a1f36] p-4 max-h-[500px] overflow-y-auto font-mono text-xs">
            {log.map((line, i) => (
              <p
                key={i}
                className={
                  line.includes("ERROR") || line.includes("ERR:")
                    ? "text-red-400"
                    : line.includes("COMPLETE") || line.includes("success")
                      ? "text-emerald-400"
                      : "text-gray-300"
                }
              >
                {line}
              </p>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}
