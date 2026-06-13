"use client"

import { useState } from "react"
import { Lock, Settings, Check, RefreshCw } from "lucide-react"
import {
  type Match,
  BET_VALUE,
  PRIZE_RATE,
  formatBRL,
} from "@/lib/bolobet"
import { useToast } from "./toast"

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        on ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all duration-200 ${
          on ? "left-[1.375rem]" : "left-0.5"
        }`}
      />
    </button>
  )
}

export function AdminView({
  matches,
  onToggleMatch,
  onTogglePaid,
  onSaveResult,
  onRefresh,
}: {
  matches: Match[]
  onToggleMatch: (id: number, pass: string) => void
  onTogglePaid: (betId: string, pass: string) => void
  onSaveResult: (matchId: number, home: number, away: number, pass: string) => void
  onRefresh: () => void
}) {
  const showToast = useToast()
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState("")
  const [adminPass, setAdminPass] = useState("")
  const [results, setResults] = useState<Record<number, { h: string; a: string }>>({})
  const [apostasVisiveis, setApostasVisiveis] = useState<Record<number, any[]>>({})
  const [loadingApostas, setLoadingApostas] = useState<Record<number, boolean>>({})

  const login = async () => {
    // Testa a senha chamando uma rota protegida com um matchId inválido — se voltar 401, senha errada
    const res = await fetch("/api/admin/toggle-jogo", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${pass}` },
      body: JSON.stringify({ matchId: "__test__" }),
    })
    if (res.status === 401) {
      showToast("Senha incorreta!")
      return
    }
    setAdminPass(pass)
    setAuthed(true)
  }

  const carregarApostas = async (matchId: number) => {
    if (apostasVisiveis[matchId]) {
      setApostasVisiveis((p) => { const n = { ...p }; delete n[matchId]; return n })
      return
    }
    setLoadingApostas((p) => ({ ...p, [matchId]: true }))
    try {
      const res = await fetch("/api/jogos")
      const data = await res.json()
      // Busca apostas via endpoint de apostas do jogo
      const apRes = await fetch(`/api/apostas?matchId=${matchId}`, {
        headers: { Authorization: `Bearer ${adminPass}` },
      })
      if (apRes.ok) {
        const apData = await apRes.json()
        setApostasVisiveis((p) => ({ ...p, [matchId]: apData.apostas ?? [] }))
      } else {
        showToast("Erro ao carregar apostas.")
      }
    } catch {
      showToast("Erro ao carregar apostas.")
    } finally {
      setLoadingApostas((p) => ({ ...p, [matchId]: false }))
    }
  }

  if (!authed) {
    return (
      <main className="mx-auto max-w-sm px-4 pt-32 animate-fade-up">
        <div className="rounded-3xl border border-border bg-card p-7 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-primary/15">
            <Lock className="size-6 text-primary" />
          </div>
          <h2 className="text-xl font-extrabold">Painel Admin</h2>
          <p className="mt-1 text-sm text-muted-foreground">Acesso restrito à organização.</p>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Senha de admin"
            className="mt-5 w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
          />
          <button
            onClick={login}
            className="mt-3 w-full rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
          >
            Entrar
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-12 pt-24 animate-fade-up">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-extrabold">
          <Settings className="size-5 text-primary" />
          Gerenciar Jogos
        </h2>
        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <RefreshCw className="size-4" /> Atualizar
        </button>
      </div>

      <div className="grid gap-3">
        {matches.map((m) => {
          const pool = (m.totalApostas ?? 0) * BET_VALUE
          const prize = Math.floor(pool * PRIZE_RATE)
          const res = results[m.id] ?? {
            h: m.officialHome?.toString() ?? "",
            a: m.officialAway?.toString() ?? "",
          }
          const apostas = apostasVisiveis[m.id]
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
                  <Switch on={m.open} onClick={() => onToggleMatch(m.id, adminPass)} />
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span>{m.phase}</span>
                <span className="rounded-full bg-primary/12 px-2.5 py-1 font-bold text-primary">
                  {m.totalApostas ?? 0} apostas · Pote: {formatBRL(pool)} · Prêmio: {formatBRL(prize)}
                </span>
              </div>

              {/* Botão para carregar apostas do jogo */}
              <button
                onClick={() => carregarApostas(m.id)}
                className="mt-3 text-xs font-semibold text-primary hover:underline"
              >
                {loadingApostas[m.id] ? "Carregando..." : apostas ? "Ocultar apostas" : "Ver apostas deste jogo"}
              </button>

              {apostas && (
                <div className="mt-2 space-y-1 rounded-xl bg-secondary/50 p-3 text-xs">
                  {apostas.length === 0 ? (
                    <div className="text-muted-foreground">Nenhuma aposta ainda.</div>
                  ) : (
                    apostas.map((b: any) => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between gap-2 border-b border-border/50 py-1.5 last:border-0"
                      >
                        <span className="truncate text-muted-foreground">
                          {b.nome} ({b.whatsapp}) — {b.placar_casa}x{b.placar_fora}
                        </span>
                        <button
                          onClick={() => onTogglePaid(b.id, adminPass)}
                          className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                            String(b.pago).toUpperCase() === "TRUE"
                              ? "bg-primary/15 text-primary"
                              : "bg-primary text-primary-foreground hover:brightness-110"
                          }`}
                        >
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
                <input
                  type="number"
                  min={0}
                  max={9}
                  value={res.h}
                  onChange={(e) => setResults((p) => ({ ...p, [m.id]: { ...res, h: e.target.value } }))}
                  className="no-spinner w-12 rounded-lg border border-border bg-secondary px-2 py-1.5 text-center text-sm outline-none focus:border-primary"
                />
                <span className="text-muted-foreground">x</span>
                <input
                  type="number"
                  min={0}
                  max={9}
                  value={res.a}
                  onChange={(e) => setResults((p) => ({ ...p, [m.id]: { ...res, a: e.target.value } }))}
                  className="no-spinner w-12 rounded-lg border border-border bg-secondary px-2 py-1.5 text-center text-sm outline-none focus:border-primary"
                />
                <button
                  onClick={() => {
                    const h = Number.parseInt(res.h)
                    const a = Number.parseInt(res.a)
                    if (Number.isNaN(h) || Number.isNaN(a)) {
                      showToast("Preencha o placar oficial.")
                      return
                    }
                    onSaveResult(m.id, h, a, adminPass)
                  }}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-extrabold text-primary-foreground transition-colors hover:brightness-110"
                >
                  Salvar e calcular
                </button>
              </div>

              {m.officialHome != null && m.officialAway != null && (
                <div className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
                  Placar oficial: {m.officialHome} x {m.officialAway}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
