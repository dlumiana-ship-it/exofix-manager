export type UserRole = 'ADMIN_EXOFIX' | 'PRESTADORA';

export type EstadoIntervencao = 'Agendada' | 'Em andamento' | 'Concluída' | 'Não realizada';

export interface Residencia {
  id: string;
  codigo: string;
  nomeOcupante: string;
  telefonePrincipal: string;
  telefoneAlternativo: string;
  bairro: string;
  endereco: string;
  observacoesGerais: string;
  estadoFumigacao: EstadoIntervencao;
  estadoACS: EstadoIntervencao;
  ultimaFumigacao: string; // YYYY-MM-DD ou "Nenhuma"
  ultimaACS: string;        // YYYY-MM-DD ou "Nenhuma"
  empresaId: string;       // ID da empresa prestadora atribuída
}

export interface Empresa {
  id: string;
  nome: string;
  nuit: string; // Número Único de Identificação Tributária
  contactoPrincipal: string;
  telefone: string;
  email: string;
  endereco: string;
  username: string;
  passwordKey: string; // Palavra-passe temporária/alterada
  ativa: boolean;
  isPasswordChanged?: boolean; // Se já alterou a palavra-passe no primeiro acesso
}

export interface IntervencaoHistorico {
  id: string;
  residenciaId: string;
  residenciaCodigo: string;
  residenciaNome: string;
  tipo: 'Fumigação' | 'Manutenção ACS';
  dataHora: string; // Registo automático: YYYY-MM-DD HH:mm:ss
  estadoAnterior: EstadoIntervencao | 'Sem registo';
  estadoNovo: EstadoIntervencao;
  observacoes: string;
  utilizadorResponsavel: string; // Nome do utilizador/empresa que fez a atualização
}

export interface Planeamento {
  id: string;
  tipo: 'Fumigação' | 'Manutenção ACS';
  data: string; // YYYY-MM-DD
  residenciaIds: string[]; // Residências selecionadas para este planeamento
  equipaResponsavel: string; // Nome ou código de identificação da equipa técnica
  empresaId: string; // Empresa prestadora responsável por executar
  observacoes: string;
}
