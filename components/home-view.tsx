"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { ArrowRight, Ticket, Trophy, Flame, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react"
import { formatBRL } from "@/lib/bolobet"
import type { Page } from "./navbar"

const steps = [
  "Escolha um jogo nos Bolões Abertos",
  "Defina o placar exato (máx. 3 pessoas por placar)",
  "Informe seu nome e WhatsApp",
  "Pague R$10 via Pix e envie o comprovante",
  "80% do total arrecadado vai para quem acertar o placar exato. 20% fica para manutenção da plataforma.",
]

const banners = [
  { src: "/banner1.webp.webp", alt: "A sua melhor jogada começa aqui", matchId: null },
  { src: "/banner2.webp.webp", alt: "Acerte placares e ganhe R$500 na final", matchId: null },
  { src: "/banner-brasil-haiti.png.webp", alt: "Brasil x Haiti — Faça agora seu palpite", matchId: 31 },
]

export function HomeView({
  stats,
  onNavigate,
  onBetMatch,
}: {
  stats: { apostas: number; premio: number; jogos: number }
  onNavigate: (p: Page) => void
  onBetMatch?: (matchId: number) => void
}) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % banners.length), 4000)
    return () => clearInterval(timer)
  }, [])

  const statCards = [
    { num: stats.apostas, label: "Apostas feitas", icon: Ticket },
    { num: formatBRL(stats.premio), label: "Prêmio acumulado", icon: Trophy },
    { num: stats.jogos, label: "Bolões abertos", icon: Flame },
  ]

  const handleBannerClick = (b: typeof banners[0]) => {
    if (b.matchId) onBetMatch?.(b.matchId)
    else onNavigate("jogos")
  }

  return (
    <div className="animate-fade-up pt-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-5">
        <div className="relative overflow-hidden rounded-3xl border border-border shadow-lg">
          <div className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${current * 100}%)` }}>
            {banners.map((b, i) => (
              <button key={i} onClick={() => handleBannerClick(b)} className="relative min-w-full shrink-0">
                <Image src={b.src} alt={b.alt} width={1536} height={640} priority={i === 0}
                  className="h-auto w-full" />
              </button>
            ))}
          </div>
          <button onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70">
            <ChevronLeft className="size-5" />
          </button>
          <button onClick={() => setCurrent((c) => (c + 1) % banners.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 grid size-8 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70">
            <ChevronRight className="size-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-2 rounded-full transition-all ${i === current ? "w-5 bg-white" : "w-2 bg-white/50"}`} />
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-3xl px-5 pt-8 text-center">
        <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          O Bolão Oficial do <span className="text-primary">Hexa</span>
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-pretty leading-relaxed text-muted-foreground">
          Aposte R$10 por jogo. Acerte o placar exato. Leve até 80% do prêmio.
        </p>
        <button onClick={() => onNavigate("jogos")}
          className="group mt-6 inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-sm font-extrabold shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          style={{ background: "#16a34a", color: "#fff", boxShadow: "0 4px 24px 0 #16a34a55" }}>
          ⚽ Apostar agora
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
        <div className="mt-8 grid grid-cols-3 gap-3">
          {statCards.map(({ num, label, icon: Icon }) => (
            <div key={label} className="group rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
              <Icon className="mx-auto size-5 text-primary transition-transform duration-300 group-hover:scale-110" />
              <div className="mt-2 text-xl font-extrabold text-primary sm:text-2xl">{num}</div>
              <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground sm:text-xs">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-10 pt-10">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold">
          <ShieldCheck className="size-5 text-primary" /> Como funciona
        </h2>
        <ol className="overflow-hidden rounded-3xl border border-border bg-card">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-4 border-b border-border px-5 py-4 last:border-b-0">
              <span className="grid size-7 shrink-0 place-items-center rounded-full text-sm font-bold"
                style={{ background: "#16a34a22", color: "#16a34a" }}>{i + 1}</span>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{step}</p>
            </li>
          ))}
        </ol>
        <button onClick={() => onNavigate("jogos")}
          className="mt-6 w-full rounded-2xl py-4 text-sm font-extrabold shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
          style={{ background: "#16a34a", color: "#fff", boxShadow: "0 4px 24px 0 #16a34a55" }}>
          ⚽ Ver bolões abertos agora
        </button>
        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground/80">
          Este é um bolão recreativo entre amigos/conhecidos. 20% do valor de cada aposta é retido
          pela organização para custos de manutenção, hospedagem e operação da plataforma. Ao apostar, você concorda com essas condições.
        </p>
      </section>
    </div>
  )
}
