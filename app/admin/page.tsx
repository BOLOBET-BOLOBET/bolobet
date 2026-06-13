"use client"

import { useState, useCallback } from "react"
import { Lock, Settings, Check, RefreshCw, ChevronDown, ChevronUp } from "lucide-react"
import { type Match, BET_VALUE, PRIZE_RATE, formatBRL, FLAG_MAP } from "@/lib/bolobet"
import { ToastProvider, useToast } from "@/components/toast"

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} role="switch" aria-checked={on}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-primary" : "bg-muted"}`}>
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all duration-200 ${on ? "left-[1.375rem]" : "left-0.5"}`} />
    </button>
  )
}

function AdminPage() {
  const showToast = useToast()
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState("")
  const [adminPass, setAdminPass] = useState("")
  const [matches, setMatches] = useState<Match[]>([])
  const [apostasPorJogo, setApostasPorJogo] = useState<Record<number, any[]>>({})
  const [jogosExpandidos, setJogosExpandidos] = useState<Record<number, boolean>>({})
  const [results, setResults] = useState<Record<number, { h: string; a: string }>>({})

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
    } catch {}
  }, [])

  const login = async () => {
    const res = await fetch("/api/admin/toggle-jogo", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${pass}` },
      body: JSON.stringify({ matchId: "__test__" }),
    })
    if (res.status === 401) { showToast("Senha incorreta!"); return }
    setAdminPass(pass)
    setAuthed(true)
    fetchData()
  }

  const toggleMatch = async (id: number) => {
    const res = await fetch("/api/admin/toggle-jogo", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminPass}` },
      body: JSON.stringify({ matchId: id }),
    })
    const result = await res.json()
    if (result.erro) { showToast(result.erro); return }
    fetchData()
  }

  const carregarApostas = async (matchId: number) => {
    if (jogosExpandidos[matchId]) {
      setJogosExpandidos(p => ({ ...p, [matchId]: false }))
      return
    }
    try {
      const res = await fetch(`/api/apostas?matchId=${matchId}`, {
        headers: { Authorization: `Bearer ${adminPass}` },
      })
      const data = await res.json()
      setApostasPorJogo(p => ({ ...p, [matchId]: data.apostas ?? [] }))
      setJogosExpandidos(p => ({ ...p, [matchId]: true }))
    } catch { showToast("Erro ao carregar apostas.") }
  }

  const marcarPago = async (apostaId: string, matchId: number) => {
    const res = await fetch("/api/admin/marcar-pago", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminPass}` },
      body: JSON.stringify({ apostaId }),
    })
    const result = await res.json()
    if (result.erro) { showToast(result.erro); return }
    setApostasPorJogo(p => ({
      ...p,
      [matchId]: (p[matchId] ?? []).map(a =>
        a.id === apostaId ? { ...a, pago: result.pago ? 'TRUE' : 'FALSE' } : a
      )
    }))
  }

  const salvarResultado = async (matchId: number) => {
    const res = results[matchId]
    if (!res) return
    const h = parseInt(res.h), a = parseInt(res.a)
    if (isNaN(h) || isNaN(a)) { showToast("Preencha o placar."); return }
    const response = await fetch("/api/admin/resultado", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${adminPass}` },
      body: JSON.stringify({ matchId, placarCasa: h, placarFora: a }),
    })
    const result = await response.json()
    if (result.erro) { showToast(result.erro); return }
    let msg = `Salvo! Pote: R$${result.pote} | Prêmio: R$${result.premioTotal}`
    if (result.totalVencedores > 0) {
      msg += ` | Vencedores: ${result.vencedores.map((v: any) => `${v.nome} (R$${v.premio})`).join(", ")}`
    } else { msg += " | Nenhum acerto." }
    showToast(msg)
    fetchData()
  }

  if (!authed) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-7 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-primary/15">
            <Lock className="size-6 text-primary" />
          </div>
          <h2 className="text-xl font-extrabold">Painel Admin</h2>
          <p className="mt-1 text-sm text-muted-foreground">Acesso restrito à organização.</p>
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()} placeholder="Senha de admin"
            className="mt-5 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm outline-none focus:border-primary" />
          <button onClick={login}
            className="mt-3 w-full rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30">
            Entrar
          </button>
        </div>
      </div>
    )
  }

  const abertos = matches.filter(m => m.open)
  const fechados = matches.filter(m => !m.open)

  const renderJogo = (m: Match) => {
    const pool = (m.totalApostas ?? 0) * BET_VALUE
    const prize = Math.floor(pool * PRIZE_RATE)
    const res = results[m.id] ?? { h: m.officialHome?.toString() ?? "", a: m.officialAway?.toString() ?? "" }
    const apostas = apostasPorJogo[m.id] ?? []
    const expandido = jogosExpandidos[m.id]

    return (
      <div key={m.id} className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1.5 text-sm font-bold">
            <span className="text-lg">{m.homeFlag}</span>
            <span className="truncate">{m.home}</span>
            <span className="text-xs text-muted-foreground">vs</span>
            <span className="text-lg">{m.awayFlag}</span>
            <span className="truncate">{m.away}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-xs text-muted-foreground">{m.open ? "Aberto" : "Fechado"}</span>
            <Switch on={m.open} onClick={() => toggleMatch(m.id)} />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{m.phase}</span>
          <span className="rounded-full bg-primary/12 px-2.5 py-1 font-bold text-primary">
            {m.totalApostas ?? 0} apostas · {formatBRL(pool)} · Prêmio: {formatBRL(prize)}
          </span>
        </div>

        <button onClick={() => carregarApostas(m.id)}
          className="mt-3 flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
          {expandido ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          {expandido ? "Ocultar apostas" : `Ver apostas (${m.totalApostas ?? 0})`}
        </button>

        {expandido && (
          <div className="mt-2 space-y-1 rounded-xl bg-secondary/50 p-3 text-xs">
            {apostas.length === 0 ? (
              <div className="text-muted-foreground">Nenhuma aposta ainda.</div>
            ) : (
              apostas.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between gap-2 border-b border-border/50 py-1.5 last:border-0">
                  <span className="truncate text-muted-foreground">
                    {b.nome} ({b.whatsapp}) — {b.placar_casa}x{b.placar_fora}
                  </span>
                  <button onClick={() => marcarPago(b.id, m.id)}
                    className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                      String(b.pago).toUpperCase() === "TRUE"
                        ? "bg-primary/15 text-primary"
                        : "bg-primary text-primary-foreground hover:brightness-110"
                    }`}>
                    {String(b.pago).toUpperCase() === "TRUE" && <Check className="size-3" />}
                    {String(b.pago).toUpperCase() === "TRUE" ? "Pago" : "Marcar pago"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Resultado oficial:</span>
          <input type="number" min={0} max={9} value={res.h}
            onChange={(e) => setResults(p => ({ ...p, [m.id]: { ...res, h: e.target.value } }))}
            className="no-spinner w-12 rounded-lg border border-border bg-secondary px-2 py-1.5 text-center text-sm outline-none focus:border-primary" />
          <span className="text-muted-foreground">x</span>
          <input type="number" min={0} max={9} value={res.a}
            onChange={(e) => setResults(p => ({ ...p, [m.id]: { ...res, a: e.target.value } }))}
            className="no-spinner w-12 rounded-lg border border-border bg-secondary px-2 py-1.5 text-center text-sm outline-none focus:border-primary" />
          <button onClick={() => salvarResultado(m.id)}
            className="rounded-lg bg-primary px-3 py-1.5 text-xs font-extrabold text-primary-foreground transition-colors hover:brightness-110">
            Salvar
          </button>
        </div>

        {m.officialHome != null && m.officialAway != null && (
          <div className="mt-2 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
            Placar oficial: {m.officialHome} x {m.officialAway}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-10">
      <div className="mx-auto max-w-3xl px-4 pb-12 pt-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-extrabold">
            <Settings className="size-5 text-primary" /> Painel Admin
          </h2>
          <button onClick={fetchData}
            className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            <RefreshCw className="size-4" /> Atualizar
          </button>
        </div>

        <h3 className="mb-3 text-base font-bold text-primary">Bolões Abertos ({abertos.length})</h3>
        <div className="mb-6 grid gap-3">
          {abertos.length === 0
            ? <div className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">Nenhum bolão aberto.</div>
            : abertos.map(renderJogo)}
        </div>

        <h3 className="mb-3 text-base font-bold text-muted-foreground">Bolões Fechados ({fechados.length})</h3>
        <div className="grid gap-3">
          {fechados.length === 0
            ? <div className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">Nenhum bolão fechado.</div>
            : fechados.map(renderJogo)}
        </div>
      </div>
    </div>
  )
}

export default function AdminPageWrapper() {
  return <ToastProvider><AdminPage /></ToastProvider>
}
