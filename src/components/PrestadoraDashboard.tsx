import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Info, 
  User, 
  Key, 
  LogOut, 
  Save, 
  MessageCircle, 
  Activity,
  Award,
  CalendarDays,
  Home,
  Users,
  Search,
  Plus,
  Trash2,
  TrendingUp,
  Settings,
  Shield,
  Menu,
  X,
  BookOpen,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { Residencia, Empresa, Planeamento, EstadoIntervencao, IntervencaoHistorico } from '../types';
import PlaneamentoManager from './PlaneamentoManager';

interface PrestadoraDashboardProps {
  empresa: Empresa;
  empresas: Empresa[];
  residencias: Residencia[];
  planeamentos: Planeamento[];
  historico: IntervencaoHistorico[];
  onUpdateResidenciaEstado: (
    resId: string, 
    tipo: 'Fumigação' | 'Manutenção ACS', 
    novoEstado: EstadoIntervencao, 
    obs: string,
    responsavelNome: string
  ) => void;
  onAddPlaneamento: (novo: Omit<Planeamento, 'id'>) => void;
  onUpdatePlaneamento: (atualizado: Planeamento) => void;
  onExcluirPlaneamento: (id: string) => void;
  onLogout: () => void;
}

export default function PrestadoraDashboard({
  empresa,
  empresas,
  residencias,
  planeamentos,
  historico,
  onUpdateResidenciaEstado,
  onAddPlaneamento,
  onUpdatePlaneamento,
  onExcluirPlaneamento,
  onLogout
}: PrestadoraDashboardProps) {
  // Controle de Abas Ativas do Prestador
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agenda' | 'planeamento' | 'residencias' | 'configuracoes'>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Controle de edição de password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

  // Pesquisa e filtros de residências
  const [searchQuery, setSearchQuery] = useState('');
  const [zonaFilter, setZonaFilter] = useState('');

  // Filtro de agenda do dia
  const [agendaFilter, setAgendaFilter] = useState<'todos' | 'pendentes' | 'concluidos' | 'problemas'>('todos');

  // Controle de formulário de atualização de visita
  const [updatingVisita, setUpdatingVisita] = useState<{
    residenciaId: string;
    resCodigo: string;
    resNome: string;
    tipo: 'Fumigação' | 'Manutenção ACS';
    estadoCorrente: EstadoIntervencao;
  } | null>(null);
  
  const [novoEstado, setNovoEstado] = useState<EstadoIntervencao>('Concluída');
  const [observacoes, setObservacoes] = useState('');

  // Sugestões predefinidas de comentários
  const SUGESTOES_OBS = {
    'Concluída': [
      'Serviço concluído com sucesso.',
      'Morador satisfeito. Sem anomalias.',
      'Limpeza geral realizada após intervenção.'
    ],
    'Em andamento': [
      'Iniciar trabalhos preventivos.',
      'A aguardar chegada do encarregado.',
      'Trabalho técnico preliminar iniciado.'
    ],
    'Não realizada': [
      'Morador ausente. Casa fechada.',
      'Necessário retorno: Morador solicitou reagendamento.',
      'Equipamento necessita substituição completa.',
      'Acesso obstruído por obras.'
    ],
    'Agendada': [
      'Visita confirmada previamente.',
      'Agendamento ordinário do plano.'
    ]
  };

  const dataHojeStr = '2026-06-22';
  
  // Filtrar planejamento da empresa
  const meusPlaneamentos = planeamentos.filter(p => p.empresaId === empresa.id);
  const planeamentosDeHoje = meusPlaneamentos.filter(p => p.data === dataHojeStr);

  // Criar uma lista de "tarefas" a fazer hoje
  const tarefasHoje: {
    residenciaId: string;
    resCodigo: string;
    nomeOcupante: string;
    telefone: string;
    bairro: string;
    endereco: string;
    tipo: 'Fumigação' | 'Manutenção ACS';
    estado: EstadoIntervencao;
    equipa: string;
    planeamentoId: string;
  }[] = [];

  planeamentosDeHoje.forEach(p => {
    p.residenciaIds.forEach(resId => {
      const res = residencias.find(r => r.id === resId);
      if (res) {
        tarefasHoje.push({
          residenciaId: res.id,
          resCodigo: res.codigo,
          nomeOcupante: res.nomeOcupante,
          telefone: res.telefonePrincipal,
          bairro: res.bairro,
          endereco: res.endereco,
          tipo: p.tipo,
          estado: p.tipo === 'Fumigação' ? res.estadoFumigacao : res.estadoACS,
          equipa: p.equipaResponsavel,
          planeamentoId: p.id
        });
      }
    });
  });

  // Filtrar tarefas da agenda com base no filtro selecionado
  const tarefasHojeFiltradas = tarefasHoje.filter(t => {
    if (agendaFilter === 'pendentes') return t.estado === 'Agendada' || t.estado === 'Em andamento';
    if (agendaFilter === 'concluidos') return t.estado === 'Concluída';
    if (agendaFilter === 'problemas') return t.estado === 'Não realizada';
    return true;
  });

  // Estatísticas da Prestadora
  const minhasCasasNoPainel = residencias.filter(r => r.empresaId === empresa.id);
  const totalMinhasCasas = minhasCasasNoPainel.length;
  const concluidasFum = minhasCasasNoPainel.filter(r => r.estadoFumigacao === 'Concluída').length;
  const concluidasACS = minhasCasasNoPainel.filter(r => r.estadoACS === 'Concluída').length;

  const percentFumigacao = totalMinhasCasas > 0 ? Math.round((concluidasFum / totalMinhasCasas) * 100) : 0;
  const percentACS = totalMinhasCasas > 0 ? Math.round((concluidasACS / totalMinhasCasas) * 100) : 0;
  const percentGeral = totalMinhasCasas > 0 
    ? Math.round(((concluidasFum + concluidasACS) / (totalMinhasCasas * 2)) * 100) 
    : 0;

  // Brigadas Ativas (Equipas únicas cadastradas no planejamento)
  const equipasAtivas = Array.from(new Set(meusPlaneamentos.map(p => p.equipaResponsavel))).filter(e => e.trim() !== '');

  // Atividades e Comentários recentes desta empresa
  const identificadorEmpresa = empresa.nome.split(' (')[0];
  const historicoEmpresa = historico
    .filter(h => h.utilizadorResponsavel.includes(empresa.contactoPrincipal) || h.utilizadorResponsavel.includes(identificadorEmpresa))
    .slice()
    .reverse()
    .slice(0, 5);

  const comentariosEmpresa = historico
    .filter(h => 
      (h.utilizadorResponsavel.includes(empresa.contactoPrincipal) || h.utilizadorResponsavel.includes(identificadorEmpresa)) && 
      h.observacoes && 
      h.observacoes.trim() !== '' &&
      !h.observacoes.startsWith('Residência registada') && 
      !h.observacoes.startsWith('Estado alterado') && 
      !h.observacoes.startsWith('Intervenção de')
    )
    .slice()
    .reverse()
    .slice(0, 4);

  // Lista de zonas das residências atribuídas (armazenado no campo bairro)
  const zonasDisponiveis = Array.from(new Set(minhasCasasNoPainel.map(r => r.bairro)));

  // Filtrar residências da prestadora
  const residenciasFiltradas = minhasCasasNoPainel.filter(r => {
    const correspondePesquisa = 
      r.nomeOcupante.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.endereco.toLowerCase().includes(searchQuery.toLowerCase());
    
    const correspondeZona = zonaFilter === '' || r.bairro === zonaFilter;
    
    return correspondePesquisa && correspondeZona;
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ text: '', type: '' });

    if (oldPassword !== empresa.passwordKey) {
      setPasswordMessage({ text: 'A palavra-passe actual está incorreta.', type: 'error' });
      return;
    }
    if (newPassword.length < 4) {
      setPasswordMessage({ text: 'A nova palavra-passe deve ter no mínimo 4 caracteres.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'As novas palavras-passe não coincidem.', type: 'error' });
      return;
    }

    // Atualizar no localStorage
    const empresasLS = localStorage.getItem('exofix_empresas');
    if (empresasLS) {
      const lista: Empresa[] = JSON.parse(empresasLS);
      const index = lista.findIndex((e) => e.id === empresa.id);
      if (index !== -1) {
        lista[index].passwordKey = newPassword;
        lista[index].isPasswordChanged = true;
        localStorage.setItem('exofix_empresas', JSON.stringify(lista));
        
        empresa.passwordKey = newPassword;
        empresa.isPasswordChanged = true;
      }
    }

    setPasswordMessage({ text: 'Palavra-passe pessoal alterada com sucesso!', type: 'success' });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => {
      setPasswordMessage({ text: '', type: '' });
    }, 3000);
  };

  const abrirPainelUpdate = (residenciaId: string, resCodigo: string, resNome: string, tipo: 'Fumigação' | 'Manutenção ACS', estadoCorrente: EstadoIntervencao) => {
    setUpdatingVisita({
      residenciaId,
      resCodigo,
      resNome,
      tipo,
      estadoCorrente
    });
    setNovoEstado(estadoCorrente);
    setObservacoes('');
  };

  const gravarAcaoVisita = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingVisita) return;

    onUpdateResidenciaEstado(
      updatingVisita.residenciaId,
      updatingVisita.tipo,
      novoEstado,
      observacoes.trim(),
      `${empresa.contactoPrincipal} (${identificadorEmpresa})`
    );

    setUpdatingVisita(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row text-slate-800 font-sans -mx-4 sm:-mx-8 -mt-4 sm:-mt-8" id="prestadora-root">
      
      {/* 1. SIDEBAR DE PRESTADORA */}
      <aside className={`w-full md:w-64 bg-[#0F172A] text-white shrink-0 flex flex-col justify-between p-6 space-y-6 md:min-h-screen border-r border-slate-800 transition-all ${
        mobileMenuOpen ? 'block' : 'hidden md:flex'
      }`} id="prestadora-sidebar">
        <div className="space-y-6">
          {/* Logo e Info */}
          <div className="border-b border-slate-800 pb-5 hidden md:block">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center font-bold text-lg text-white">
                E
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">EXOFIX</h1>
                <span className="text-[10px] text-teal-405 mt-1 uppercase tracking-widest block font-mono font-bold">Parceiro Operacional</span>
              </div>
            </div>
            
            <div className="text-xs text-slate-400 mt-4 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <span className="block text-white font-semibold text-xs truncate" title={empresa.nome}>{empresa.nome}</span>
              <span className="inline-flex items-center gap-1 text-[9px] text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded-full mt-1.5 border border-teal-800">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                Prestador Ativo
              </span>
            </div>
          </div>

          {/* Menu de Navegação */}
          <nav className="flex flex-col gap-2" id="prestadora-sidebar-nav">
            <button
              onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 p-3 text-sm font-semibold rounded-xl text-left transition-all ${
                activeTab === 'dashboard' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Building2 className="w-4.5 h-4.5" /> <span>Painel de Controle</span>
            </button>

            <button
              onClick={() => { setActiveTab('agenda'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 p-3 text-sm font-semibold rounded-xl text-left transition-all ${
                activeTab === 'agenda' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <CalendarDays className="w-4.5 h-4.5" /> <span>Minha Agenda</span>
            </button>

            <button
              onClick={() => { setActiveTab('planeamento'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 p-3 text-sm font-semibold rounded-xl text-left transition-all ${
                activeTab === 'planeamento' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Clock className="w-4.5 h-4.5" /> <span>Planeamento Técnico</span>
            </button>

            <button
              onClick={() => { setActiveTab('residencias'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 p-3 text-sm font-semibold rounded-xl text-left transition-all ${
                activeTab === 'residencias' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Home className="w-4.5 h-4.5" /> <span>Minhas Residências</span>
            </button>

            <button
              onClick={() => { setActiveTab('configuracoes'); setMobileMenuOpen(false); }}
              className={`flex items-center gap-3 p-3 text-sm font-semibold rounded-xl text-left transition-all ${
                activeTab === 'configuracoes' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-4.5 h-4.5" /> <span>Perfil e Segurança</span>
            </button>
          </nav>
        </div>

        {/* Rodapé do Menu */}
        <div className="pt-4 border-t border-slate-800 space-y-2 shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-900 hover:bg-rose-950/40 hover:text-rose-100 text-[12px] font-bold rounded-xl text-rose-400 border border-slate-800 transition"
          >
            <LogOut className="w-4 h-4" /> Encerra Sessão
          </button>
        </div>
      </aside>

      {/* HEADER MOBILE */}
      <div className="bg-[#0F172A] text-white p-4 flex items-center justify-between md:hidden shrink-0 border-b border-slate-800 w-full">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-teal-500 rounded flex items-center justify-center font-bold text-base text-white">
            E
          </div>
          <span className="font-bold text-sm tracking-wider uppercase text-white">{identificadorEmpresa}</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-350"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 2. CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8" id="prestadora-main-content">
        
        {/* Header Superior Desktop */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 mb-8 shrink-0">
          <h2 className="text-lg font-bold text-slate-800 font-sans">
            {activeTab === 'dashboard' && 'Painel de Controle'}
            {activeTab === 'agenda' && 'Minha Agenda de Visitas'}
            {activeTab === 'planeamento' && 'Planeamento Operacional'}
            {activeTab === 'residencias' && 'Minhas Residências Atribuídas'}
            {activeTab === 'configuracoes' && 'Configurações do Prestador'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right px-4 border-r border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Data de Hoje</p>
              <p className="text-sm font-bold text-slate-750">{dataHojeStr}</p>
            </div>
            <div className="text-xs font-bold text-teal-650 bg-teal-50 px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-teal-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              <span>Minhas Casas: {totalMinhasCasas}</span>
            </div>
          </div>
        </header>

        {/* RENDERIZAÇÃO DAS ABAS */}
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ABA 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6" id="prestadora-dashboard-view">
              
              {/* Banner de Boas-vindas */}
              <div className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4" id="welcome-banner">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 text-[10px] tracking-wider uppercase font-mono border border-teal-500/20 mb-3 font-bold">
                    <Activity className="w-3.5 h-3.5" /> Painel Geral da Prestadora
                  </div>
                  <h1 className="text-xl font-sans font-bold tracking-tight text-white">Olá, {empresa.contactoPrincipal}</h1>
                  <p className="text-slate-400 text-xs mt-1 max-w-xl">
                    Monitore a execução de fumigação e manutenção de ACS. Organize suas brigadas, planeje visitas e visualize o progresso do seu portfólio.
                  </p>
                </div>
                <div className="flex gap-2.5 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => setActiveTab('planeamento')}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                  >
                    Novo Planeamento
                  </button>
                  <button
                    onClick={() => setActiveTab('agenda')}
                    className="flex-1 md:flex-none px-4 py-2.5 bg-transparent text-slate-300 border border-slate-700 hover:bg-slate-800 rounded-xl text-xs font-bold transition"
                  >
                    Ver Agenda
                  </button>
                </div>
              </div>

              {/* Grid de KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="kpi-grid">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-505 text-xs block font-bold uppercase tracking-wider">Minhas Casas</span>
                    <span className="text-2xl font-bold font-sans text-slate-900 mt-1 block">{totalMinhasCasas}</span>
                    <span className="text-[10px] text-slate-450 font-medium mt-1 inline-block">Atribuídas no sistema</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-650 flex items-center justify-center shrink-0 border border-slate-100">
                    <Home className="w-5 h-5 text-slate-500" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-505 text-xs block font-bold uppercase tracking-wider">Fumigação OK</span>
                    <span className="text-2xl font-bold font-sans text-teal-650 mt-1 block">{percentFumigacao}%</span>
                    <span className="text-[10px] text-slate-450 font-medium mt-1 inline-block font-mono font-bold text-teal-605">{concluidasFum} / {totalMinhasCasas} Casas</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-505 text-xs block font-bold uppercase tracking-wider">ACS OK</span>
                    <span className="text-2xl font-bold font-sans text-indigo-600 mt-1 block">{percentACS}%</span>
                    <span className="text-[10px] text-slate-450 font-medium mt-1 inline-block font-mono font-bold text-indigo-650">{concluidasACS} / {totalMinhasCasas} Casas</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                    <Award className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-slate-505 text-xs block font-bold uppercase tracking-wider">Brigadas</span>
                    <span className="text-2xl font-bold font-sans text-slate-900 mt-1 block">{equipasAtivas.length}</span>
                    <span className="text-[10px] text-slate-450 font-medium mt-1 inline-block">Equipas ativas</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-650 flex items-center justify-center shrink-0 border border-slate-100">
                    <Users className="w-5 h-5 text-slate-500" />
                  </div>
                </div>
              </div>

              {/* Seção de Progresso Operacional Geral */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="progress-and-activities">
                
                {/* Colunas 1 & 2: Progresso e Metas */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Progresso Geral */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-sans font-bold text-slate-850">Taxa Geral de Cobertura</h3>
                        <p className="text-slate-400 text-xs">Média geral das vistorias completadas sob sua gestão</p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-teal-600" />
                    </div>

                    {/* Barra de Progresso Cumulativa */}
                    <div className="space-y-2">
                      <div className="flex items-end justify-between">
                        <span className="text-xs font-bold text-slate-650">Progresso Geral</span>
                        <span className="text-base font-extrabold text-slate-900">{percentGeral}%</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-500 to-teal-605 rounded-full transition-all duration-1000"
                          style={{ width: `${percentGeral}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Calculado com base em {concluidasFum + concluidasACS} intervenções concluídas de {totalMinhasCasas * 2} metas totais.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {/* Fumigação progress */}
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-655">Fumigação</span>
                          <span className="text-sm font-extrabold text-teal-600">{percentFumigacao}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-teal-500 rounded-full transition-all duration-1000"
                            style={{ width: `${percentFumigacao}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block">{concluidasFum} de {totalMinhasCasas} residências</span>
                      </div>

                      {/* ACS progress */}
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-655">Manutenção ACS</span>
                          <span className="text-sm font-extrabold text-indigo-600">{percentACS}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                            style={{ width: `${percentACS}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium block">{concluidasACS} de {totalMinhasCasas} aquecedores</span>
                      </div>
                    </div>
                  </div>

                  {/* Escala Geográfica */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-sm font-sans font-bold text-slate-850">Resumo Operacional por Zona</h3>
                        <p className="text-slate-400 text-xs">Visão da execução nas suas zonas de atendimento</p>
                      </div>
                      <MapPin className="w-4.5 h-4.5 text-slate-450" />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs text-slate-700" id="provider-zona-table">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                            <th className="py-2.5">Zona</th>
                            <th className="py-2.5 text-center">Fumigação OK</th>
                            <th className="py-2.5 text-center">ACS OK</th>
                            <th className="py-2.5 text-right">Total Casas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {zonasDisponiveis.map(zona => {
                            const casasZona = minhasCasasNoPainel.filter(r => r.bairro === zona);
                            const totalB = casasZona.length;
                            const fumB = casasZona.filter(r => r.estadoFumigacao === 'Concluída').length;
                            const acsB = casasZona.filter(r => r.estadoACS === 'Concluída').length;
                            
                            const fumP = Math.round((fumB / totalB) * 100);
                            const acsP = Math.round((acsB / totalB) * 100);

                            return (
                              <tr key={zona} className="hover:bg-slate-50/70 transition">
                                <td className="py-2.5 font-bold text-slate-800">{zona}</td>
                                <td className="py-2.5 text-center font-mono">
                                  <span className={`inline-flex items-center gap-1 ${fumP === 100 ? 'text-teal-600 font-bold' : 'text-slate-600'}`}>
                                    {fumB}/{totalB} <span className="text-[10px] text-slate-400">({fumP}%)</span>
                                  </span>
                                </td>
                                <td className="py-2.5 text-center font-mono">
                                  <span className={`inline-flex items-center gap-1 ${acsP === 100 ? 'text-indigo-600 font-bold' : 'text-slate-600'}`}>
                                    {acsB}/{totalB} <span className="text-[10px] text-slate-400">({acsP}%)</span>
                                  </span>
                                </td>
                                <td className="py-2.5 text-right font-mono font-bold text-slate-655">{totalB}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Coluna 3: Atividade e Diário da Empresa */}
                <div className="space-y-6">
                  
                  {/* Histórico Técnico */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-sans font-bold text-slate-850">Atividade Recente</h3>
                        <p className="text-slate-400 text-[11px]">Últimas intervenções da empresa</p>
                      </div>
                      <Activity className="w-4 h-4 text-teal-605" />
                    </div>

                    <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                      {historicoEmpresa.length === 0 ? (
                        <p className="text-slate-400 text-xs text-center py-4">Nenhuma atividade registrada.</p>
                      ) : (
                        historicoEmpresa.map((act) => {
                          let badgeColor = "bg-blue-50 text-blue-700 ring-blue-650/10";
                          if (act.estadoNovo === 'Concluída') badgeColor = "bg-green-50 text-green-700 ring-green-600/10";
                          if (act.estadoNovo === 'Em andamento') badgeColor = "bg-amber-50 text-amber-700 ring-amber-600/10";
                          if (act.estadoNovo === 'Não realizada') badgeColor = "bg-rose-50 text-rose-700 ring-rose-600/10";

                          return (
                            <div key={act.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0" id={`act-${act.id}`}>
                              <div className="flex items-center justify-between gap-1.5 mb-1">
                                <span className="font-bold text-slate-850">{act.residenciaCodigo} ({act.residenciaNome})</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ring-1 ring-inset ${badgeColor}`}>
                                  {act.estadoNovo}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] text-slate-500">
                                <span>{act.tipo} por <strong className="text-slate-655">{act.utilizadorResponsavel.split(' (')[0]}</strong></span>
                                <span className="font-mono text-[9px] text-slate-400">{act.dataHora.split(' ')[1]}</span>
                              </div>
                              {act.observacoes && (
                                <p className="mt-1 text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded italic border border-slate-100">
                                  "{act.observacoes}"
                                </p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Comentários */}
                  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-sans font-bold text-slate-850">Comentários Operacionais</h3>
                        <p className="text-slate-400 text-[11px]">Últimas notas de técnicos no terreno</p>
                      </div>
                      <MessageCircle className="w-4 h-4 text-slate-455" />
                    </div>

                    <div className="space-y-3">
                      {comentariosEmpresa.length === 0 ? (
                        <p className="text-slate-400 text-xs text-center py-4">Nenhuma observação recente.</p>
                      ) : (
                        comentariosEmpresa.map((com) => (
                          <div key={com.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-slate-805">{com.residenciaCodigo} - {com.tipo}</span>
                              <span className="text-slate-400 font-mono text-[9px]">{com.dataHora.split(' ')[0]}</span>
                            </div>
                            <p className="text-[11px] text-slate-650 italic">"{com.observacoes}"</p>
                            <div className="text-[9px] text-slate-400 text-right font-bold">— {com.utilizadorResponsavel.split(' (')[0]}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ABA 2: MINHA AGENDA (AGENDA DE HOJE) */}
          {activeTab === 'agenda' && (
            <div className="space-y-6" id="prestadora-agenda-view">
              
              {/* Header de Ações de Filtro */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-150 shadow-sm">
                <div>
                  <h3 className="font-sans font-bold text-base text-slate-800 flex items-center gap-1.5">
                    <CalendarDays className="w-5 h-5 text-teal-600" /> Agenda Operativa de Hoje
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">Brigadas e visitas agendadas para a data corrente ({dataHojeStr})</p>
                </div>

                <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
                  <button
                    onClick={() => setAgendaFilter('todos')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      agendaFilter === 'todos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Todos ({tarefasHoje.length})
                  </button>
                  <button
                    onClick={() => setAgendaFilter('pendentes')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      agendaFilter === 'pendentes' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Pendentes ({tarefasHoje.filter(t => t.estado === 'Agendada' || t.estado === 'Em andamento').length})
                  </button>
                  <button
                    onClick={() => setAgendaFilter('concluidos')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      agendaFilter === 'concluidos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Concluídos ({tarefasHoje.filter(t => t.estado === 'Concluída').length})
                  </button>
                  <button
                    onClick={() => setAgendaFilter('problemas')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                      agendaFilter === 'problemas' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Problemas ({tarefasHoje.filter(t => t.estado === 'Não realizada').length})
                  </button>
                </div>
              </div>

              {/* Form de Atualização de Visita */}
              {updatingVisita && (
                <div className="bg-white rounded-2xl p-6 border border-teal-500/20 shadow-md space-y-4 max-w-xl mx-auto animate-scale-in" id="box-visita-update">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] text-teal-650 bg-teal-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-teal-150">Atualizar Visita Técnica</span>
                      <h4 className="text-sm font-extrabold font-sans text-slate-900 mt-2">
                        {updatingVisita.resCodigo} — {updatingVisita.resNome}
                      </h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-bold uppercase tracking-wider">{updatingVisita.tipo}</span>
                    </div>
                    <button 
                      onClick={() => setUpdatingVisita(null)}
                      className="p-1 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-800"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={gravarAcaoVisita} className="space-y-4 text-xs font-semibold">
                    <div>
                      <label className="block text-slate-500 font-bold mb-2">Novo Estado da Intervenção *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setNovoEstado('Agendada')}
                          className={`py-2 px-2.5 rounded-xl border text-center font-bold font-sans transition-all text-xs flex items-center justify-center gap-1.5 ${
                            novoEstado === 'Agendada'
                              ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-blue-500" /> Agendada
                        </button>

                        <button
                          type="button"
                          onClick={() => setNovoEstado('Em andamento')}
                          className={`py-2 px-2.5 rounded-xl border text-center font-bold font-sans transition-all text-xs flex items-center justify-center gap-1.5 ${
                            novoEstado === 'Em andamento'
                              ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-500" /> Em andamento
                        </button>

                        <button
                          type="button"
                          onClick={() => setNovoEstado('Concluída')}
                          className={`py-2 px-2.5 rounded-xl border text-center font-bold font-sans transition-all text-xs flex items-center justify-center gap-1.5 ${
                            novoEstado === 'Concluída'
                              ? 'bg-green-50 border-green-300 text-green-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-green-600" /> Concluída
                        </button>

                        <button
                          type="button"
                          onClick={() => setNovoEstado('Não realizada')}
                          className={`py-2 px-2.5 rounded-xl border text-center font-bold font-sans transition-all text-xs flex items-center justify-center gap-1.5 ${
                            novoEstado === 'Não realizada'
                              ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-rose-600" /> Não realizada
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-slate-500 font-bold">Relatório / Observações de Campo</label>
                        <span className="text-[10px] text-slate-400 font-bold">Opcional</span>
                      </div>
                      
                      <textarea
                        rows={3}
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Insira detalhes sobre a visita..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-teal-500 resize-none font-semibold leading-normal text-slate-800"
                      />

                      {/* Sugestões de notas rápidas */}
                      <div className="mt-2 text-left space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">Notas Predefinidas Rápidas:</span>
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {SUGESTOES_OBS[novoEstado]?.map((sug, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setObservacoes(sug)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-colors text-left"
                            >
                              📌 {sug}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setUpdatingVisita(null)}
                        className="w-1/3 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-md flex justify-center items-center gap-1.5 bg-teal-650"
                      >
                        <Save className="w-3.5 h-3.5" /> Gravar Registro
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Grid de Tarefas */}
              {tarefasHojeFiltradas.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center space-y-2">
                  <Info className="w-10 h-10 text-slate-350" />
                  <p className="text-slate-500 font-bold text-sm">Nenhuma visita encontrada para o filtro atual.</p>
                  <p className="text-slate-400 text-xs text-center max-w-sm">
                    Tente selecionar outra categoria de filtro ou adicione novos planejamentos para o dia de hoje.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tarefasHojeFiltradas.map((tarefa, idx) => {
                    let badgeCor = "bg-blue-50 border-blue-200 text-blue-700";
                    let dotCor = "bg-blue-500";
                    if (tarefa.estado === 'Concluída') {
                      badgeCor = "bg-green-50 border-green-200 text-green-700";
                      dotCor = "bg-green-600";
                    } else if (tarefa.estado === 'Em andamento') {
                      badgeCor = "bg-amber-50 border-amber-250 text-amber-700";
                      dotCor = "bg-amber-500";
                    } else if (tarefa.estado === 'Não realizada') {
                      badgeCor = "bg-rose-50 border-rose-250 text-rose-700";
                      dotCor = "bg-rose-600";
                    } else if (tarefa.estado === 'Pendente') {
                      badgeCor = "bg-slate-50 border-slate-200 text-slate-700";
                      dotCor = "bg-slate-400";
                    } else if (tarefa.estado === 'Atrasada') {
                      badgeCor = "bg-rose-50 border-rose-300 text-rose-750 font-bold animate-pulse";
                      dotCor = "bg-rose-600";
                    }

                    return (
                      <div 
                        key={`${tarefa.residenciaId}-${tarefa.tipo}-${idx}`} 
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4 hover:shadow-md transition duration-150 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Cima: Código, Serviço, Estado */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-teal-700 text-xs">{tarefa.resCodigo}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border font-sans ${
                                tarefa.tipo === 'Fumigação' ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-indigo-50 text-indigo-700 border-indigo-150 border-indigo-200'
                              }`}>
                                {tarefa.tipo}
                              </span>
                            </div>
                            
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${badgeCor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotCor} animate-pulse`} />
                              <span>{tarefa.estado}</span>
                            </span>
                          </div>

                          {/* Meio: Ocupante, Brigada e Endereço */}
                          <div className="space-y-2 text-xs">
                            <h4 className="font-bold text-slate-900 font-sans text-sm">{tarefa.nomeOcupante}</h4>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-450" />
                              <span>Responsável: {tarefa.equipa}</span>
                            </div>
                            
                            <div className="flex items-start gap-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                              <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                              <span className="text-slate-655 text-[11px] leading-relaxed select-all">
                                ({tarefa.bairro}) {tarefa.endereco}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Baixo: Ações */}
                        <div className="flex items-center justify-between gap-2 border-t border-slate-50 pt-3.5 text-[11px] mt-2 shrink-0">
                          <a 
                            href={`tel:${tarefa.telefone}`}
                            className="inline-flex items-center justify-center gap-2 text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition font-mono font-bold"
                          >
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span>{tarefa.telefone}</span>
                          </a>

                          <button
                            onClick={() => abrirPainelUpdate(tarefa.residenciaId, tarefa.resCodigo, tarefa.nomeOcupante, tarefa.tipo, tarefa.estado)}
                            className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1 shadow-sm bg-teal-650"
                          >
                            <Activity className="w-3.5 h-3.5" />
                            <span>Atualizar</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          )}

          {/* ABA 3: PLANEAMENTO TÉCNICO */}
          {activeTab === 'planeamento' && (
            <div className="space-y-6" id="prestadora-planeamento-view">
              <PlaneamentoManager 
                planeamentos={planeamentos}
                residencias={residencias}
                empresas={empresas}
                currentRole="PRESTADORA"
                currentEmpresaId={empresa.id}
                onAddPlaneamento={onAddPlaneamento}
                onUpdatePlaneamento={onUpdatePlaneamento}
                onExcluirPlaneamento={onExcluirPlaneamento}
              />
            </div>
          )}

          {/* ABA 4: MINHAS RESIDÊNCIAS */}
          {activeTab === 'residencias' && (
            <div className="space-y-6" id="prestadora-residencias-view">
              
              {/* Barra de Filtros e Busca */}
              <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="w-full md:w-96 relative">
                  <input
                    type="text"
                    placeholder="Pesquisar por morador, código ou endereço..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-teal-500 leading-normal"
                  />
                  <Search className="w-4 h-4 text-slate-405 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="w-full md:w-auto flex flex-wrap gap-2.5 items-center">
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-bold mr-1 uppercase tracking-wider">
                    <Filter className="w-3.5 h-3.5" /> Filtrar:
                  </div>

                  <select
                    value={zonaFilter}
                    onChange={(e) => setZonaFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="">Todas as Zonas</option>
                    {zonasDisponiveis.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>

                  <span className="text-[11px] font-bold text-slate-450 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl font-mono">
                    {residenciasFiltradas.length} Encontradas
                  </span>
                </div>
              </div>

              {/* Form de Atualização Rápida no painel de residências */}
              {updatingVisita && (
                <div className="bg-white rounded-2xl p-6 border border-teal-500/20 shadow-md space-y-4 max-w-xl mx-auto animate-scale-in" id="box-residencia-direct-update">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] text-teal-655 bg-teal-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-teal-150">Atualizar Estado Direto</span>
                      <h4 className="text-sm font-extrabold font-sans text-slate-900 mt-2">
                        {updatingVisita.resCodigo} — {updatingVisita.resNome}
                      </h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5 font-bold uppercase tracking-wider">{updatingVisita.tipo}</span>
                    </div>
                    <button 
                      onClick={() => setUpdatingVisita(null)}
                      className="p-1 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-800"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={gravarAcaoVisita} className="space-y-4 text-xs font-semibold">
                    <div>
                      <label className="block text-slate-505 font-bold mb-2">Novo Estado da Intervenção *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                          type="button"
                          onClick={() => setNovoEstado('Agendada')}
                          className={`py-2 px-2.5 rounded-xl border text-center font-bold font-sans transition-all text-xs flex items-center justify-center gap-1.5 ${
                            novoEstado === 'Agendada'
                              ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-blue-500" /> Agendada
                        </button>

                        <button
                          type="button"
                          onClick={() => setNovoEstado('Em andamento')}
                          className={`py-2 px-2.5 rounded-xl border text-center font-bold font-sans transition-all text-xs flex items-center justify-center gap-1.5 ${
                            novoEstado === 'Em andamento'
                              ? 'bg-amber-50 border-amber-300 text-amber-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-amber-500" /> Em andamento
                        </button>

                        <button
                          type="button"
                          onClick={() => setNovoEstado('Concluída')}
                          className={`py-2 px-2.5 rounded-xl border text-center font-bold font-sans transition-all text-xs flex items-center justify-center gap-1.5 ${
                            novoEstado === 'Concluída'
                              ? 'bg-green-50 border-green-300 text-green-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-green-600" /> Concluída
                        </button>

                        <button
                          type="button"
                          onClick={() => setNovoEstado('Não realizada')}
                          className={`py-2 px-2.5 rounded-xl border text-center font-bold font-sans transition-all text-xs flex items-center justify-center gap-1.5 ${
                            novoEstado === 'Não realizada'
                              ? 'bg-rose-50 border-rose-300 text-rose-700 font-bold'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-rose-600" /> Não realizada
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-slate-505 font-bold">Notas de Execução</label>
                        <span className="text-[10px] text-slate-400 font-bold">Opcional</span>
                      </div>
                      <textarea
                        rows={3}
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Insira detalhes adicionais sobre o estado..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-teal-500 resize-none font-semibold leading-normal text-slate-800"
                      />
                    </div>

                    <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setUpdatingVisita(null)}
                        className="w-1/3 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-655 font-bold rounded-xl text-xs transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition shadow-md flex justify-center items-center gap-1.5 bg-teal-650"
                      >
                        <Save className="w-3.5 h-3.5" /> Confirmar Estado
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tabela de Residências */}
              {residenciasFiltradas.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-sm text-center">
                  <p className="text-slate-500 italic text-xs">Nenhuma residência corresponde aos termos de pesquisa.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden" id="provider-residences-table-wrapper">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs text-slate-700">
                      <thead>
                        <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                          <th className="p-4">Código</th>
                          <th className="p-4">Ocupante / Telefone</th>
                          <th className="p-4">Zona / Endereço</th>
                          <th className="p-4 text-center">Fumigação</th>
                          <th className="p-4 text-center">Manutenção ACS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-semibold">
                        {residenciasFiltradas.map((res) => {
                          let colorFum = "bg-slate-50 text-slate-700 border-slate-200";
                          if (res.estadoFumigacao === 'Concluída') colorFum = "bg-green-50 text-green-700 border-green-200";
                          if (res.estadoFumigacao === 'Em andamento') colorFum = "bg-amber-50 text-amber-700 border-amber-200";
                          if (res.estadoFumigacao === 'Não realizada') colorFum = "bg-rose-50 text-rose-700 border-rose-200";
                          if (res.estadoFumigacao === 'Agendada') colorFum = "bg-blue-50 text-blue-700 border-blue-200";
                          if (res.estadoFumigacao === 'Atrasada') colorFum = "bg-rose-50 text-rose-750 border-rose-300 font-bold animate-pulse";

                          let colorACS = "bg-slate-50 text-slate-700 border-slate-200";
                          if (res.estadoACS === 'Concluída') colorACS = "bg-green-50 text-green-700 border-green-200";
                          if (res.estadoACS === 'Em andamento') colorACS = "bg-amber-50 text-amber-700 border-amber-200";
                          if (res.estadoACS === 'Não realizada') colorACS = "bg-rose-50 text-rose-700 border-rose-200";
                          if (res.estadoACS === 'Agendada') colorACS = "bg-blue-50 text-blue-700 border-blue-200";
                          if (res.estadoACS === 'Atrasada') colorACS = "bg-rose-50 text-rose-750 border-rose-300 font-bold animate-pulse";

                          return (
                            <tr key={res.id} className="hover:bg-slate-50/50 transition">
                              <td className="p-4 font-mono font-bold text-teal-700 align-middle">{res.codigo}</td>
                              <td className="p-4 align-middle">
                                <div className="font-bold text-slate-900 text-sm leading-tight">{res.nomeOcupante}</div>
                                <a href={`tel:${res.telefonePrincipal}`} className="text-slate-405 font-mono text-[10px] hover:text-teal-650 transition-colors mt-0.5 inline-block">{res.telefonePrincipal}</a>
                              </td>
                              <td className="p-4 align-middle">
                                <div className="font-bold text-slate-800">{res.bairro}</div>
                                <div className="text-slate-500 text-[10px] mt-0.5 truncate max-w-[250px]" title={res.endereco}>{res.endereco}</div>
                              </td>
                              <td className="p-4 text-center align-middle">
                                <button
                                  onClick={() => abrirPainelUpdate(res.id, res.codigo, res.nomeOcupante, 'Fumigação', res.estadoFumigacao)}
                                  className={`px-3 py-1.5 rounded-full border text-[11px] font-bold hover:-translate-y-0.5 transition shadow-sm hover:shadow active:translate-y-0 inline-flex items-center gap-1.5 ${colorFum}`}
                                  title="Clique para alterar o estado da Fumigação"
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    res.estadoFumigacao === 'Concluída' ? 'bg-green-600' :
                                    res.estadoFumigacao === 'Em andamento' ? 'bg-amber-500' :
                                    res.estadoFumigacao === 'Não realizada' ? 'bg-rose-600' :
                                    res.estadoFumigacao === 'Agendada' ? 'bg-blue-500' :
                                    res.estadoFumigacao === 'Atrasada' ? 'bg-rose-600' : 'bg-slate-400'
                                  }`} />
                                  {res.estadoFumigacao}
                                </button>
                                {res.ultimaFumigacao !== 'Nenhuma' && (
                                  <span className="block text-[9px] text-slate-400 font-mono mt-1 font-semibold">Última: {res.ultimaFumigacao}</span>
                                )}
                              </td>
                              <td className="p-4 text-center align-middle">
                                <button
                                  onClick={() => abrirPainelUpdate(res.id, res.codigo, res.nomeOcupante, 'Manutenção ACS', res.estadoACS)}
                                  className={`px-3 py-1.5 rounded-full border text-[11px] font-bold hover:-translate-y-0.5 transition shadow-sm hover:shadow active:translate-y-0 inline-flex items-center gap-1.5 ${colorACS}`}
                                  title="Clique para alterar o estado da Manutenção ACS"
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    res.estadoACS === 'Concluída' ? 'bg-green-600' :
                                    res.estadoACS === 'Em andamento' ? 'bg-amber-500' :
                                    res.estadoACS === 'Não realizada' ? 'bg-rose-600' :
                                    res.estadoACS === 'Agendada' ? 'bg-blue-500' :
                                    res.estadoACS === 'Atrasada' ? 'bg-rose-600' : 'bg-slate-400'
                                  }`} />
                                  {res.estadoACS}
                                </button>
                                {res.ultimaACS !== 'Nenhuma' && (
                                  <span className="block text-[9px] text-slate-400 font-mono mt-1 font-semibold">Última: {res.ultimaACS}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ABA 5: CONFIGURAÇÕES E PERFIL */}
          {activeTab === 'configuracoes' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="prestadora-configuracoes-view">
              
              {/* Informações da Empresa */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                  <Building2 className="w-5 h-5 text-teal-650" />
                  <h3 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wider">Perfil do Parceiro Operacional</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-semibold">
                  <div>
                    <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Nome Institucional</span>
                    <span className="block text-slate-800 text-sm font-bold bg-slate-50 border border-slate-100 p-3 rounded-xl">{empresa.nome}</span>
                  </div>

                  <div>
                    <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Número de Identificação (NUIT)</span>
                    <span className="block text-slate-800 text-sm font-bold bg-slate-50 border border-slate-100 p-3 rounded-xl font-mono">{empresa.nuit}</span>
                  </div>

                  <div>
                    <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Contacto Principal / Representante</span>
                    <span className="block text-slate-800 text-sm font-bold bg-slate-50 border border-slate-100 p-3 rounded-xl">{empresa.contactoPrincipal}</span>
                  </div>

                  <div>
                    <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Telefone Principal</span>
                    <span className="block text-slate-800 text-sm font-bold bg-slate-50 border border-slate-100 p-3 rounded-xl font-mono">{empresa.telefone}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">E-mail Operacional</span>
                    <span className="block text-slate-800 text-sm font-bold bg-slate-50 border border-slate-100 p-3 rounded-xl">{empresa.email}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Endereço Operativo</span>
                    <span className="block text-slate-800 text-sm font-bold bg-slate-50 border border-slate-100 p-3 rounded-xl leading-relaxed">{empresa.endereco}</span>
                  </div>
                </div>
              </div>

              {/* Alterar Palavra-passe */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4 h-fit">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Key className="w-4.5 h-4.5 text-teal-650" />
                  <h3 className="font-sans font-bold text-xs text-slate-805 uppercase tracking-wider">Alterar Palavra-passe</h3>
                </div>

                {passwordMessage.text && (
                  <div className={`p-3.5 rounded-xl text-xs font-bold border ${
                    passwordMessage.type === 'success' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {passwordMessage.text}
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-505 font-bold mb-1.5">Palavra-passe Anterior</label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-505 font-bold mb-1.5">Nova Palavra-passe</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                      placeholder="Mínimo 4 caracteres"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-505 font-bold mb-1.5">Confirmar Nova Palavra-passe</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-teal-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-3 bg-teal-650 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition flex justify-center items-center gap-1.5 bg-teal-600 shadow-md"
                  >
                    <Save className="w-3.5 h-3.5" /> Atualizar Credenciais
                  </button>
                </form>
              </div>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}
