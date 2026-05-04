'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

const STATUS_COLUNAS = [
  { key: 'novo', label: 'Novo', cor: 'bg-blue-100 text-blue-700 border-blue-200' },
  { key: 'delegado', label: 'Delegado', cor: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { key: 'em_execucao', label: 'Em execução', cor: 'bg-purple-100 text-purple-700 border-purple-200' },
  { key: 'a_verificar', label: 'A verificar', cor: 'bg-teal-100 text-teal-700 border-teal-200' },
  { key: 'concluido', label: 'Concluído', cor: 'bg-green-100 text-green-700 border-green-200' },
]

const ANDAR_LABEL: any = { terreo: 'Térreo', '1': '1º', '2': '2º', '3': '3º' }

export default function LiderPage() {
  const { profile, loading, signOut } = useAuth()
  const router = useRouter()
  const [chamados, setChamados] = useState<any[]>([])
  const [asgs, setAsgs] = useState<any[]>([])
  const [chamadoAberto, setChamadoAberto] = useState<any>(null)
  const [comentario, setComentario] = useState('')
  const [interno, setInterno] = useState(false)
  const [enviandoComentario, setEnviandoComentario] = useState(false)
  const [comentarios, setComentarios] = useState<any[]>([])
  const [motivo, setMotivo] = useState('')

  useEffect(() => {
    if (!loading && (!profile || !['lider','admin'].includes(profile.perfil))) router.push('/')
  }, [profile, loading, router])

  useEffect(() => {
    if (profile) { carregarChamados(); carregarAsgs() }
  }, [profile])

  const carregarChamados = async () => {
    const { data } = await supabase
      .from('chamados')
      .select('*, solicitante:profiles!chamados_solicitante_id_fkey(nome), asg:profiles!chamados_asg_id_fkey(nome)')
      .order('prioridade', { ascending: false })
      .order('created_at', { ascending: false })
    if (data) setChamados(data)
  }

  const carregarAsgs = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('perfil', 'asg').eq('ativo', true)
    if (data) setAsgs(data)
  }

  const carregarComentarios = async (chamadoId: string) => {
    const { data } = await supabase
      .from('comentarios')
      .select('*, autor:profiles(nome, perfil)')
      .eq('chamado_id', chamadoId)
      .order('created_at', { ascending: true })
    if (data) setComentarios(data)
  }

  const abrirChamado = (c: any) => {
    setChamadoAberto(c)
    carregarComentarios(c.id)
  }

  const moverStatus = async (chamado: any, novoStatus: string) => {
    await supabase.from('chamados').update({ status: novoStatus }).eq('id', chamado.id)
    await supabase.from('historico_status').insert({
      chamado_id: chamado.id, status_anterior: chamado.status,
      status_novo: novoStatus, alterado_por: profile?.id
    })
    carregarChamados()
    if (chamadoAberto?.id === chamado.id) setChamadoAberto({ ...chamadoAberto, status: novoStatus })
  }

  const delegarAsg = async (chamadoId: string, asgId: string) => {
    await supabase.from('chamados').update({ asg_id: asgId, status: 'delegado', delegado_at: new Date().toISOString() }).eq('id', chamadoId)
    carregarChamados()
  }

  const enviarComentario = async () => {
    if (!comentario.trim() || !chamadoAberto) return
    setEnviandoComentario(true)
    await supabase.from('comentarios').insert({
      chamado_id: chamadoAberto.id, autor_id: profile?.id,
      texto: comentario, interno
    })
    setComentario('')
    setInterno(false)
    carregarComentarios(chamadoAberto.id)
    setEnviandoComentario(false)
  }

  const concluirChamado = async (chamadoId: string) => {
    await supabase.from('chamados').update({ status: 'concluido' }).eq('id', chamadoId)
    carregarChamados()
    setChamadoAberto(null)
  }

  const chamadosPorStatus = (status: string) => chamados.filter(c => c.status === status)

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-sm">AG</div>
          <span className="font-bold">Agricopel · Kanban</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Olá, {profile?.nome}</span>
          <button onClick={signOut} className="text-sm text-gray-400 hover:text-white">Sair</button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)]">
        {/* KANBAN */}
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-4 h-full min-w-max">
            {STATUS_COLUNAS.map(col => (
              <div key={col.key} className="w-64 flex flex-col">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border mb-3 ${col.cor}`}>
                  <span className="font-bold text-sm">{col.label}</span>
                  <span className="ml-auto bg-white bg-opacity-60 text-xs font-bold px-2 py-0.5 rounded-full">
                    {chamadosPorStatus(col.key).length}
                  </span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {chamadosPorStatus(col.key).map(c => (
                    <div key={c.id}
                      onClick={() => abrirChamado(c)}
                      className={`bg-white rounded-xl border p-3 cursor-pointer hover:shadow-md transition-shadow ${c.prioridade ? 'border-red-400 border-2' : 'border-gray-200'}`}>
                      {c.prioridade && (
                        <div className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg mb-2">🔴 PRIORIDADE</div>
                      )}
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-xs text-gray-400">{c.codigo}</span>
                        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md">{ANDAR_LABEL[c.andar]}</span>
                      </div>
                      <div className="font-semibold text-gray-900 text-sm mb-2">{c.titulo}</div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400">{c.solicitante?.nome}</span>
                        {c.asg?.nome && <span className="text-xs text-purple-600 font-medium">→ {c.asg.nome}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PAINEL LATERAL */}
        {chamadoAberto && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <div className="font-mono text-xs text-gray-400">{chamadoAberto.codigo}</div>
                <div className="font-bold text-gray-900">{chamadoAberto.titulo}</div>
              </div>
              <button onClick={() => setChamadoAberto(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-400 mb-1">Andar</div>
                  <div className="font-semibold">{ANDAR_LABEL[chamadoAberto.andar]}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-xs text-gray-400 mb-1">Solicitante</div>
                  <div className="font-semibold">{chamadoAberto.solicitante?.nome}</div>
                </div>
              </div>

              {chamadoAberto.descricao && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">{chamadoAberto.descricao}</div>
              )}

              {chamadoAberto.foto_abertura && (
                <img src={chamadoAberto.foto_abertura} alt="foto" className="w-full rounded-xl object-cover max-h-40" />
              )}

              {/* Delegar ASG */}
              {['novo','delegado'].includes(chamadoAberto.status) && asgs.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-gray-500 uppercase mb-2">Delegar para ASG</div>
                  <div className="space-y-1">
                    {asgs.map(asg => (
                      <button key={asg.id} onClick={() => delegarAsg(chamadoAberto.id, asg.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${chamadoAberto.asg_id === asg.id ? 'bg-purple-50 border-purple-300 text-purple-700 font-semibold' : 'border-gray-200 hover:bg-gray-50'}`}>
                        {asg.nome}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mover status */}
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase mb-2">Mover para</div>
                <div className="flex flex-wrap gap-2">
                  {STATUS_COLUNAS.filter(s => s.key !== chamadoAberto.status).map(s => (
                    <button key={s.key} onClick={() => moverStatus(chamadoAberto, s.key)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${s.cor}`}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comentários */}
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase mb-2">Comentários</div>
                <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                  {comentarios.length === 0 && <p className="text-xs text-gray-400">Nenhum comentário ainda.</p>}
                  {comentarios.map(cm => (
                    <div key={cm.id} className={`rounded-lg p-2 text-xs ${cm.interno ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                      {cm.interno && <span className="text-yellow-700 font-bold text-xs">INTERNO · </span>}
                      <span className="font-semibold text-gray-700">{cm.autor?.nome}: </span>
                      <span className="text-gray-600">{cm.texto}</span>
                    </div>
                  ))}
                </div>
                <textarea value={comentario} onChange={e => setComentario(e.target.value)}
                  placeholder="Escreva um comentário..." rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 mb-2" />
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" checked={interno} onChange={e => setInterno(e.target.checked)} className="rounded" />
                    Nota interna
                  </label>
                  <button onClick={enviarComentario} disabled={enviandoComentario || !comentario.trim()}
                    className="text-xs font-bold px-3 py-1.5 bg-orange-500 text-white rounded-lg disabled:opacity-50">
                    Enviar
                  </button>
                </div>
              </div>
            </div>

            {/* Botão concluir */}
            {chamadoAberto.status === 'a_verificar' && (
              <div className="p-4 border-t border-gray-100">
                <button onClick={() => concluirChamado(chamadoAberto.id)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors">
                  ✓ Concluir chamado
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
