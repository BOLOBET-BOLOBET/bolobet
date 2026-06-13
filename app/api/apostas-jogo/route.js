import { getSheet } from '@/lib/sheets';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    if (!matchId) return NextResponse.json({ erro: 'matchId não informado.' }, { status: 400 });

    const sheet = await getSheet('apostas');
    const rows = await sheet.getRows();
    const apostas = rows.filter((r) => String(r.get('matchId')) === String(matchId));

    const porPlacar = {};
    apostas.forEach((a) => {
      const key = `${Number(a.get('placar_casa'))}x${Number(a.get('placar_fora'))}`;
      porPlacar[key] = (porPlacar[key] || 0) + 1;
    });

    return NextResponse.json({ total: apostas.length, porPlacar });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ erro: 'Erro ao buscar apostas.' }, { status: 500 });
  }
}
