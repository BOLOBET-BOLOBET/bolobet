import { getSheet } from '@/lib/sheets';
import { checkAdminAuth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// POST /api/admin/marcar-pago
// Header: Authorization: Bearer SUA_SENHA_ADMIN
// Body: { apostaId }
// Marca/desmarca uma aposta como paga.
export async function POST(request) {
  if (!checkAdminAuth(request)) {
    return NextResponse.json({ erro: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const { apostaId } = await request.json();
    const sheet = await getSheet('apostas');
    const rows = await sheet.getRows();

    const aposta = rows.find((a) => String(a.get('id')) === String(apostaId));
    if (!aposta) {
      return NextResponse.json({ erro: 'Aposta não encontrada.' }, { status: 404 });
    }

    const novoStatus = String(aposta.get('pago')).toUpperCase() === 'TRUE' ? 'FALSE' : 'TRUE';
    aposta.set('pago', novoStatus);
    await aposta.save();

    return NextResponse.json({ sucesso: true, pago: novoStatus === 'TRUE' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ erro: 'Erro ao atualizar aposta.' }, { status: 500 });
  }
}
