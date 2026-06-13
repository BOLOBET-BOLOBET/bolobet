"use client"

import { useState } from "react"
import { Ticket, Search, Check, X, Clock, Trophy } from "lucide-react"
import { formatBRL } from "@/lib/bolobet"
import { FLAG_MAP } from "@/lib/bolobet"

export function MinhasApostasView() {
  const [whatsapp, setWhatsapp] = useState("")
  const [apostas, setApostas] = useState<any[]>([])
  const [buscado, setBuscado] = useState(false)
  const [loading, setLoading] = useState(false)

  const buscar = async () => {
    if (!whatsapp.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/minhas-apostas?whatsapp=${whatsapp.trim()}`)
      const data = await res.json()
      setApostas(data.apostas ?? [])
      setBuscado(true)
    } catch {
      setApostas([])
      setBuscado(true)
    } finally {
      setLoading(false)
    }
  }

  const totalApostado = apostas.length * 10

  return (
    <main className="mx-auto max-w-3xl px-4 pb-12 pt-24 animate-fade-up">
      <h2 className="mb-1 flex items-center gap-2 text-xl font-extrabold">
        <Ticket className="size-5 text-primary" />
        Minhas Apostas
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Digite seu WhatsApp para ver todas as suas apostas.
      </p>

      <div className="flex gap-2">
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
          placeholder="Ex: 75999998888"
          className="flex-1 rounded-xl border border-border bg-secondary px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
        />
        <button
          onClick={buscar}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-extrabold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60"
        >
          <Search className="size-4" />
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {buscado && (
        <div className="mt-6">
          {apostas.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
              Nenhuma aposta encontrada para esse WhatsApp.
            </div>
          ) : (
            <>
              {/* Resumo */}
              <div className="mb-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-border bg-card p-4 text-center">
                  <div className="text-2xl font-extrabold text-primary">{apostas.length}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Apostas feitas</div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 text-center">
                  <div className="text-2xl font-extrabold text-primary">{formatBRL(totalApostado)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Total apostado</div>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 text-center">
                  <div className="text-2xl font-extrabold text-primary">
                    {apostas.filter((a) => a.pago).length}/{apostas.length}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Pagamentos confirmados</div>
                </div>
              </div>

              {/* Lista de apostas */}
              <div className="grid gap-3">
                {apostas.map((aposta) => (
                  <div key={aposta.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-1.5 text-sm font-bold">
                        <span className="text-lg">{FLAG_MAP[aposta.casa] ?? "⚽"}</span>
                        <span>{aposta.casa}</span>
                        <span className="text-muted-foreground">x</span>
                        <span className="text-lg">{FLAG_MAP[aposta.fora] ?? "⚽"}</span>
                        <span>{aposta.fora}</span>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
                        aposta.pago
                          ? "bg-primary/15 text-primary"
                          : "bg-amber-500/15 text-amber-500"
                      }`}>
                        {aposta.pago ? "✓ Pago" : "Pendente"}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">{aposta.fase}</div>

                    {/* Placar apostado */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="rounded-xl bg-secondary px-4 py-2 text-center">
                        <div className="text-xs text-muted-foreground">Seu placar</div>
                        <div className="mt-1 text-lg font-extrabold text-primary">
                          {aposta.placarCasa} x {aposta.placarFora}
                        </div>
                      </div>

                      {aposta.temResultado && (
                        <>
                          <div className="text-muted-foreground">→</div>
                          <div className={`rounded-xl px-4 py-2 text-center ${
                            aposta.acertou ? "bg-primary/15" : "bg-secondary"
                          }`}>
                            <div className="text-xs text-muted-foreground">Resultado oficial</div>
                            <div className={`mt-1 text-lg font-extrabold ${
                              aposta.acertou ? "text-primary" : "text-foreground"
                            }`}>
                              {aposta.placarOficialCasa} x {aposta.placarOficialFora}
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                            aposta.acertou
                              ? "bg-primary/15 text-primary"
                              : "bg-destructive/15 text-destructive"
                          }`}>
                            {aposta.acertou
                              ? <><Trophy className="size-3" /> Acertou!</>
                              : <><X className="size-3" /> Não acertou</>
                            }
                          </div>
                        </>
                      )}

                      {!aposta.temResultado && (
                        <div className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">
                          <Clock className="size-3" /> Aguardando resultado
                        </div>
                      )}
                    </div>

                    {!aposta.pago && (
                      <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
                        ⚠️ Pagamento pendente — envie o comprovante via WhatsApp para confirmar sua aposta.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </main>
  )
}
