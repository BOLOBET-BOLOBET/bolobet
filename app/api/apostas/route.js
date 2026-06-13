import { getSheet } from '@/lib/sheets';
import { checkAdminAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET /api/apostas?matchId=X
// Header: Authorization: Bearer SENHA_ADMIN
// Retorna as apostas de um jogo específico (apenas para o admin).
export async function GET(request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');

    const sheet = await getSheet('apostas');
    const rows = await sheet.getRows();

    const apostas = rows
      .filter((r) => !matchId || String(r.get('matchId')) === String(matchId))
      .map((r) => ({
        id: r.get('id'),
        matchId: r.get('matchId'),
        nome: r.get('nome'),
        whatsapp: r.get('whatsapp'),
        placar_casa: r.get('placar_casa'),
        placar_fora: r.get('placar_fora'),
        pago: r.get('pago'),
        data: r.get('data'),
      }));

    return NextResponse.json({ apostas });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ erro: 'Erro ao buscar apostas.' }, { status: 500 });
  }
}
