"use client"

import { Lock, Flame, Trophy } from "lucide-react"
import { type Match, formatMatchDate, formatBRL } from "@/lib/bolobet"

export function MatchCard({
  match,
  openable,
  onBet,
}: {
  match: Match
  openable: boolean
  onBet?: (id: number) => void
}) {
  const totalApostas = match.totalApostas ?? 0
  const pote = totalApostas * 10
  const premio = Math.floor(pote * 0.8)

  const cenarios = [
    { ganhadores: 1, valor: premio },
    { ganhadores: 2, valor: Math.floor(premio / 2) },
    { ganhadores: 3, valor: Math.floor(premio / 3) },
  ]

  return (
    <div className={`rounded-2xl border bg-card p-4 transition-all duration-200 ${
      openable ? "border-primary/30 hover:border-primary/60" : "border-border"
    }`}>
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

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span>{match.phase}</span>
        <span>·</span>
        <span>{formatMatchDate(match.date)}</span>
      </div>

      {openable && (
        <div className="mt-4 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-primary/80">
            <Trophy className="size-3.5" />
            Prêmio estimado
          </div>
          <div className="mt-1 text-3xl font-extrabold text-primary">
            {formatBRL(premio)}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            se você for o único a acertar
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {cenarios.map((c) => (
              <div key={c.ganhadores} className="rounded-xl bg-background/60 px-2 py-2">
                <div className="text-sm font-extrabold text-primary">{formatBRL(c.valor)}</div>
                <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                  se {c.ganhadores} {c.ganhadores === 1 ? "acertar" : "acertarem"}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
