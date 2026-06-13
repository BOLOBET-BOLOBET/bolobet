"use client"

import { useState, useEffect } from "react"
import { CircleDot, Lock } from "lucide-react"
import { type Match } from "@/lib/bolobet"
import { MatchCard } from "./match-card"

export function JogosView({ matches, onBet }: { matches: Match[]; onBet: (id: number) => void }) {
  const abertos = matches.filter((m) => m.open)
  const futuros = matches.filter((m) => !m.open)
  const [apostasInfo, setApostasInfo] = useState<Record<number, { total: number; porPlacar: Record<string, number> }>>({})

  useEffect(() => {
    const fetchApostas = async () => {
      const infos: Record<number, any> = {}
      await Promise.all(
        abertos.map(async (m) => {
          try {
            const res = await fetch(`/api/apostas-jogo?matchId=${m.id}`)
            const data = await res.json()
            infos[m.id] = data
          } catch {}
        })
      )
      setApostasInfo(infos)
    }
    if (abertos.length > 0) fetchApostas()
  }, [matches])

  return (
    <main className="mx-auto max-w-3xl px-4 pb-12 pt-24 animate-fade-up">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold">
        <span className="relative flex size-2.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex size-2.5 rounded-full bg-primary" />
        </span>
        Bolões Abertos
      </h2>

      {abertos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Nenhum bolão aberto no momento. Volte em breve!
        </div>
      ) : (
        <div className="grid gap-3">
          {abertos.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              prize={m.premio ?? 0}
              openable
              onBet={onBet}
              apostasInfo={apostasInfo[m.id]}
            />
          ))}
        </div>
      )}

      <h2 className="mb-1 mt-10 flex items-center gap-2 text-xl font-extrabold">
        <Lock className="size-4 text-muted-foreground" />
        Bolões Futuros
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">Ainda não liberados para apostas.</p>

      {futuros.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Todos os jogos estão liberados!
        </div>
      ) : (
        <div className="grid gap-3">
          {futuros.map((m) => (
            <MatchCard key={m.id} match={m} prize={0} openable={false} />
          ))}
        </div>
      )}

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-xs leading-relaxed text-muted-foreground/80">
        <CircleDot className="size-3.5 shrink-0 text-primary/60" />
        20% de cada aposta é retido para manutenção. Os 80% restantes vão para o(s) vencedor(es).
      </p>
    </main>
  )
}
