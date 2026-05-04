'use client'
import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header com Navegação Integrada */}
      <header className="bg-slate-900 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-sm font-black">AG</span>
              Agricopel · Gestão de Limpeza
            </h1>
            <nav className="hidden md:flex gap-6">
              <Link href="/admin" className="text-orange-500 font-bold border-b-2 border-orange-500 pb-1">Dashboard</Link>
              <Link href="/admin/usuarios" className="text-slate-400 hover:text-white transition-colors pb-1">Gestão de Equipe</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden sm:inline">Olá, Administrador</span>
            <button onClick={() => window.location.href = '/'} className="bg-slate-800 hover:bg-slate-700 px-4 py-1.5 rounded-md text-sm transition-all font-medium">Sair</button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold">Dashboard</h2>
            <p className="text-slate-500">Visão geral do sistema de limpeza na unidade CSC</p>
          </div>
        </div>

        {/* Cards de Estatísticas Reais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Chamados Hoje</p>
            <p className="text-4xl font-extrabold text-blue-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Em Aberto</p>
            <p className="text-4xl font-extrabold text-orange-500">0</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Concluídos</p>
            <p className="text-4xl font-extrabold text-green-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">SLA Médio</p>
            <p className="text-4xl font-extrabold text-slate-300">—</p>
          </div>
        </div>

        {/* Lista de Chamados Recentes */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="text-6xl mb-6">📋</div>
            <h3 className="text-xl font-bold text-slate-800">Nenhum chamado ainda.</h3>
            <p className="text-slate-500 max-w-sm mx-auto">Os chamados aparecerão aqui assim que forem abertos pelos usuários ou solicitantes.</p>
        </div>
      </main>
    </div>
  )
}
