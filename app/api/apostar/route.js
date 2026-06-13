import { getSheet } from '@/lib/sheets';
import { NextResponse } from 'next/server';

// POST /api/apostar
// Body esperado: { matchId, nome, whatsapp, placarCasa, placarFora }
//
// Regras aplicadas aqui (no servidor, pra ninguém burlar pelo navegador):
// - Jogo precisa existir e estar "aberto" pra apostas
// - Máximo de 3 apostas com o mesmo placar por jogo
export async function POST(request) {
  try {
    const body = await request.json();
    const { matchId, nome, whatsapp, placarCasa, placarFora } = body;

    // Validações básicas de entrada
    if (
      matchId === undefined ||
      !nome ||
      !whatsapp ||
      placarCasa === undefined ||
      placarFora === undefined
    ) {
      return NextResponse.json({ erro: 'Dados incompletos.' }, { status: 400 });
    }

    const placarCasaNum = Number(placarCasa);
    const placarForaNum = Number(placarFora);

    if (
      Number.isNaN(placarCasaNum) ||
      Number.isNaN(placarForaNum) ||
      placarCasaNum < 0 ||
      placarForaNum < 0
    ) {
      return NextResponse.json({ erro: 'Placar inválido.' }, { status: 400 });
    }

    const sheetJogos = await getSheet('jogos');
    const sheetApostas = await getSheet('apostas');

    // Verifica se o jogo existe e está aberto
    const jogosRows = await sheetJogos.getRows();
    const jogo = jogosRows.find((j) => String(j.get('id')) === String(matchId));

    if (!jogo) {
      return NextResponse.json({ erro: 'Jogo não encontrado.' }, { status: 404 });
    }

    if (String(jogo.get('aberto')).toUpperCase() !== 'TRUE') {
      return NextResponse.json(
        { erro: 'Esse bolão ainda não está aberto para apostas.' },
        { status: 403 }
      );
    }

    // Conta quantas apostas já existem com esse exato placar, nesse jogo
    const apostasRows = await sheetApostas.getRows();
    const apostasComEssePlacar = apostasRows.filter(
      (a) =>
        String(a.get('matchId')) === String(matchId) &&
        Number(a.get('placar_casa')) === placarCasaNum &&
        Number(a.get('placar_fora')) === placarForaNum
    );

    if (apostasComEssePlacar.length >= 3) {
      return NextResponse.json(
        { erro: 'Esse placar já atingiu o limite de 3 apostas. Escolha outro placar.' },
        { status: 409 }
      );
    }

    // Gera um id simples baseado em timestamp
    const novoId = Date.now().toString();

    await sheetApostas.addRow({
      id: novoId,
      matchId: String(matchId),
      nome,
      whatsapp,
      placar_casa: placarCasaNum,
      placar_fora: placarForaNum,
      pago: 'FALSE',
      data: new Date().toISOString(),
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Aposta registrada com sucesso!',
      apostaId: novoId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ erro: 'Erro ao registrar aposta.' }, { status: 500 });
  }
}
