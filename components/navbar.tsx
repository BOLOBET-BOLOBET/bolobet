"use client"

import Image from "next/image"
import { Home, Trophy, ListChecks, Ticket } from "lucide-react"

export type Page = "home" | "jogos" | "ranking" | "minhas-apostas"

const links: { id: Page; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Início", icon: Home },
  { id: "jogos", label: "Jogos", icon: ListChecks },
  { id: "ranking", label: "Ranking", icon: Trophy },
  { id: "minhas-apostas", label: "Minhas Apostas", icon: Ticket },
]

export function Navbar({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  return (
    <nav className="fixed left-1/2 top-4 z-[1000] w-[calc(100%-1.5rem)] max-w-3xl -translate-x-1/2">
      <div className="glass flex items-center justify-between gap-2 rounded-2xl border border-border/80 px-3 py-2 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.6)] sm:px-5">
        <button onClick={() => onNavigate("home")} className="flex shrink-0 items-center">
          <Image src="/LOGO%20PALPITA%20AI%20-%20BRANCA.webp" alt="PalpitaAi" width={200} height={60} className="h-10 w-auto" />
        </button>
        <div className="hide-scrollbar flex items-center gap-1 overflow-x-auto">
          {links.map(({ id, label, icon: Icon }) => {
            const active = page === id
            return (
              <button key={id} onClick={() => onNavigate(id)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                  active ? "bg-primary text-primary-foreground shadow-sm shadow-primary/40"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}>
                <Icon className="size-4 shrink-0" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
