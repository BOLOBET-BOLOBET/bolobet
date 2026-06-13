import { getSheet } from '@/lib/sheets';
import { NextResponse } from 'next/server';

// GET /api/jogos
// Retorna a lista de jogos com o total de apostas e prêmio calculado de cada um.
export async function GET() {
  try {
    const sheetJogos = await getSheet('jogos');
    const sheetApostas = await getSheet('apostas');

    const jogosRows = await sheetJogos.getRows();
    const apostasRows = await sheetApostas.getRows();

    const jogos = jogosRows.map((row) => {
      const id = row.get('id');

      const apostasDoJogo = apostasRows.filter((a) => String(a.get('matchId')) === String(id));
      const pool = apostasDoJogo.length * 10;
      const premio = Math.floor(pool * 0.8);

      return {
        id,
        fase: row.get('fase'),
        casa: row.get('casa'),
        fora: row.get('fora'),
        dataJogo: row.get('data_jogo'),
        aberto: String(row.get('aberto')).toUpperCase() === 'TRUE',
        placarOficialCasa: row.get('placar_oficial_casa') || null,
        placarOficialFora: row.get('placar_oficial_fora') || null,
        totalApostas: apostasDoJogo.length,
        pote: pool,
        premio,
      };
    });

    return NextResponse.json({ jogos });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ erro: 'Erro ao buscar jogos.' }, { status: 500 });
  }
}
