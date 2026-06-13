"use client"
import { useEffect, useState, useCallback } from "react"
import { type Match, FLAG_MAP } from "@/lib/bolobet"
import { Navbar, type Page } from "@/components/navbar"
import { HomeView } from "@/components/home-view"
import { JogosView } from "@/components/jogos-view"
import { RankingView } from "@/components/ranking-view"
import { MinhasApostasView } from "@/components/minhas-apostas-view"
import { BetModal } from "@/components/bet-modal"
import { ToastProvider, useToast } from "@/components/toast"

function App() {
  const showToast = useToast()
  const [page, setPage] = useState<Page>("home")
  const [matches, setMatches] = useState<Match[]>([])
  const [betMatch, setBetMatch] = useState<Match | null>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/jogos")
      const data = await res.json()
      if (data.jogos) {
        const mappedMatches: Match[] = data.jogos.map((j: any) => ({
          id: Number(j.id), phase: j.fase, home: j.casa,
          homeFlag: FLAG_MAP[j.casa] ?? "⚽", away: j.fora,
          awayFlag: FLAG_MAP[j.fora] ?? "⚽", date: j.dataJogo,
          open: j.aberto,
          officialHome: j.placarOficialCasa != null ? Number(j.placarOficialCasa) : null,
          officialAway: j.placarOficialFora != null ? Number(j.placarOficialFora) : null,
          totalApostas: j.totalApostas, pote: j.pote, premio: j.premio,
        }))
        setMatches(mappedMatches)
      }
    } catch (err) { console.error(err) }
  }, [])

  useEffect(() => { fetchData().then(() => setReady(true)) }, [fetchData])

  const stats = {
    apostas: matches.reduce((sum, m) => sum + (m.totalApostas ?? 0), 0),
    premio: matches.reduce((sum, m) => sum + (m.pote ?? 0), 0),
    jogos: matches.filter((m) => m.open).length,
  }

  const confirmBet = async (data: { matchId: number; name: string; whats: string; homeScore: number; awayScore: number }) => {
    setLoading(true)
    try {
      const res = await fetch("/api/apostar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: data.matchId, nome: data.name, whatsapp: data.whats, placarCasa: data.homeScore, placarFora: data.awayScore }),
      })
      const result = await res.json()
      if (result.erro) { showToast(result.erro) }
      else { setBetMatch(null); showToast("Aposta registrada! Não esqueça de enviar o comprovante."); await fetchData() }
    } catch { showToast("Erro ao registrar aposta.") }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen pb-10">
      <Navbar page={page} onNavigate={setPage} />
      {!ready && (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="mx-auto mb-3 size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm">Carregando bolões...</p>
          </div>
        </div>
      )}
      {ready && (
        <>
          {page === "home" && <HomeView stats={stats} onNavigate={setPage} onBetMatch={(id) => setBetMatch(matches.find(m => m.id === id) ?? null)} />}
          {page === "jogos" && <JogosView matches={matches} onBet={(id) => setBetMatch(matches.find(m => m.id === id) ?? null)} />}
          {page === "ranking" && <RankingView matches={matches} />}
          {page === "minhas-apostas" && <MinhasApostasView />}
        </>
      )}
      <BetModal match={betMatch} onClose={() => setBetMatch(null)} onConfirm={confirmBet} loading={loading} />
    </div>
  )
}

export default function Page() {
  return <ToastProvider><App /></ToastProvider>
}
