// Define a senha de acesso de alguém da equipe. Só admin pode chamar.
// A senha definida pelo admin é provisória: a pessoa troca no primeiro acesso.
// POST { responsavel_id: string, senha: string }
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const resposta = (corpo: unknown, status = 200) =>
  new Response(JSON.stringify(corpo), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return resposta({ erro: 'metodo' }, 405);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: quem } = await admin.auth.getUser(token);
  if (!quem.user) return resposta({ erro: 'sessao' }, 401);

  const { data: eu } = await admin
    .from('responsaveis')
    .select('id')
    .eq('user_id', quem.user.id)
    .eq('ativo', true)
    .eq('papel', 'admin')
    .maybeSingle();
  if (!eu) return resposta({ erro: 'so_admin' }, 403);

  let corpo: { responsavel_id?: string; senha?: string };
  try {
    corpo = await req.json();
  } catch {
    return resposta({ erro: 'corpo' }, 400);
  }
  const senha = String(corpo.senha ?? '');
  if (senha.length < 8) return resposta({ erro: 'senha_curta' }, 400);

  const { data: alvo } = await admin
    .from('responsaveis')
    .select('id, email, user_id, ativo')
    .eq('id', String(corpo.responsavel_id ?? ''))
    .maybeSingle();
  if (!alvo) return resposta({ erro: 'nao_encontrado' }, 404);
  if (!alvo.email) return resposta({ erro: 'sem_email' }, 400);
  if (!alvo.ativo) return resposta({ erro: 'inativo' }, 400);

  if (alvo.user_id) {
    const { error } = await admin.auth.admin.updateUserById(alvo.user_id, { password: senha, email_confirm: true });
    if (error) return resposta({ erro: 'falhou', detalhe: error.message }, 400);
    await admin.from('responsaveis').update({ trocar_senha: true }).eq('id', alvo.id);
    return resposta({ ok: true, criado: false });
  }
  // O gatilho privado.vincular_usuario liga a conta nova ao cadastro pelo e-mail.
  const { error } = await admin.auth.admin.createUser({ email: alvo.email, password: senha, email_confirm: true });
  if (error) return resposta({ erro: 'falhou', detalhe: error.message }, 400);
  await admin.from('responsaveis').update({ trocar_senha: true }).eq('id', alvo.id);
  return resposta({ ok: true, criado: true });
});
