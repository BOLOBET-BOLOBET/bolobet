"use client"

import { Trophy } from "lucide-react"
import type { Match } from "@/lib/bolobet"
import { formatBRL } from "@/lib/bolobet"

export function RankingView({ matches }: { matches: Match[] }) {
  const jogosComResultado = matches.filter(
    (m) => m.officialHome != null && m.officialAway != null
  )

  return (
    <main className="mx-auto max-w-3xl px-4 pb-12 pt-24 animate-fade-up">
      <h2 className="mb-1 flex items-center gap-2 text-xl font-extrabold">
        <Trophy className="size-5 text-primary" />
        Bolões & Resultados
      </h2>
      <p className="mb-5 text-sm text-muted-foreground">
        Resumo de apostas e resultados oficiais de cada jogo.
      </p>

      {matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Nenhum jogo carregado ainda.
        </div>
      ) : (
        <div className="grid gap-3">
          {matches.map((m) => {
            const pool = (m.totalApostas ?? 0) * 10
            const premio = Math.floor(pool * 0.8)
            const temResultado = m.officialHome != null && m.officialAway != null
            return (
              <div key={m.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-sm font-bold">
                    <span className="text-lg">{m.homeFlag}</span>
                    <span>{m.home}</span>
                    <span className="text-xs text-muted-foreground">vs</span>
                    <span className="text-lg">{m.awayFlag}</span>
                    <span>{m.away}</span>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                      m.open
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {m.open ? "Aberto" : "Fechado"}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span>{m.phase}</span>
                  <span>·</span>
                  <span>{m.totalApostas ?? 0} apostas</span>
                  <span>·</span>
                  <span className="font-bold text-primary">Prêmio: {formatBRL(premio)}</span>
                </div>

                {temResultado && (
                  <div className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
                    Resultado oficial: {m.officialHome} x {m.officialAway}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
