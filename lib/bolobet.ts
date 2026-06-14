export const PIX_KEY = "75998264463"
export const WHATSAPP_NUM = "5571997132736"
export const BET_VALUE = 10
export const PRIZE_RATE = 0.8
export const MAX_PER_SCORE = 3

export type Match = {
  id: number
  phase: string
  home: string
  homeFlag: string
  away: string
  awayFlag: string
  date: string
  open: boolean
  officialHome?: number | null
  officialAway?: number | null
  totalApostas?: number
  pote?: number
  premio?: number
}

export type Bet = {
  id: string
  matchId: number
  name: string
  whats: string
  homeScore: number
  awayScore: number
  paid: boolean
  createdAt: string
}

// Mapa de flags usado pelo page.tsx ao converter resposta da API
export const FLAG_MAP: Record<string, string> = {
  "México": "🇲🇽",
  "África do Sul": "🇿🇦",
  "República da Coreia": "🇰🇷",
  "Tchéquia": "🇨🇿",
  "Canadá": "🇨🇦",
  "Bósnia e Herzegovina": "🇧🇦",
  "EUA": "🇺🇸",
  "Paraguai": "🇵🇾",
  "Catar": "🇶🇦",
  "Suíça": "🇨🇭",
  "Brasil": "🇧🇷",
  "Marrocos": "🇲🇦",
  "Haiti": "🇭🇹",
  "Escócia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  "Austrália": "🇦🇺",
  "Turquia": "🇹🇷",
  "Alemanha": "🇩🇪",
  "Curaçao": "🇨🇼",
  "Holanda": "🇳🇱",
  "Japão": "🇯🇵",
  "Costa do Marfim": "🇨🇮",
  "Equador": "🇪🇨",
  "Tunísia": "🇹🇳",
  "Espanha": "🇪🇸",
  "Cabo Verde": "🇨🇻",
  "Bélgica": "🇧🇪",
  "Egito": "🇪🇬",
  "Arábia Saudita": "🇸🇦",
  "Uruguai": "🇺🇾",
  "Irã": "🇮🇷",
  "Nova Zelândia": "🇳🇿",
  "França": "🇫🇷",
  "Senegal": "🇸🇳",
  "Iraque": "🇮🇶",
  "Noruega": "🇳🇴",
  "Argentina": "🇦🇷",
  "Argélia": "🇩🇿",
  "Áustria": "🇦🇹",
  "Jordânia": "🇯🇴",
  "Portugal": "🇵🇹",
  "RD do Congo": "🇨🇩",
  "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "Croácia": "🇭🇷",
  "Gana": "🇬🇭",
  "Panamá": "🇵🇦",
  "Uzbequistão": "🇺🇿",
  "Colômbia": "🇨🇴",
  "Itália": "🇮🇹",
  "A definir": "⚽",
}

export function formatMatchDate(date: string): string {
  const dt = new Date(date.replace(" ", "T"))
  const day = dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  const time = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  return `${day} às ${time}`
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
}
