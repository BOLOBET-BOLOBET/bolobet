// Verifica se a requisição tem a senha de admin correta.
// A senha real fica em variável de ambiente, nunca no código/front-end.
export function checkAdminAuth(request) {
  const authHeader = request.headers.get('authorization') || '';
  const senha = authHeader.replace('Bearer ', '').trim();
  return senha === process.env.ADMIN_PASSWORD;
}
