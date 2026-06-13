import { getSheet } from '@/lib/sheets';
import { checkAdminAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// POST /api/admin/toggle-jogo
// Header: Authorization: Bearer SUA_SENHA_ADMIN
// Body: { matchId }
// Inverte o status "aberto" do jogo (abre se estava fechado, fecha se estava aberto).
export async function POST(request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const { matchId } = await request.json();
    const sheet = await getSheet('jogos');
    const rows = await sheet.getRows();

    const jogo = rows.find((j) => String(j.get('id')) === String(matchId));
    if (!jogo) {
      return NextResponse.json({ erro: 'Jogo não encontrado.' }, { status: 404 });
    }

    const novoStatus = String(jogo.get('aberto')).toUpperCase() === 'TRUE' ? 'FALSE' : 'TRUE';
    jogo.set('aberto', novoStatus);
    await jogo.save();

    return NextResponse.json({ sucesso: true, aberto: novoStatus === 'TRUE' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ erro: 'Erro ao atualizar jogo.' }, { status: 500 });
  }
}
