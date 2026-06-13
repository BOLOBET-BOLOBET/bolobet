"use client"

import { Lock, Flame } from "lucide-react"
import { type Match, formatMatchDate, formatBRL } from "@/lib/bolobet"

export function MatchCard({
  match,
  prize,
  openable,
  onBet,
  apostasInfo,
}: {
  match: Match
  prize: number
  openable: boolean
  onBet?: (id: number) => void
  apostasInfo?: { total: number; porPlacar: Record<string, number> }
}) {
  const totalApostas = match.totalApostas ?? 0
  const pote = totalApostas * 10
  const premio = Math.floor(pote * 0.8)

  return (
    <div className={`rounded-2xl border bg-card p-4 transition-all duration-200 ${
      openable ? "border-primary/30 hover:border-primary/60" : "border-border"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="text-2xl">{match.homeFlag}</span>
          <span>{match.home}</span>
          <span className="text-muted-foreground">×</span>
          <span>{match.away}</span>
          <span className="text-2xl">{match.awayFlag}</span>
        </div>
        {openable ? (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
            <Flame className="size-3" /> Aberto
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            <Lock className="size-3" /> Fechado
          </span>
        )}
      </div>

      {/* Info */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{match.phase}</span>
        <span>·</span>
        <span>{formatMatchDate(match.date)}</span>
      </div>

      {/* Stats */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-secondary/60 px-2 py-2">
          <div className="text-base font-extrabold text-primary">{totalApostas}</div>
          <div className="text-[10px] text-muted-foreground">apostas</div>
        </div>
        <div className="rounded-xl bg-secondary/60 px-2 py-2">
          <div className="text-base font-extrabold text-primary">{formatBRL(pote)}</div>
          <div className="text-[10px] text-muted-foreground">pote total</div>
        </div>
        <div className="rounded-xl bg-secondary/60 px-2 py-2">
          <div className="text-base font-extrabold text-primary">{formatBRL(premio)}</div>
          <div className="text-[10px] text-muted-foreground">prêmio (80%)</div>
        </div>
      </div>

      {/* Placares mais apostados */}
      {apostasInfo && apostasInfo.total > 0 && (
        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Placares mais apostados:</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(apostasInfo.porPlacar)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([placar, count]) => (
                <span key={placar} className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  count >= 3
                    ? "bg-destructive/15 text-destructive"
                    : count === 2
                    ? "bg-amber-500/15 text-amber-500"
                    : "bg-secondary text-muted-foreground"
                }`}>
                  {placar} <span className="opacity-70">({count}/3)</span>
                </span>
              ))}
          </div>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Placares em vermelho já têm 3 apostas (lotado). Em amarelo, 2 apostas.
          </p>
        </div>
      )}

      {/* Botão apostar */}
      {openable && onBet && (
        <button
          onClick={() => onBet(match.id)}
          className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-extrabold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
        >
          Apostar agora — {formatBRL(10)}
        </button>
      )}
    </div>
  )
}
