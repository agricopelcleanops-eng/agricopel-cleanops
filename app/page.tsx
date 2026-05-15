'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErro('')
    const email = `${login.toLowerCase().trim()}@agricopel.app`
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) { setErro('Login ou senha incorretos.'); setLoading(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('perfil').eq('id', user.id).single()
      if (profile?.perfil === 'admin') router.push('/admin')
      else if (profile?.perfil === 'lider') router.push('/lider')
      else if (profile?.perfil === 'asg') router.push('/asg')
      else router.push('/usuario')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
              <span className="text-white font-bold text-xl">AG</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Agricopel</h1>
            <p className="text-gray-500 text-sm mt-1">Gestão de Limpeza</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Login</label>
              <input type="text" value={login} onChange={e => setLogin(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Ex: denise" required autoCapitalize="none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Senha</label>
              <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="••••••••" required />
            </div>
            {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">Agricopel © 2025 · Jaraguá do Sul SC</p>
      </div>
    </div>
  )
}
