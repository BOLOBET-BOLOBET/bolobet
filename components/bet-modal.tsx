"use client"

import { useEffect, useState } from "react"
import { Copy, Minus, Plus, X, Loader2 } from "lucide-react"
import {
  type Match,
  BET_VALUE,
  MAX_PER_SCORE,
  PIX_KEY,
  WHATSAPP_NUM,
  formatBRL,
} from "@/lib/bolobet"
import { useToast } from "./toast"

type Step = "score" | "payment"

function Stepper({
  value,
  onChange,
  label,
  flag,
}: {
  value: number
  onChange: (v: number) => void
  label: string
  flag: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-3xl leading-none">{flag}</div>
      <div className="flex flex-col items-center gap-2">
        <input
          type="number"
          min={0}
          max={9}
          value={value}
          onChange={(e) => onChange(Math.max(0, Math.min(9, Number(e.target.value) || 0)))}
          className="no-spinner size-20 rounded-2xl border border-border bg-secondary text-center text-4xl font-extrabold text-foreground outline-none transition-colors focus:border-primary"
        />
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => onChange(Math.max(0, value - 1))}
            className="grid size-8 place-items-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Diminuir gols de ${label}`}
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange(Math.min(9, value + 1))}
            className="grid size-8 place-items-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={`Aumentar gols de ${label}`}
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
      <div className="max-w-24 truncate text-center text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

export function BetModal({
  match,
  onClose,
  onConfirm,
  loading,
}: {
  match: Match | null
  onClose: () => void
  onConfirm: (bet: { matchId: number; name: string; whats: string; homeScore: number; awayScore: number }) => void
  loading?: boolean
}) {
  const showToast = useToast()
  const [step, setStep] = useState<Step>("score")
  const [home, setHome] = useState(0)
  const [away, setAway] = useState(0)
  const [name, setName] = useState("")
  const [whats, setWhats] = useState("")

  useEffect(() => {
    if (match) {
      setStep("score")
      setHome(0)
      setAway(0)
      setName("")
      setWhats("")
    }
  }, [match])

  if (!match) return null

  const goToPayment = () => {
    if (!name.trim() || !whats.trim()) {
      showToast("Preencha nome e WhatsApp!")
      return
    }
    setStep("payment")
  }

  const copyPix = () => {
    navigator.clipboard.writeText(PIX_KEY).then(() => showToast("Chave Pix copiada!"))
  }

  const waMsg = encodeURIComponent(
    `Fiz o pagamento, segue o comprovante. (Aposta: ${match.home} ${home} x ${away} ${match.away} - ${name})`,
  )

  const confirm = () => {
    onConfirm({ matchId: match.id, name: name.trim(), whats: whats.trim(), homeScore: home, awayScore: away })
  }

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[92vh] w-full max-w-md animate-scale-in overflow-y-auto rounded-3xl border border-border bg-popover p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Fechar"
        >
          <X className="size-5" />
        </button>

        {step === "score" ? (
          <>
            <h2 className="pr-8 text-xl font-extrabold">
              {match.home} <span className="text-muted-foreground">x</span> {match.away}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{match.phase} — Escolha o placar exato</p>

            <div className="my-6 flex items-start justify-center gap-5">
              <Stepper value={home} onChange={setHome} label={match.home} flag={match.homeFlag} />
              <div className="pt-12 text-2xl font-extrabold text-muted-foreground">x</div>
              <Stepper value={away} onChange={setAway} label={match.away} flag={match.awayFlag} />
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Máx. {MAX_PER_SCORE} apostas por placar por jogo
            </p>

            <div className="mt-5 space-y-3">
              <div>
                <label htmlFor="bet-name" className="mb-1.5 block text-sm font-semibold text-muted-foreground">
                  Seu nome
                </label>
                <input
                  id="bet-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="bet-whats" className="mb-1.5 block text-sm font-semibold text-muted-foreground">
                  Seu WhatsApp
                </label>
                <input
                  id="bet-whats"
                  type="tel"
                  value={whats}
                  onChange={(e) => setWhats(e.target.value)}
                  placeholder="Ex: 75999998888"
                  className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
            </div>

            <button
              onClick={goToPayment}
              className="mt-6 w-full rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
            >
              Continuar para pagamento
            </button>
          </>
        ) : (
          <>
            <h2 className="pr-8 text-xl font-extrabold">Pagamento via Pix</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Aposta:{" "}
              <strong className="text-foreground">
                {match.home} {home} x {away} {match.away}
              </strong>{" "}
              — {name}
            </p>

            <div className="my-5 rounded-2xl border border-dashed border-primary/60 bg-secondary/60 p-5 text-center">
              <div className="text-xs text-muted-foreground">Valor a pagar</div>
              <div className="my-1 text-3xl font-extrabold text-primary">{formatBRL(BET_VALUE)}</div>
              <div className="mt-3 text-xs text-muted-foreground">Chave Pix (telefone)</div>
              <div className="break-all text-base font-extrabold text-primary">{PIX_KEY}</div>
              <button
                onClick={copyPix}
                className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-xl border border-primary/50 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/10"
              >
                <Copy className="size-4" /> Copiar chave Pix
              </button>
            </div>

            <a
              href={`https://wa.me/${WHATSAPP_NUM}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3.5 text-sm font-extrabold text-white transition-transform duration-200 hover:-translate-y-0.5"
            >
              Enviar comprovante no WhatsApp
            </a>

            <button
              onClick={confirm}
              disabled={loading}
              className="mt-3 w-full rounded-2xl bg-primary py-3.5 text-sm font-extrabold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" /> Registrando...
                </span>
              ) : (
                "Confirmar aposta"
              )}
            </button>
            <button
              onClick={() => setStep("score")}
              className="mt-2 w-full rounded-2xl py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Voltar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
