'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const PERFIS = ['usuario', 'asg', 'lider', 'admin']
const PERFIL_LABEL: any = { usuario: 'Usuário', asg: 'ASG', lider: 'Líder', admin: 'ADM' }
const PERFIL_COR: any = {
  usuario: 'bg-gray-100 text-gray-700',
  asg: 'bg-purple-100 text-purple-700',
  lider: 'bg-teal-100 text-teal-700',
  admin: 'bg-orange-100 text-orange-700',
}

export default function EquipePage() {
  const { profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [equipe, setEquipe] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [novoNome, setNovoNome] = useState('')
  const [novoEmail, setNovoEmail] = useState('')
  const [novoPerfil, setNovoPerfil] = useState('asg')
  const [novaSenha, setNovaSenha] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)

  useEffect(() => {
    if (!loading && (!profile || profile.perfil !== 'admin')) router.push('/')
  }, [profile, loading, router])

  useEffect(() => {
    if (profile) carregarEquipe()
  }, [profile])

  const carregarEquipe = async () => {
    setCarregando(true)
    const { data } = await supabase.from('profiles').select('*').order('perfil').order('nome')
    if (data) setEquipe(data)
    setCarregando(false)
  }

  const criarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    setErro('')
    setSucesso('')
    try {
      const res = await fetch('/api/criar-usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoNome, email: novoEmail, senha: novaSenha, perfil: novoPerfil })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Erro ao criar usuário')
      setSucesso(`Usuário ${novoNome} criado com sucesso!`)
      setNovoNome(''); setNovoEmail(''); setNovaSenha(''); setNovoPerfil('asg')
      setMostrarForm(false)
      carregarEquipe()
    } catch (err: any) {
      setErro(err.message)
    }
    setSalvando(false)
  }

  const alterarPerfil = async (id: string, perfil: string) => {
    await supabase.from('profiles').update({ perfil }).eq('id', id)
    carregarEquipe()
  }

  const alterarAtivo = async (id: string, ativo: boolean) => {
    await supabase.from('profiles').update({ ativo }).eq('id', id)
    carregarEquipe()
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-sm">AG</div>
          <div>
            <span className="font-bold">Agricopel · Gestão da Equipe</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/admin')} className="text-sm text-gray-400 hover:text-white">← Dashboard</button>
          <button onClick={signOut} className="text-sm text-gray-400 hover:text-white">Sair</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
            <p className="text-gray-500 text-sm">{equipe.length} pessoa(s) cadastrada(s)</p>
          </div>
          <button onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors text-sm">
            + Novo usuário
          </button>
        </div>

        {mostrarForm && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4">Criar novo usuário</h2>
            <form onSubmit={criarUsuario} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nome</label>
                <input value={novoNome} onChange={e => setNovoNome(e.target.value)} required
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nome completo" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">E-mail</label>
                <input value={novoEmail} onChange={e => setNovoEmail(e.target.value)} required type="email"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="email@agricopel.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Senha</label>
                <input value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required type="password"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Mínimo 6 caracteres" minLength={6} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Perfil</label>
                <select value={novoPerfil} onChange={e => setNovoPerfil(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {PERFIS.map(p => <option key={p} value={p}>{PERFIL_LABEL[p]}</option>)}
                </select>
              </div>
              {erro && <p className="col-span-2 text-red-500 text-sm">{erro}</p>}
              {sucesso && <p className="col-span-2 text-green-600 text-sm font-medium">{sucesso}</p>}
              <div className="col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setMostrarForm(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit" disabled={salvando}
                  className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-xl text-sm disabled:opacity-50">
                  {salvando ? 'Criando...' : 'Criar usuário'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">E-mail</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Perfil</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {carregando ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">Carregando...</td></tr>
              ) : equipe.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-400">Nenhum usuário cadastrado.</td></tr>
              ) : equipe.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-semibold text-gray-900 text-sm">{u.nome}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{u.email}</td>
                  <td className="px-4 py-3">
                    <select value={u.perfil}
                      onChange={e => alterarPerfil(u.id, e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded-lg border-0 cursor-pointer ${PERFIL_COR[u.perfil]}`}>
                      {PERFIS.map(p => <option key={p} value={p}>{PERFIL_LABEL[p]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => alterarAtivo(u.id, !u.ativo)}
                      className={`text-xs font-bold px-3 py-1 rounded-full transition-colors ${u.ativo ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
