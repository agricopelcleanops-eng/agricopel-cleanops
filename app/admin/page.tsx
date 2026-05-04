'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function AdminPage() {
  const { profile, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!profile || profile.perfil !== 'admin')) {
      router.push('/')
    }
  }, [profile, loading, router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">Carregando...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-sm">AG</div>
          <span className="font-bold">Agricopel · Gestão de Limpeza</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Olá, {profile?.nome}</span>
          <button onClick={signOut} className="text-sm text-gray-400 hover:text-white transition-colors">Sair</button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm">Visão geral do sistema de limpeza</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Chamados hoje', valor: '0', cor: 'text-blue-600' },
            { label: 'Em aberto', valor: '0', cor: 'text-orange-500' },
            { label: 'Concluídos', valor: '0', cor: 'text-green-600' },
            { label: 'SLA médio', valor: '—', cor: 'text-purple-600' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{item.label}</div>
              <div className={`text-3xl font-bold ${item.cor}`}>{item.valor}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Chamados recentes</h2>
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-3">📋</div>
            <p>Nenhum chamado ainda.</p>
            <p className="text-sm mt-1">Os chamados aparecerão aqui assim que forem abertos.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
