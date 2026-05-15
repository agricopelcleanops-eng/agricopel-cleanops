import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { nome, login, senha, perfil } = await req.json()
  
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )

  const loginLimpo = login.toLowerCase().trim().replace(/\s+/g, '')
  const email = `${loginLimpo}@agricopel.app`

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true
  })

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  const { error: profileError } = await supabaseAdmin.from('profiles').insert({
    id: authData.user.id,
    nome,
    email,
    login: loginLimpo,
    perfil,
    ativo: true
  })

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 400 })

  return NextResponse.json({ success: true })
}
