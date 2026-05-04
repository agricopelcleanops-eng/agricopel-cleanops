'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function GestaoEquipe() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [email, setEmail] = useState('')
  const [nivel, setNivel] = useState('asg')
  const [unidade, setUnidade] = useState('CSC')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    fetchUsuarios()
  }, [])

  async function fetchUsuarios() {
    const { data } = await supabase.from('usuarios').select('*').order('nivel')
    if (data) setUsuarios(data)
  }

  async function cadastrarUsuario(e: React.FormEvent) {
    e.preventDefault()
    setMensagem('Processando...')

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: 'Agricopel2026',
    })

    if (authError) {
      setMensagem('Erro: ' + authError.message)
      return
    }

    if (authData.user) {
      const { error: dbError } = await supabase.from('usuarios').insert([
        { id: authData.user.id, email, nivel, unidade }
      ])

      if (dbError) {
        setMensagem('Erro ao salvar no banco: ' + dbError.message)
      } else {
        setMensagem('Cadastrado! Senha padrão: Agricopel2026')
        setEmail('')
        fetchUsuarios()
      }
    }
  }

  async function excluirUsuario(id: string, emailUser: string) {
    if (emailUser === 'inaciowbc@gmail.com') {
      alert('Você não pode excluir a si mesmo!')
      return
    }

    const confirmar = confirm(`Tem certeza que deseja remover ${emailUser}?`)
    if (!confirmar) return

    // Remove da nossa tabela de perfis
    const { error: dbError } = await supabase.from('usuarios').delete().eq('id', id)
    
    if (dbError) {
      alert('Erro ao excluir: ' + dbError.message)
    } else {
      alert('Usuário removido com sucesso!')
      fetchUsuarios()
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-orange-500">Gestão de Equipe</h1>
            <button onClick={() => window.location.href = '/admin'} className="text-slate-400 hover:text-white">← Voltar Dashboard</button>
        </div>
        
        <form onSubmit={cadastrarUsuario} className="bg-slate-800 p-6 rounded-lg mb-10 border border-slate-700 shadow-xl">
          <h2 className="text-xl mb-4 font-semibold text-slate-200">Adicionar Novo Integrante</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              type="email" placeholder="E-mail ou Nick" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700 p-2 rounded border border-slate-600 outline-none focus:border-orange-500 transition-all"
              required
            />
            <select 
              value={nivel} onChange={(e) => setNivel(e.target.value)}
              className="bg-slate-700 p-2 rounded border border-slate-600 outline-none"
            >
              <option value="asg">ASG (Execução)</option>
              <option value="lider">Líder (Gestão)</option>
              <option value="admin">Admin (Total)</option>
            </select>
            <input 
              type="text" placeholder="Unidade" value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              className="bg-slate-700 p-2 rounded border border-slate-600 outline-none"
            />
            <button className="bg-orange-600 hover:bg-orange-500 font-bold py-2 rounded transition-all active:scale-95 text-white">
              CADASTRAR
            </button>
          </div>
          {mensagem && <p className="mt-4 text-orange-400 text-sm font-bold">{mensagem}</p>}
        </form>

        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-700/50 text-slate-300 uppercase text-xs">
              <tr>
                <th className="p-4">Usuário</th>
                <th className="p-4">Cargo</th>
                <th className="p-4">Unidade</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-4 font-medium">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black tracking-wider ${
                      u.nivel === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 
                      u.nivel === 'lider' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50' : 
                      'bg-green-500/20 text-green-400 border border-green-500/50'
                    }`}>
                      {u.nivel.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{u.unidade}</td>
                  <td className="p-4 text-right">
                    <button 
                        onClick={() => excluirUsuario(u.id, u.email)}
                        className="text-red-500 hover:bg-red-500/10 px-3 py-1 rounded-md transition-all text-sm"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
