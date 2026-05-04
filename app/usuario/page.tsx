'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const ANDAR_LABEL: any = { terreo: 'Térreo', '1': '1º andar', '2': '2º andar', '3': '3º andar' }
const STATUS_LABEL: any = {
  novo: { label: 'Novo', cor: 'bg-blue-100 text-blue-700' },
  delegado: { label: 'Delegado', cor: 'bg-yellow-100 text-yellow-700' },
  em_execucao: { label: 'Em execução', cor: 'bg-purple-100 text-purple-700' },
  a_verificar: { label: 'A verificar', cor: 'bg-teal-100 text-teal-700' },
  concluido: { label: 'Concluído', cor: 'bg-green-100 text-green-700' },
  recusado: { label: 'Recusado', cor: 'bg-red-100 text-red-700' },
}

export default function UsuarioPage() {
  const [nome, setNome] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [andar, setAndar] = useState('terreo')
  const [foto, setFoto] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')
  const [chamadosCriados, setChamadosCriados] = useState<any[]>([])

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setFoto(file); setFotoPreview(URL.createObjectURL(file)) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setErro('')
    setSucesso('')
    try {
      let fotoUrl = ''
      if (foto) {
        const ext = foto.name.split('.').pop()
        const path = `chamados/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('fotos').upload(path, foto)
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('fotos').getPublicUrl(path)
          fotoUrl = urlData.publicUrl
        }
      }
      const { data, error } = await supabase.from('chamados').insert({
        titulo,
        descricao,
        andar,
        foto_abertura: fotoUrl,
        status: 'novo',
        prioridade: false,
        codigo: 'TEMP',
        solicitante_id: null,
      }).select().single()
      if (error) throw error
      await supabase.from('comentarios').insert({
        chamado_id: data.id,
        autor_id: null,
        texto: `Chamado aberto por: ${nome}`,
        interno: false,
      })
      setSucesso(`Chamado ${data.codigo} aberto com sucesso!`)
      setChamadosCriados(prev => [data, ...prev].slice(0, 3))
      setNome('')
      setTitulo('')
      setDescricao('')
      setAndar('terreo')
      setFoto(null)
      setFotoPreview('')
    } catch {
      setErro('Erro ao abrir chamado. Tente novamente.')
    }
    setEnviando(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-sm">AG</div>
        <span className="font-bold">Agricopel · Chamado de Limpeza</span>
      </header>
      <main className="max-w-lg mx-auto p-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Abrir chamado</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seu nome <span className="text-red-500">*</span></label>
              <input value={nome} onChange={e => setNome(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Ex: João Silva" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Andar</label>
              <select value={andar} onChange={e => setAndar(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500">
                <option value="terreo">Térreo</option>
                <option value="1">1º andar</option>
                <option value="2">2º andar</option>
                <option value="3">3º andar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título <span className="text-red-500">*</span></label>
              <input value={titulo} onChange={e => setTitulo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Ex: Banheiro feminino sujo" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (opcional)</label>
              <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                placeholder="Descreva o problema com mais detalhes..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto (opcional)</label>
              <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-200 rounded-xl p-6 cursor-pointer hover:border-orange-400 transition-colors">
                {fotoPreview
                  ? <img src={fotoPreview} alt="preview" className="w-full h-40 object-cover rounded-lg" />
                  : <><div className="text-3xl mb-2">📷</div><span className="text-sm text-gray-500">Tirar foto ou escolher da galeria</span></>
                }
                <input type="file" accept="image/*" capture="environment" onChange={handleFoto} className="hidden" />
              </label>
            </div>
            {erro && <p className="text-red-500 text-sm">{erro}</p>}
            {sucesso && <p className="text-green-600 text-sm font-medium">{sucesso}</p>}
            <button type="submit" disabled={enviando}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
              {enviando ? 'Enviando...' : 'Enviar chamado'}
            </button>
          </form>
        </div>

        {chamadosCriados.length > 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-3">Chamados abertos agora</h3>
            <div className="space-y-3">
              {chamadosCriados.map(c => (
                <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-xs text-gray-400">{c.codigo}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_LABEL[c.status]?.cor}`}>
                      {STATUS_LABEL[c.status]?.label}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm mb-1">{c.titulo}</div>
                  <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                    {ANDAR_LABEL[c.andar]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
