"use client"

import { Calendar, ChevronRight, Lock, Trophy } from "lucide-react"
import { type Match, formatMatchDate, formatBRL } from "@/lib/bolobet"

export function MatchCard({
  match,
  prize,
  openable,
  onBet,
}: {
  match: Match
  prize: number
  openable: boolean
  onBet?: (id: number) => void
}) {
  return (
    <button
      type="button"
      disabled={!openable}
      onClick={openable ? () => onBet?.(match.id) : undefined}
      className={`group block w-full rounded-2xl border border-border bg-card p-4 text-left transition-all duration-300 ${
        openable
          ? "cursor-pointer hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-[0_0_0_1px_var(--color-lime-glow),0_12px_32px_-12px_rgba(0,0,0,0.7)]"
          : "opacity-70"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 text-sm font-bold sm:gap-2 sm:text-lg">
          <span className="text-xl leading-none sm:text-2xl">{match.homeFlag}</span>
          <span className="truncate">{match.home}</span>
          <span className="px-0.5 text-xs font-medium text-muted-foreground">vs</span>
          <span className="text-xl leading-none sm:text-2xl">{match.awayFlag}</span>
          <span className="truncate">{match.away}</span>
        </div>
        {openable ? (
          <span className="flex shrink-0 items-center gap-1 rounded-xl bg-primary px-3 py-2 text-sm font-extrabold text-primary-foreground transition-transform duration-200 group-hover:scale-105">
            Apostar
            <ChevronRight className="size-4" />
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-muted-foreground">
            <Lock className="size-3" /> Em breve
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          {match.phase} · {formatMatchDate(match.date)}
        </span>
        {openable && (
          <span className="flex items-center gap-1 rounded-full bg-primary/12 px-2.5 py-1 font-bold text-primary">
            <Trophy className="size-3" />
            {formatBRL(prize)}
          </span>
        )}
      </div>
    </button>
  )
}
