export type Perfil = 'usuario' | 'asg' | 'lider' | 'admin'

export interface Profile {
  id: string
  nome: string
  email: string
  perfil: Perfil
  ativo: boolean
  created_at: string
}

export interface Chamado {
  id: string
  codigo: string
  titulo: string
  descricao?: string
  andar: 'terreo' | '1' | '2' | '3'
  status: 'novo' | 'delegado' | 'em_execucao' | 'a_verificar' | 'concluido' | 'recusado'
  prioridade: boolean
  foto_abertura?: string
  foto_conclusao?: string
  solicitante_id: string
  asg_id?: string
  lider_id?: string
  motivo_recusa?: string
  created_at: string
  delegado_at?: string
  concluido_at?: string
  sla_minutos?: number
  solicitante?: Profile
  asg?: Profile
}

export interface Comentario {
  id: string
  chamado_id: string
  autor_id: string
  texto: string
  interno: boolean
  created_at: string
  autor?: Profile
}
