import { getSheet } from '@/lib/sheets';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const whatsapp = searchParams.get('whatsapp');
    if (!whatsapp) return NextResponse.json({ erro: 'WhatsApp não informado.' }, { status: 400 });

    const sheetApostas = await getSheet('apostas');
    const sheetJogos = await getSheet('jogos');
    const apostasRows = await sheetApostas.getRows();
    const jogosRows = await sheetJogos.getRows();

    const minhasApostas = apostasRows
      .filter((a) => a.get('whatsapp') === whatsapp)
      .map((a) => {
        const matchId = a.get('matchId');
        const jogo = jogosRows.find((j) => String(j.get('id')) === String(matchId));
        const placarOficialCasa = jogo ? jogo.get('placar_oficial_casa') : null;
        const placarOficialFora = jogo ? jogo.get('placar_oficial_fora') : null;
        const placarCasa = Number(a.get('placar_casa'));
        const placarFora = Number(a.get('placar_fora'));
        const temResultado = placarOficialCasa !== null && placarOficialCasa !== '';
        const acertou = temResultado && Number(placarOficialCasa) === placarCasa && Number(placarOficialFora) === placarFora;
        return {
          id: a.get('id'), matchId,
          casa: jogo ? jogo.get('casa') : 'A definir',
          fora: jogo ? jogo.get('fora') : 'A definir',
          fase: jogo ? jogo.get('fase') : '',
          placarCasa, placarFora,
          pago: String(a.get('pago')).toUpperCase() === 'TRUE',
          data: a.get('data'),
          placarOficialCasa: placarOficialCasa || null,
          placarOficialFora: placarOficialFora || null,
          temResultado, acertou,
        };
      });

    return NextResponse.json({ apostas: minhasApostas });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ erro: 'Erro ao buscar apostas.' }, { status: 500 });
  }
}
