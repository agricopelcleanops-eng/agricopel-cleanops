'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError('E-mail ou senha incorretos.')
      setLoading(false)
      return
    }

    // Busca o nível de acesso na tabela de usuários
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('nivel')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      setError('Usuário não configurado no sistema.')
      setLoading(false)
      return
    }

    // Redirecionamento baseado no nível
    if (userData.nivel === 'admin') router.push('/admin')
    else if (userData.nivel === 'lider') router.push('/lider')
    else if (userData.nivel === 'asg') router.push('/asg')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center font-black text-2xl text-white mb-4 shadow-lg shadow-orange-500/20">
            AG
          </div>
          <h1 className="text-2xl font-bold text-white text-center">CleanOps Agricopel</h1>
          <p className="text-gray-500 text-sm">Gestão de Facilidades</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 px-1">E-mail</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 px-1">Senha</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-4 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? 'AUTENTICANDO...' : 'ENTRAR NO SISTEMA'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-500 text-xs">Precisa abrir um chamado rápido?</p>
          <a href="/usuario" className="text-orange-500 text-sm font-bold mt-2 inline-block hover:underline">
            Acessar Painel do Solicitante →
          </a>
        </div>
      </div>
    </div>
  )
}
