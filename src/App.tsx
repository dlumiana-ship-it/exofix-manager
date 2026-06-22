import { useState, useEffect } from 'react';
import { 
  Shield, 
  Building2, 
  LogOut, 
  RotateCcw, 
  LayoutDashboard, 
  Building, 
  CalendarDays, 
  FileText, 
  Users, 
  Lock, 
  Settings,
  Menu,
  X,
  Sparkles
} from 'lucide-react';

import { Residencia, Empresa, Planeamento, IntervencaoHistorico, EstadoIntervencao } from './types';
import { obterDadosIniciais, salvarDados, resetarDados, sincronizarEstadosResidencias } from './data';

import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import ResidenciasManager from './components/ResidenciasManager';
import EmpresasManager from './components/EmpresasManager';
import PlaneamentoManager from './components/PlaneamentoManager';
import PrestadoraDashboard from './components/PrestadoraDashboard';
import RelatoriosView from './components/RelatoriosView';

export default function App() {
  // 1. Estados Gerais Autenticação
  const [currentUser, setCurrentUser] = useState<{
    role: 'ADMIN_EXOFIX' | 'PRESTADORA';
    id?: string;
    nome: string;
  } | null>(null);

  // 2. Estados da Base de Dados
  const [residencias, setResidencias] = useState<Residencia[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [planeamentos, setPlaneamentos] = useState<Planeamento[]>([]);
  const [historico, setHistorico] = useState<IntervencaoHistorico[]>([]);

  // 3. Tabativa para Administrador Exofix
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  
  // Controle de menu responsivo
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Inicializar dados e registrar o EventSource de Sincronização em Tempo Real
  useEffect(() => {
    // Restaurar sessão se houver
    const userLS = localStorage.getItem('exofix_user');
    if (userLS) {
      setCurrentUser(JSON.parse(userLS));
    }

    // Carregar dados iniciais do servidor
    async function loadServerData() {
      try {
        const res = await fetch('/api/data');
        if (!res.ok) throw new Error('Servidor indisponível');
        const data = await res.json();

        if (data.initialized === false) {
          // Servidor limpo: gerar semente padrão (casas reais, nenhuma empresa)
          const dadosIniciais = obterDadosIniciais();
          const resSincronizadas = sincronizarEstadosResidencias(dadosIniciais.residencias, dadosIniciais.planeamentos);
          
          const payload = {
            initialized: true,
            residencias: resSincronizadas,
            empresas: dadosIniciais.empresas,
            planeamentos: dadosIniciais.planeamentos,
            historico: dadosIniciais.historico
          };

          // Gravar no servidor
          await fetch('/api/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          setResidencias(resSincronizadas);
          setEmpresas(dadosIniciais.empresas);
          setPlaneamentos(dadosIniciais.planeamentos);
          setHistorico(dadosIniciais.historico);
          salvarDados(payload);
        } else {
          // Servidor possui dados guardados, ler e atualizar
          const resSincronizadas = sincronizarEstadosResidencias(data.residencias, data.planeamentos);
          setResidencias(resSincronizadas);
          setEmpresas(data.empresas);
          setPlaneamentos(data.planeamentos);
          setHistorico(data.historico);
          salvarDados({
            residencias: resSincronizadas,
            empresas: data.empresas,
            planeamentos: data.planeamentos,
            historico: data.historico
          });
        }
      } catch (err) {
        console.warn('Erro ao ligar ao servidor de sincronização. Usando cache local:', err);
        // Fallback local
        const dados = obterDadosIniciais();
        const resSincronizadas = sincronizarEstadosResidencias(dados.residencias, dados.planeamentos);
        setResidencias(resSincronizadas);
        setEmpresas(dados.empresas);
        setPlaneamentos(dados.planeamentos);
        setHistorico(dados.historico);
      }
    }

    loadServerData();

    // Conectar ao canal de sincronização em tempo real (SSE)
    const eventSource = new EventSource('/api/sync');

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.residencias) {
          const resSincronizadas = sincronizarEstadosResidencias(data.residencias, data.planeamentos);
          setResidencias(resSincronizadas);
          setEmpresas(data.empresas);
          setPlaneamentos(data.planeamentos);
          setHistorico(data.historico);
          salvarDados({
            residencias: resSincronizadas,
            empresas: data.empresas,
            planeamentos: data.planeamentos,
            historico: data.historico
          });
        }
      } catch (err) {
        console.error('Erro ao ler atualização em tempo real:', err);
      }
    };

    eventSource.onerror = () => {
      console.warn('Conexão em tempo real suspensa. Tentando reconectar...');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Sincronizar qualquer alteração local com o servidor e local cache
  const sincronizarBaseDeDados = (
    novasRes: Residencia[],
    novasEmp: Empresa[],
    novosPlan: Planeamento[],
    novoHist: IntervencaoHistorico[]
  ) => {
    const resSincronizadas = sincronizarEstadosResidencias(novasRes, novosPlan);
    
    // Atualizar localmente imediato (Optimistic UI)
    setResidencias(resSincronizadas);
    setEmpresas(novasEmp);
    setPlaneamentos(novosPlan);
    setHistorico(novoHist);
    salvarDados({
      residencias: resSincronizadas,
      empresas: novasEmp,
      planeamentos: novosPlan,
      historico: novoHist
    });

    // Enviar ao servidor em segundo plano para propagação em tempo real
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        initialized: true,
        residencias: resSincronizadas,
        empresas: novasEmp,
        planeamentos: novosPlan,
        historico: novoHist
      })
    }).catch(err => {
      console.error('Falha ao sincronizar dados com o servidor central:', err);
    });
  };

  // Funções Autenticação e Sair
  const handleLoginSuccess = (
    role: 'ADMIN_EXOFIX' | 'PRESTADORA', 
    details: { id?: string; nome: string }
  ) => {
    const user = { role, id: details.id, nome: details.nome };
    setCurrentUser(user);
    localStorage.setItem('exofix_user', JSON.stringify(user));
    setAdminTab('dashboard'); // Default tab on login
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('exofix_user');
    setMobileMenuOpen(false);
  };

  // Reset Geral do Sistema (Zerar dados e restaurar as 38 residências originais)
  const handleReset = () => {
    if (confirm('Deseja repor a base de dados operacional ao estado original? Todos os novos cadastros e mudanças locais serão substituídos.')) {
      const dados = resetarDados();
      sincronizarBaseDeDados(dados.residencias, dados.empresas, dados.planeamentos, dados.historico);
      setCurrentUser(null);
      setAdminTab('dashboard');
      alert('A base de dados do Exofix Manager foi restaurada com sucesso.');
    }
  };

  // Atribuição de casas em lote para uma empresa prestadora
  const handleBatchAssignResidencias = (empId: string, resIds: string[]) => {
    const novasRes = residencias.map(r => {
      if (resIds.includes(r.id)) {
        return { ...r, empresaId: empId };
      } else if (r.empresaId === empId) {
        return { ...r, empresaId: '' };
      }
      return r;
    });
    sincronizarBaseDeDados(novasRes, empresas, planeamentos, historico);
  };

  // --- CRUD RESIDÊNCIAS ---
  const handleAddResidencia = (nova: Omit<Residencia, 'id' | 'codigo'>) => {
    const proximoNum = residencias.length + 1;
    const codigo = `EXO-${100 + proximoNum}`;
    const id = `RES-${String(proximoNum).padStart(3, '0')}`;
    
    const novaResidencia: Residencia = {
      ...nova,
      id,
      codigo,
    };

    const novasRes = [...residencias, novaResidencia];
    
    // Registar acção na auditoria
    const timestamp = obterDataHoraAtualString();
    const novaAcao: IntervencaoHistorico = {
      id: `HIST-${String(historico.length + 1).padStart(3, '0')}`,
      residenciaId: id,
      residenciaCodigo: codigo,
      residenciaNome: nova.nomeOcupante,
      tipo: 'Fumigação',
      dataHora: timestamp,
      estadoAnterior: 'Sem registo',
      estadoNovo: nova.estadoFumigacao,
      observacoes: 'Residência registada no sistema sob plano de controlo.',
      utilizadorResponsavel: currentUser?.nome || 'Exofix Admin',
    };

    const novoHist = [...historico, novaAcao];
    sincronizarBaseDeDados(novasRes, empresas, planeamentos, novoHist);
  };

  const handleUpdateResidencia = (atualizada: Residencia) => {
    const antigra = residencias.find(r => r.id === atualizada.id);
    const novasRes = residencias.map(r => r.id === atualizada.id ? atualizada : r);
    
    let novoHist = [...historico];
    const timestamp = obterDataHoraAtualString();

    // Registar histórico se houve alteração de estados
    if (antigra) {
      if (antigra.estadoFumigacao !== atualizada.estadoFumigacao) {
        novoHist.push({
          id: `HIST-M${Date.now()}`,
          residenciaId: atualizada.id,
          residenciaCodigo: atualizada.codigo,
          residenciaNome: atualizada.nomeOcupante,
          tipo: 'Fumigação',
          dataHora: timestamp,
          estadoAnterior: antigra.estadoFumigacao,
          estadoNovo: atualizada.estadoFumigacao,
          observacoes: `Estado alterado manualmente para ${atualizada.estadoFumigacao} via administração Exofix.`,
          utilizadorResponsavel: currentUser?.nome || 'Exofix Admin',
        });
      }
      if (antigra.estadoACS !== atualizada.estadoACS) {
        novoHist.push({
          id: `HIST-H${Date.now()}`,
          residenciaId: atualizada.id,
          residenciaCodigo: atualizada.codigo,
          residenciaNome: atualizada.nomeOcupante,
          tipo: 'Manutenção ACS',
          dataHora: timestamp,
          estadoAnterior: antigra.estadoACS,
          estadoNovo: atualizada.estadoACS,
          observacoes: `Estado alterado manualmente para ${atualizada.estadoACS} via administração Exofix.`,
          utilizadorResponsavel: currentUser?.nome || 'Exofix Admin',
        });
      }
    }

    sincronizarBaseDeDados(novasRes, empresas, planeamentos, novoHist);
  };

  const handleExcluirResidencia = (id: string) => {
    const novasRes = residencias.filter(r => r.id !== id);
    // Também anular dos planejamentos para consistência
    const novosPlan = planeamentos.map(p => ({
      ...p,
      residenciaIds: p.residenciaIds.filter(rid => rid !== id)
    })).filter(p => p.residenciaIds.length > 0);

    sincronizarBaseDeDados(novasRes, empresas, novosPlan, historico);
  };


  // --- CRUD EMPRESAS PRESTADORAS ---
  const handleAddEmpresa = (nova: Omit<Empresa, 'id'>) => {
    const proximoNum = empresas.length + 1;
    const id = `EMP-00${proximoNum}`;

    const novaEmpresa: Empresa = {
      ...nova,
      id,
    };

    const novasEmp = [...empresas, novaEmpresa];
    sincronizarBaseDeDados(residencias, novasEmp, planeamentos, historico);
  };

  const handleUpdateEmpresa = (atualizada: Empresa) => {
    const novasEmp = empresas.map(e => e.id === atualizada.id ? atualizada : e);
    sincronizarBaseDeDados(residencias, novasEmp, planeamentos, historico);
  };

  const handleExcluirEmpresa = (id: string) => {
    const novasEmp = empresas.filter(e => e.id !== id);
    // Desvincular residências que estavam atribuídas a esta empresa
    const novasRes = residencias.map(r => r.empresaId === id ? { ...r, empresaId: '' } : r);
    // Remover planejamentos criados por esta empresa
    const novosPlan = planeamentos.filter(p => p.empresaId !== id);

    sincronizarBaseDeDados(novasRes, novasEmp, novosPlan, historico);
  };


  // --- PLANEAMENTO OPERACIONAL ---
  const handleAddPlaneamento = (novo: Omit<Planeamento, 'id'>) => {
    const id = `PLAN-${String(planeamentos.length + 1).padStart(3, '0')}`;
    const novoPlan: Planeamento = {
      ...novo,
      id,
    };

    const novosPlan = [...planeamentos, novoPlan];
    
    // Atualizar estado das residências envolvidas no plano de serviços para 'Agendada'
    const novasRes = residencias.map(r => {
      if (novo.residenciaIds.includes(r.id)) {
        return {
          ...r,
          estadoFumigacao: novo.tipo === 'Fumigação' ? 'Agendada' as const : r.estadoFumigacao,
          estadoACS: novo.tipo === 'Manutenção ACS' ? 'Agendada' as const : r.estadoACS,
        };
      }
      return r;
    });

    // Registar acções para auditoria
    const timestamp = obterDataHoraAtualString();
    const novosLogsHist: IntervencaoHistorico[] = [...historico];

    novo.residenciaIds.forEach((resId, index) => {
      const resNome = residencias.find(r => r.id === resId);
      novosLogsHist.push({
        id: `HIST-PL-${id}-${index}`,
        residenciaId: resId,
        residenciaCodigo: resNome?.codigo || 'EXO-X',
        residenciaNome: resNome?.nomeOcupante || 'Interno',
        tipo: novo.tipo,
        dataHora: timestamp,
        estadoAnterior: novo.tipo === 'Fumigação' ? (resNome?.estadoFumigacao || 'Agendada') : (resNome?.estadoACS || 'Agendada'),
        estadoNovo: 'Agendada',
        observacoes: `Intervenção de ${novo.tipo} agendada para ${novo.data}. Brigada técnica responsável: ${novo.equipaResponsavel}.`,
        utilizadorResponsavel: currentUser?.nome || 'Exofix Admin',
      });
    });

    sincronizarBaseDeDados(novasRes, empresas, novosPlan, novosLogsHist);
  };

  const handleExcluirPlaneamento = (id: string) => {
    const plane = planeamentos.find(p => p.id === id);
    const novosPlan = planeamentos.filter(p => p.id !== id);
    
    sincronizarBaseDeDados(residencias, empresas, novosPlan, historico);
  };

  const handleUpdatePlaneamento = (atualizado: Planeamento) => {
    const novosPlan = planeamentos.map(p => p.id === atualizado.id ? atualizado : p);
    
    const novasRes = residencias.map(r => {
      if (atualizado.residenciaIds.includes(r.id)) {
        return {
          ...r,
          estadoFumigacao: atualizado.tipo === 'Fumigação' && r.estadoFumigacao === 'Concluída' ? 'Concluída' as const : 
                           atualizado.tipo === 'Fumigação' ? 'Agendada' as const : r.estadoFumigacao,
          estadoACS: atualizado.tipo === 'Manutenção ACS' && r.estadoACS === 'Concluída' ? 'Concluída' as const : 
                     atualizado.tipo === 'Manutenção ACS' ? 'Agendada' as const : r.estadoACS,
        };
      }
      return r;
    });

    sincronizarBaseDeDados(novasRes, empresas, novosPlan, historico);
  };


  // --- ATUALIZAÇÃO REATIVA DE CAMPO POR PARTE DA PRESTADORA ---
  const handleUpdateResidenciaEstado = (
    resId: string, 
    tipo: 'Fumigação' | 'Manutenção ACS', 
    novoEstado: EstadoIntervencao, 
    obs: string,
    responsavelNome: string
  ) => {
    const aResidir = residencias.find(r => r.id === resId);
    if (!aResidir) return;

    const dataHojeYYYYMMDD = '2026-06-22'; // Fixed system context date

    const estadoAnterior = tipo === 'Fumigação' ? aResidir.estadoFumigacao : aResidir.estadoACS;

    // Atualizar estados da residência
    const novasRes = residencias.map(r => {
      if (r.id === resId) {
        return {
          ...r,
          estadoFumigacao: tipo === 'Fumigação' ? novoEstado : r.estadoFumigacao,
          estadoACS: tipo === 'Manutenção ACS' ? novoEstado : r.estadoACS,
          ultimaFumigacao: tipo === 'Fumigação' && novoEstado === 'Concluída' ? dataHojeYYYYMMDD : r.ultimaFumigacao,
          ultimaACS: tipo === 'Manutenção ACS' && novoEstado === 'Concluída' ? dataHojeYYYYMMDD : r.ultimaACS,
        };
      }
      return r;
    });

    // Registar automaticamente na linha de tempo histórica
    const timestamp = obterDataHoraAtualString();
    const novoRegisto: IntervencaoHistorico = {
      id: `HIST-RE-${Date.now()}`,
      residenciaId: resId,
      residenciaCodigo: aResidir.codigo,
      residenciaNome: aResidir.nomeOcupante,
      tipo,
      dataHora: timestamp,
      estadoAnterior,
      estadoNovo: novoEstado,
      observacoes: obs || `Intervenção atualizada com sucesso pelo prestador responsável.`,
      utilizadorResponsavel: responsavelNome,
    };

    const novoHist = [...historico, novoRegisto];
    sincronizarBaseDeDados(novasRes, empresas, planeamentos, novoHist);
  };

  // Helper de Data & Hora para registos profissionais no terreno
  const obterDataHoraAtualString = () => {
    // Retorna YYYY-MM-DD HH:MM:SS
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  // Se o utilizador não estiver autenticado, apresentar ecrã de login
  if (!currentUser) {
    return (
      <LoginForm 
        empresas={empresas} 
        onLoginSuccess={handleLoginSuccess} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex flex-col md:flex-row text-[#1F2937] font-sans" id="app-canvas-container">
      
      {/* 1. SIDEBAR (PERFIL ADMINISTRADOR) OU HEADER MÓVEL (PERFIL PRESTADOR) */}
      {currentUser.role === 'ADMIN_EXOFIX' ? (
        <>
          {/* Header Mobile p/ Admin */}
          <div className="bg-[#111827] text-white p-4 flex items-center justify-between md:hidden shrink-0 border-b border-gray-850">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <span className="font-sans font-bold text-sm tracking-wider uppercase">EXOFIX ADMIN</span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 hover:bg-gray-800 rounded-lg text-gray-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Menus de Navegação - Desktop & Mobile */}
          <aside className={`w-full md:w-64 bg-[#111827] text-white shrink-0 flex flex-col justify-between p-6 space-y-6 md:min-h-screen border-r border-gray-800 transition-all ${
            mobileMenuOpen ? 'block' : 'hidden md:flex'
          }`} id="admin-sidebar">
            <div className="space-y-6">
              {/* Logo e Info de Conta */}
              <div className="border-b border-gray-800 pb-5 hidden md:block">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center font-bold text-lg text-white">
                    E
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-white">EXOFIX</h1>
                    <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest block font-mono">Gestão de Intervenções</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-4 bg-gray-900/60 p-3 rounded-lg border border-gray-800">
                  <span className="block text-white font-semibold text-xs">{currentUser.nome}</span>
                  <span className="block text-[10px] text-gray-400 font-mono mt-0.5">Perfil: Supervisor Geral</span>
                </div>
              </div>

              {/* Links de Módulos */}
              <nav className="flex flex-col gap-2" id="sidebar-nav">
                <button
                  onClick={() => { setAdminTab('dashboard'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 p-3 text-sm font-medium rounded-lg text-left transition ${
                    adminTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-805 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" /> <span>Dashboard</span>
                </button>

                <button
                  onClick={() => { setAdminTab('residencias'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 p-3 text-sm font-medium rounded-lg text-left transition ${
                    adminTab === 'residencias' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-805 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Building className="w-5 h-5" /> <span>Residências</span>
                </button>

                <button
                  onClick={() => { setAdminTab('empresas'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 p-3 text-sm font-medium rounded-lg text-left transition ${
                    adminTab === 'empresas' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-850 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Building2 className="w-5 h-5" /> <span>Empresas</span>
                </button>

                <button
                  onClick={() => { setAdminTab('planeamento'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 p-3 text-sm font-medium rounded-lg text-left transition ${
                    adminTab === 'planeamento' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-850 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <CalendarDays className="w-5 h-5" /> <span>Planeamento</span>
                </button>

                <button
                  onClick={() => { setAdminTab('relatorios'); setMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 p-3 text-sm font-medium rounded-lg text-left transition ${
                    adminTab === 'relatorios' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-850 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <FileText className="w-5 h-5" /> <span>Relatórios</span>
                </button>
              </nav>
            </div>

            {/* Sair e Configurações */}
            <div className="pt-4 border-t border-gray-800 space-y-2 shrink-0">
              <button
                onClick={handleReset}
                title="Resetar todos os dados para simulação padrão"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-850 hover:bg-gray-800 border border-gray-800 text-[11px] font-semibold rounded hover:text-white transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Repor Dados Iniciais
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 hover:bg-red-950/40 hover:text-rose-100 text-[11px] font-semibold rounded text-red-400 transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Encerra Sessão
              </button>
            </div>
          </aside>
        </>
      ) : null}

      {/* 2. ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8" id="app-content-body">
        
        {/* Renderização condicional por perfil logado */}
        {currentUser.role === 'ADMIN_EXOFIX' ? (
          /* Vistas de Administrador */
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header de Topo - Fornecendo contexto exacto da "Geometric Balance" */}
            <header className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-8 -mx-4 sm:-mx-8 -mt-4 sm:-mt-8 mb-8 shrink-0">
              <h2 className="text-lg font-bold text-gray-800">
                {adminTab === 'dashboard' && 'Dashboard Administrativo'}
                {adminTab === 'residencias' && 'Gestão de Residências'}
                {adminTab === 'empresas' && 'Empresas Parceiras'}
                {adminTab === 'planeamento' && 'Planeamento de Intervenções'}
                {adminTab === 'relatorios' && 'Relatórios e Auditorias'}
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-right px-4 border-r border-gray-100">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Data de Hoje</p>
                  <p className="text-sm font-bold text-gray-750">22 de Junho, 2026</p>
                </div>
                <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-sm inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Cadastros: {residencias.length}</span>
                </div>
              </div>
            </header>

            {adminTab === 'dashboard' && (
              <AdminDashboard 
                residencias={residencias} 
                empresas={empresas} 
                historico={historico} 
                onNavigateTo={(tab) => setAdminTab(tab)} 
              />
            )}
            
            {adminTab === 'residencias' && (
              <ResidenciasManager 
                residencias={residencias} 
                empresas={empresas} 
                historico={historico} 
                onAddResidencia={handleAddResidencia}
                onUpdateResidencia={handleUpdateResidencia}
                onExcluirResidencia={handleExcluirResidencia}
              />
            )}

            {adminTab === 'empresas' && (
              <EmpresasManager 
                empresas={empresas} 
                residencias={residencias}
                onAddEmpresa={handleAddEmpresa}
                onUpdateEmpresa={handleUpdateEmpresa}
                onExcluirEmpresa={handleExcluirEmpresa}
                onBatchAssignResidencias={handleBatchAssignResidencias}
              />
            )}

            {adminTab === 'planeamento' && (
              <PlaneamentoManager 
                planeamentos={planeamentos}
                residencias={residencias}
                empresas={empresas}
                currentRole="ADMIN_EXOFIX"
                onAddPlaneamento={handleAddPlaneamento}
                onUpdatePlaneamento={handleUpdatePlaneamento}
                onExcluirPlaneamento={handleExcluirPlaneamento}
              />
            )}

            {adminTab === 'relatorios' && (
              <RelatoriosView 
                residencias={residencias} 
                empresas={empresas} 
                historico={historico} 
              />
            )}

          </div>
        ) : (
          /* Vistas de Empresa Prestadora de Serviços (Equipas de Campo) */
          <div>
            {/* Cabecalho de Brigada simplificado para Telemóvel */}
            {(() => {
              const empConectada = empresas.find(e => e.id === currentUser.id);
              if (empConectada) {
                return (
                  <PrestadoraDashboard 
                    empresa={empConectada}
                    empresas={empresas}
                    residencias={residencias}
                    planeamentos={planeamentos}
                    historico={historico}
                    onUpdateResidenciaEstado={handleUpdateResidenciaEstado}
                    onAddPlaneamento={handleAddPlaneamento}
                    onUpdatePlaneamento={handleUpdatePlaneamento}
                    onExcluirPlaneamento={handleExcluirPlaneamento}
                    onLogout={handleLogout}
                  />
                );
              }
              return (
                <div className="text-center p-10 text-slate-500 italic">
                  Erro de vinculação da empresa prestadora no sistema. Por favor, redefina a base de dados.
                  <button onClick={handleLogout} className="mt-3 block mx-auto px-4 py-2 bg-slate-900 text-white rounded">Logout</button>
                </div>
              );
            })()}
          </div>
        )}

      </main>

    </div>
  );
}
