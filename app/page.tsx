"use client"

import { useEffect, useState, useCallback } from "react"
import { type Match, type Bet, BET_VALUE, PRIZE_RATE, MAX_PER_SCORE, FLAG_MAP } from "@/lib/bolobet"
import { Navbar, type Page } from "@/components/navbar"
import { HomeView } from "@/components/home-view"
import { JogosView } from "@/components/jogos-view"
import { RankingView } from "@/components/ranking-view"
import { AdminView } from "@/components/admin-view"
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
          id: Number(j.id),
          phase: j.fase,
          home: j.casa,
          homeFlag: FLAG_MAP[j.casa] ?? "⚽",
          away: j.fora,
          awayFlag: FLAG_MAP[j.fora] ?? "⚽",
          date: j.dataJogo,
          open: j.aberto,
          officialHome: j.placarOficialCasa != null ? Number(j.placarOficialCasa) : null,
          officialAway: j.placarOficialFora != null ? Number(j.placarOficialFora) : null,
          totalApostas: j.totalApostas,
          pote: j.pote,
          premio: j.premio,
        }))
        setMatches(mappedMatches)
      }
    } catch (err) {
      console.error("Erro ao buscar jogos:", err)
    }
  }, [])

  useEffect(() => {
    fetchData().then(() => setReady(true))
  }, [fetchData])

  const stats = {
    apostas: matches.reduce((sum, m) => sum + (m.totalApostas ?? 0), 0),
    premio: matches.reduce((sum, m) => sum + (m.pote ?? 0), 0),
    jogos: matches.filter((m) => m.open).length,
  }

  const openBet = (id: number) => {
    const m = matches.find((x) => x.id === id) ?? null
    setBetMatch(m)
  }

  const confirmBet = async (data: { matchId: number; name: string; whats: string; homeScore: number; awayScore: number }) => {
    setLoading(true)
    try {
      const res = await fetch("/api/apostar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: data.matchId,
          nome: data.name,
          whatsapp: data.whats,
          placarCasa: data.homeScore,
          placarFora: data.awayScore,
        }),
      })
      const result = await res.json()
      if (result.erro) {
        showToast(result.erro)
      } else {
        setBetMatch(null)
        showToast("Aposta registrada! Não esqueça de enviar o comprovante.")
        await fetchData()
      }
    } catch {
      showToast("Erro ao registrar aposta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const toggleMatch = async (id: number, adminPass: string) => {
    try {
      const res = await fetch("/api/admin/toggle-jogo", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminPass}` },
        body: JSON.stringify({ matchId: id }),
      })
      const result = await res.json()
      if (result.erro) { showToast(result.erro); return }
      await fetchData()
    } catch {
      showToast("Erro ao atualizar jogo.")
    }
  }

  const togglePaid = async (betId: string, adminPass: string) => {
    try {
      const res = await fetch("/api/admin/marcar-pago", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminPass}` },
        body: JSON.stringify({ apostaId: betId }),
      })
      const result = await res.json()
      if (result.erro) { showToast(result.erro); return }
    } catch {
      showToast("Erro ao atualizar pagamento.")
    }
  }

  const saveResult = async (matchId: number, home: number, away: number, adminPass: string) => {
    try {
      const res = await fetch("/api/admin/resultado", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminPass}` },
        body: JSON.stringify({ matchId, placarCasa: home, placarFora: away }),
      })
      const result = await res.json()
      if (result.erro) { showToast(result.erro); return }

      let msg = `Resultado salvo! Pote: R$${result.pote} | Prêmio: R$${result.premioTotal}`
      if (result.totalVencedores > 0) {
        const nomes = result.vencedores.map((v: any) => `${v.nome} (R$${v.premio})`).join(", ")
        msg += ` | Vencedor(es): ${nomes}`
      } else {
        msg += " | Nenhum acerto."
      }
      showToast(msg)
      await fetchData()
    } catch {
      showToast("Erro ao salvar resultado.")
    }
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
          {page === "home" && <HomeView stats={stats} onNavigate={setPage} />}
          {page === "jogos" && <JogosView matches={matches} onBet={openBet} />}
          {page === "ranking" && <RankingView matches={matches} />}
          {page === "admin" && (
            <AdminView
              matches={matches}
              onToggleMatch={toggleMatch}
              onTogglePaid={togglePaid}
              onSaveResult={saveResult}
              onRefresh={fetchData}
            />
          )}
        </>
      )}

      <BetModal match={betMatch} onClose={() => setBetMatch(null)} onConfirm={confirmBet} loading={loading} />
    </div>
  )
}

export default function Page() {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  )
}
