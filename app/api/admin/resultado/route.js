import { getSheet } from '@/lib/sheets';
import { checkAdminAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// POST /api/admin/resultado
// Header: Authorization: Bearer SUA_SENHA_ADMIN
// Body: { matchId, placarCasa, placarFora }
//
// Salva o placar oficial do jogo e calcula os vencedores:
// - Pote = total de apostas pagas * 10
// - Prêmio = 80% do pote
// - Vencedores = quem apostou exatamente no placar oficial
// - Se houver mais de um vencedor, o prêmio é dividido igualmente
export async function POST(request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const { matchId, placarCasa, placarFora } = await request.json();
    const placarCasaNum = Number(placarCasa);
    const placarForaNum = Number(placarFora);

    if (Number.isNaN(placarCasaNum) || Number.isNaN(placarForaNum)) {
      return NextResponse.json({ erro: 'Placar inválido.' }, { status: 400 });
    }

    const sheetJogos = await getSheet('jogos');
    const sheetApostas = await getSheet('apostas');

    const jogosRows = await sheetJogos.getRows();
    const jogo = jogosRows.find((j) => String(j.get('id')) === String(matchId));
    if (!jogo) {
      return NextResponse.json({ erro: 'Jogo não encontrado.' }, { status: 404 });
    }

    // Salva o placar oficial
    jogo.set('placar_oficial_casa', placarCasaNum);
    jogo.set('placar_oficial_fora', placarForaNum);
    await jogo.save();

    // Calcula vencedores
    const apostasRows = await sheetApostas.getRows();
    const apostasDoJogo = apostasRows.filter((a) => String(a.get('matchId')) === String(matchId));

    const pote = apostasDoJogo.length * 10;
    const premioTotal = Math.floor(pote * 0.8);

    const vencedores = apostasDoJogo.filter(
      (a) =>
        Number(a.get('placar_casa')) === placarCasaNum &&
        Number(a.get('placar_fora')) === placarForaNum
    );

    const premioPorVencedor =
      vencedores.length > 0 ? Math.floor(premioTotal / vencedores.length) : 0;

    const listaVencedores = vencedores.map((v) => ({
      nome: v.get('nome'),
      whatsapp: v.get('whatsapp'),
      premio: premioPorVencedor,
    }));

    return NextResponse.json({
      sucesso: true,
      pote,
      premioTotal,
      taxaOrganizacao: pote - premioTotal,
      totalVencedores: vencedores.length,
      vencedores: listaVencedores,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ erro: 'Erro ao salvar resultado.' }, { status: 500 });
  }
}
