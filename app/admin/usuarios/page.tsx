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

    // 1. Criar o usuário no Auth (Senha padrão: Agricopel2026)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: 'Agricopel2026',
    })

    if (authError) {
      setMensagem('Erro no Auth: ' + authError.message)
      return
    }

    if (authData.user) {
      // 2. Vincular na nossa tabela de permissões
      const { error: dbError } = await supabase.from('usuarios').insert([
        { id: authData.user.id, email, nivel, unidade }
      ])

      if (dbError) {
        setMensagem('Erro ao salvar nível: ' + dbError.message)
      } else {
        setMensagem('Usuário cadastrado com sucesso! Senha padrão: Agricopel2026')
        setEmail('')
        fetchUsuarios()
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-orange-500 mb-8">Gestão de Equipe - Agricopel</h1>
        
        {/* Formulário de Cadastro */}
        <form onSubmit={cadastrarUsuario} className="bg-slate-800 p-6 rounded-lg mb-10 border border-slate-700">
          <h2 className="text-xl mb-4 font-semibold">Adicionar Novo Integrante</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              type="email" placeholder="E-mail" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700 p-2 rounded border border-slate-600 outline-none focus:border-orange-500"
              required
            />
            <select 
              value={nivel} onChange={(e) => setNivel(e.target.value)}
              className="bg-slate-700 p-2 rounded border border-slate-600"
            >
              <option value="asg">ASG</option>
              <option value="lider">Líder</option>
              <option value="admin">Admin</option>
            </select>
            <input 
              type="text" placeholder="Unidade (ex: CSC)" value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              className="bg-slate-700 p-2 rounded border border-slate-600"
            />
            <button className="bg-orange-600 hover:bg-orange-500 font-bold py-2 rounded transition-colors">
              CADASTRAR
            </button>
          </div>
          {mensagem && <p className="mt-4 text-orange-400 text-sm font-medium">{mensagem}</p>}
        </form>

        {/* Lista de Usuários */}
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
          <table className="w-full text-left">
            <thead className="bg-slate-700 text-slate-300 uppercase text-xs">
              <tr>
                <th className="p-4">E-mail</th>
                <th className="p-4">Nível</th>
                <th className="p-4">Unidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-750">
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      u.nivel === 'admin' ? 'bg-red-900 text-red-200' : 
                      u.nivel === 'lider' ? 'bg-blue-900 text-blue-200' : 'bg-green-900 text-green-200'
                    }`}>
                      {u.nivel.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{u.unidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
