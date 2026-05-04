'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function PainelASG() {
  const [tarefas, setTarefas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTarefas()
  }, [])

  async function fetchTarefas() {
    const { data } = await supabase
      .from('chamados')
      .select('*')
      .eq('status', 'pendente')
      .order('created_at', { ascending: false })
    
    if (data) setTarefas(data)
    setLoading(false)
  }

  async function finalizarTarefa(id: string) {
    const { error } = await supabase
      .from('chamados')
      .update({ status: 'concluido' })
      .eq('id', id)
    
    if (!error) fetchTarefas()
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-orange-500">Minhas Tarefas</h1>
        <button onClick={() => window.location.href = '/'} className="text-sm bg-slate-800 px-3 py-1 rounded">Sair</button>
      </header>

      {loading ? (
        <p className="text-center text-slate-400">Carregando tarefas...</p>
      ) : tarefas.length === 0 ? (
        <div className="text-center p-10 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-slate-400">Tudo limpo! Nenhuma tarefa pendente. ✅</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tarefas.map((t) => (
            <div key={t.id} className="bg-slate-800 p-4 rounded-lg border-l-4 border-orange-500 shadow-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold bg-slate-700 px-2 py-1 rounded uppercase">{t.setor}</span>
                <span className="text-xs text-slate-400">{new Date(t.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-lg mb-4">{t.descricao}</p>
              <button 
                onClick={() => finalizarTarefa(t.id)}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-md transition-colors"
              >
                CONCLUIR TAREFA
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
