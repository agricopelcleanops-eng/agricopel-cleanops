'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function GestaoEquipe() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [usuario, setUsuario] = useState('')
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

    // O sistema ainda exige formato de e-mail internamente, então adicionamos o sufixo automaticamente
    const loginFake = usuario.includes('@') ? usuario : `${usuario}@agricopel.com`

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: loginFake,
      password: 'Agricopel2026',
    })

    if (authError) {
      setMensagem('Erro: ' + authError.message)
      return
    }

    if (authData.user) {
      const { error: dbError } = await supabase.from('usuarios').insert([
        { id: authData.user.id, email: loginFake, nivel, unidade }
      ])

      if (dbError) {
        setMensagem('Erro no banco: ' + dbError.message)
      } else {
        setMensagem(`Sucesso! Login: ${loginFake} | Senha: Agricopel2026`)
        setUsuario('')
        fetchUsuarios()
      }
    }
  }

  async function excluirUsuario(id: string, emailUser: string) {
    if (emailUser === 'inaciowbc@gmail.com') {
      alert('Acesso mestre não pode ser removido.')
      return
    }

    const confirmar = confirm(`Remover acesso de ${emailUser}?`)
    if (!confirmar) return

    const { error: dbError } = await supabase.from('usuarios').delete().eq('id', id)
    
    if (dbError) {
      alert('Erro: ' + dbError.message)
    } else {
      fetchUsuarios()
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-black text-orange-500 uppercase tracking-tighter">Gestão de Equipe · CSC</h1>
            <button onClick={() => window.location.href = '/admin'} className="text-xs bg-slate-800 px-4 py-2 rounded-full hover:bg-slate-700 transition-all font-bold">VOLTAR AO DASHBOARD</button>
        </div>
        
        <form onSubmit={cadastrarUsuario} className="bg-slate-900 p-8 rounded-2xl mb-10 border border-slate-800 shadow-2xl">
          <h2 className="text-sm font-bold text-slate-400 uppercase mb-6 tracking-widest">Novo Acesso</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Usuário / Nick</label>
                <input 
                  type="text" placeholder="ex: deise.agricopel" value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  className="bg-slate-800 p-3 rounded-lg border border-slate-700 focus:border-orange-500 outline-none text-sm"
                  required
                />
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Nível de Acesso</label>
                <select 
                  value={nivel} onChange={(e) => setNivel(e.target.value)}
                  className="bg-slate-800 p-3 rounded-lg border border-slate-700 outline-none text-sm"
                >
                  <option value="asg">ASG (Execução)</option>
                  <option value="lider">LÍDER (Gestão)</option>
                  <option value="admin">ADMIN (Mestre)</option>
                </select>
            </div>
            <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Unidade</label>
                <input 
                  type="text" value={unidade}
                  onChange={(e) => setUnidade(e.target.value)}
                  className="bg-slate-800 p-3 rounded-lg border border-slate-700 outline-none text-sm"
                />
            </div>
            <div className="flex flex-col gap-2 justify-end">
                <button className="bg-orange-600 hover:bg-orange-500 font-black py-3 rounded-lg transition-all text-sm uppercase tracking-tighter shadow-lg shadow-orange-900/20">
                  Cadastrar
                </button>
            </div>
          </div>
          {mensagem && <p className="mt-4 text-orange-400 text-xs font-bold bg-orange-400/10 p-3 rounded-lg border border-orange-400/20">{mensagem}</p>}
        </form>

        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-500 uppercase text-[10px] font-black tracking-widest">
              <tr>
                <th className="p-5">Usuário Identificado</th>
                <th className="p-5">Cargo</th>
                <th className="p-5">Unidade</th>
                <th className="p-5 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-5 text-sm font-medium text-slate-200">{u.email}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      u.nivel === 'admin' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                      u.nivel === 'lider' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 
                      'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                      {u.nivel}
                    </span>
                  </td>
                  <td className="p-5 text-xs text-slate-500 font-bold">{u.unidade}</td>
                  <td className="p-5 text-right">
                    <button 
                        onClick={() => excluirUsuario(u.id, u.email)}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-all"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
