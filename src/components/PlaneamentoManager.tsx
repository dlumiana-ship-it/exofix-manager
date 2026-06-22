import React, { useState } from 'react';
import { 
  CalendarDays, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  User, 
  Clock, 
  FileText, 
  Check, 
  X, 
  Filter, 
  ChevronDown, 
  ArrowRight, 
  Calendar,
  Layers,
  Sparkles,
  MapPin,
  Trash2,
  BookOpen,
  Edit2
} from 'lucide-react';
import { Residencia, Empresa, Planeamento, EstadoIntervencao } from '../types';

interface PlaneamentoManagerProps {
  planeamentos: Planeamento[];
  residencias: Residencia[];
  empresas: Empresa[];
  currentRole: 'ADMIN_EXOFIX' | 'PRESTADORA';
  currentEmpresaId?: string; // Se for empresa prestadora
  onAddPlaneamento: (novo: Omit<Planeamento, 'id'>) => void;
  onUpdatePlaneamento: (atualizado: Planeamento) => void;
  onExcluirPlaneamento: (id: string) => void;
}

type TabAgendamento = 'mensal' | 'semanal' | 'diaria';

export default function PlaneamentoManager({
  planeamentos,
  residencias,
  empresas,
  currentRole,
  currentEmpresaId,
  onAddPlaneamento,
  onUpdatePlaneamento,
  onExcluirPlaneamento
}: PlaneamentoManagerProps) {
  // Controle de Tabs de Visualização (Mensal, Semanal, Diária)
  const [activeTab, setActiveTab] = useState<TabAgendamento>('mensal');
  const [showForm, setShowForm] = useState(false);

  // Estado para planeamento em edição
  const [editingPlaneamento, setEditingPlaneamento] = useState<Planeamento | null>(null);

  // Estados do Formulário de Planeamento
  const [tipo, setTipo] = useState<'Fumigação' | 'Manutenção ACS'>('Fumigação');
  const [dataSel, setDataSel] = useState('2026-06-22'); // Data de hoje fixa por defeito
  const [equipaResponsavel, setEquipaResponsavel] = useState('');
  const [empresaId, setEmpresaId] = useState(currentEmpresaId || empresas[0]?.id || '');
  const [selectedResidenciaIds, setSelectedResidenciaIds] = useState<string[]>([]);
  const [observacoes, setObservacoes] = useState('');

  // Estados de navegação do calendário (mês selecionado: Junho 2026)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // 0-indexed, 5 = Junho

  // Estado para mostrar todas as residências ou apenas as atribuídas à empresa
  const [mostrarTodasAsCasas, setMostrarTodasAsCasas] = useState(false);

  // Busca residências disponíveis associadas à empresa selecionada ou todas
  const residenciasDisponiveis = mostrarTodasAsCasas
    ? residencias
    : residencias.filter(r => r.empresaId === (currentRole === 'PRESTADORA' ? currentEmpresaId : empresaId));

  // Iniciar fluxo de edição
  const handleStartEdit = (plan: Planeamento) => {
    setEditingPlaneamento(plan);
    setTipo(plan.tipo);
    setDataSel(plan.data);
    setEquipaResponsavel(plan.equipaResponsavel);
    setEmpresaId(plan.empresaId);
    setSelectedResidenciaIds(plan.residenciaIds);
    setObservacoes(plan.observacoes || '');
    setShowForm(true);
    // Rolar até o topo do formulário
    document.getElementById('planeamento-manager-root')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cancelar fluxo de edição/criação
  const handleCancelForm = () => {
    setEditingPlaneamento(null);
    setSelectedResidenciaIds([]);
    setEquipaResponsavel('');
    setObservacoes('');
    setShowForm(false);
  };

  // Função para criar ou atualizar o planeamento
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedResidenciaIds.length === 0) {
      alert('Selecione pelo menos uma residência para planejar a intervenção.');
      return;
    }
    if (!equipaResponsavel.trim()) {
      alert('Por favor, informe a equipa técnica responsável.');
      return;
    }

    if (editingPlaneamento) {
      onUpdatePlaneamento({
        ...editingPlaneamento,
        tipo,
        data: dataSel,
        residenciaIds: selectedResidenciaIds,
        equipaResponsavel,
        empresaId: currentRole === 'PRESTADORA' ? (currentEmpresaId || '') : empresaId,
        observacoes,
      });
    } else {
      onAddPlaneamento({
        tipo,
        data: dataSel,
        residenciaIds: selectedResidenciaIds,
        equipaResponsavel,
        empresaId: currentRole === 'PRESTADORA' ? (currentEmpresaId || '') : empresaId,
        observacoes,
      });
    }

    // Resetar formulário
    handleCancelForm();
  };

  // Alternar seleção de residência singular no checklist
  const toggleResidenciaSelection = (resId: string) => {
    if (selectedResidenciaIds.includes(resId)) {
      setSelectedResidenciaIds(prev => prev.filter(id => id !== resId));
    } else {
      setSelectedResidenciaIds(prev => [...prev, resId]);
    }
  };

  // Selecionar ou desmarcar todas para a Zona selecionada (Marcar Zona Inteira)
  const selecionarTodasDaZona = (zonaNome: string) => {
    const idsDaZona = residenciasDisponiveis.filter(r => r.bairro === zonaNome).map(r => r.id);
    const todasSelecionadas = idsDaZona.every(id => selectedResidenciaIds.includes(id));

    if (todasSelecionadas) {
      // Remover todas as da Zona
      setSelectedResidenciaIds(prev => prev.filter(id => !idsDaZona.includes(id)));
    } else {
      // Adicionar as da Zona que ainda não estão
      setSelectedResidenciaIds(prev => {
        const novas = [...prev];
        idsDaZona.forEach(id => {
          if (!novas.includes(id)) novas.push(id);
        });
        return novas;
      });
    }
  };

  // Obter dias do calendário para o mês corrente
  const obterDiasDoMes = (ano: number, mes: number) => {
    const primeiroDiaIndex = new Date(ano, mes, 1).getDay(); // Dia da semana que começa o mês
    const numDias = new Date(ano, mes + 1, 0).getDate(); // Total de dias no mês
    
    const dias = [];
    // Espaços vazios no início para alinhar a semana (segunda-feira como início)
    const espacosNaSegunda = primeiroDiaIndex === 0 ? 6 : primeiroDiaIndex - 1;
    for (let i = 0; i < espacosNaSegunda; i++) {
      dias.push(null);
    }
    
    for (let d = 1; d <= numDias; d++) {
      dias.push(d);
    }
    return dias;
  };

  const NOMES_MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Filtrar planeamentos para o mês corrente
  const obterPlaneamentosDia = (dia: number) => {
    if (!dia) return [];
    const dataStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    
    return planeamentos.filter(p => {
      const dataCorreta = p.data === dataStr;
      if (currentRole === 'PRESTADORA') {
        return dataCorreta && p.empresaId === currentEmpresaId;
      }
      return dataCorreta;
    });
  };

  // Navegação Calendário
  const anteriorMes = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const proximoMes = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Agenda Semanal (Do dia 2026-06-22 ao 2026-06-28)
  const DIAS_SEMANA_NOMES = [
    { nome: 'Segunda-feira', data: '2026-06-22', curto: 'Seg' },
    { nome: 'Terça-feira', data: '2026-06-23', curto: 'Ter' },
    { nome: 'Quarta-feira', data: '2026-06-24', curto: 'Qua' },
    { nome: 'Quinta-feira', data: '2026-06-25', curto: 'Qui' },
    { nome: 'Sexta-feira', data: '2026-06-26', curto: 'Sex' },
    { nome: 'Sábado', data: '2026-06-27', curto: 'Sáb' },
    { nome: 'Domingo', data: '2026-06-28', curto: 'Dom' },
  ];

  // Agenda Diária (Hoje)
  const dataHojeString = '2026-06-22';
  const planeamentosDeHoje = planeamentos.filter(p => {
    const éHoje = p.data === dataHojeString;
    return currentRole === 'PRESTADORA' ? éHoje && p.empresaId === currentEmpresaId : éHoje;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="planeamento-manager-root">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-sans font-bold text-gray-800 flex items-center gap-2">
            <CalendarDays className="text-blue-600 w-5 h-5" /> Planeamento e Agendamento Técnico
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Configure brigadas de terreno, assinale datas, gerencie zonas operacionais e organize a agenda técnica.
          </p>
        </div>
        
        <button
          onClick={() => {
            if (showForm) {
              handleCancelForm();
            } else {
              setShowForm(true);
              if (currentRole === 'PRESTADORA') {
                setEmpresaId(currentEmpresaId || '');
              }
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm shrink-0"
        >
          {showForm ? (
            <>Cancelar</>
          ) : (
            <>
              <Plus className="w-4 h-4" /> Marcar Intervenção
            </>
          )}
        </button>
      </div>

      {/* Formulário de Criação / Edição Integrado */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex flex-col space-y-4 animate-fade-in" id="planeamento-form-wrapper">
          <div className="flex items-center gap-2 border-b border-gray-150 pb-3">
            <Sparkles className="w-4.5 h-4.5 text-blue-600" />
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-gray-850">
              {editingPlaneamento ? 'Formulário de Edição de Planeamento' : 'Formulário de Agendamento de Equipa'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* Parâmetros do Agendamento */}
            <div className="space-y-4 md:border-r md:border-gray-200 md:pr-6">
              <h4 className="font-bold text-gray-700 border-b border-gray-200 pb-1">Configuração Geral</h4>
              
              <div>
                <label className="block text-gray-500 font-bold mb-1">Tipo de Intervenção *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTipo('Fumigação')}
                    className={`py-2 px-3 rounded-lg border text-center font-bold font-sans transition-all text-xs ${
                      tipo === 'Fumigação'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🐜 Fumigação
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('Manutenção ACS')}
                    className={`py-2 px-3 rounded-lg border text-center font-bold font-sans transition-all text-xs ${
                      tipo === 'Manutenção ACS'
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    🔥 ACS (Água Quente)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1" htmlFor="data-planeat">Data Prevista *</label>
                <input
                  type="date"
                  id="data-planeat"
                  required
                  value={dataSel}
                  onChange={(e) => setDataSel(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono font-medium outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {currentRole === 'ADMIN_EXOFIX' ? (
                <div>
                  <label className="block text-slate-500 font-semibold mb-1" htmlFor="empresa-planeat">Empresa Atribuída *</label>
                  <select
                    id="empresa-planeat"
                    value={empresaId}
                    onChange={(e) => {
                      setEmpresaId(e.target.value);
                      setSelectedResidenciaIds([]); // Limpar residências ao mudar de empresa
                    }}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-slate-705 outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.nome}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Empresa Executora</label>
                  <input
                    type="text"
                    disabled
                    value={empresas.find(e => e.id === currentEmpresaId)?.nome || ''}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-medium text-slate-500 cursor-not-allowed"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-500 font-semibold mb-1" htmlFor="equipa-planeat">Equipa Técnica Responsável *</label>
                <input
                  type="text"
                  id="equipa-planeat"
                  required
                  placeholder="Ex: Brigada Alfa, Equipa Clima 2"
                  value={equipaResponsavel}
                  onChange={(e) => setEquipaResponsavel(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1" htmlFor="obs-planeat">Notas Adicionais do Plano</label>
                <textarea
                  id="obs-planeat"
                  rows={2}
                  placeholder="Instruções de segurança, materiais do lote, etc."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            {/* Checklist de Residências Vinculadas */}
            <div className="md:col-span-2 flex flex-col space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200 pb-2 shrink-0">
                <h4 className="font-bold text-slate-705">
                  Seleção de Casas ({selectedResidenciaIds.length} selecionadas){' '}
                  <span className="text-slate-400 font-medium font-sans text-[11px] block sm:inline">
                    — {mostrarTodasAsCasas ? 'A exibir todas as 38 casas do sistema' : `Associadas à ${empresas.find(e => e.id === (currentRole === 'PRESTADORA' ? currentEmpresaId : empresaId))?.nome.split(' (')[0] || 'empresa'}`}
                  </span>
                </h4>
                <div className="flex items-center gap-3 text-[11px]">
                  <label className="flex items-center gap-1.5 font-bold text-slate-655 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mostrarTodasAsCasas}
                      onChange={(e) => {
                        setMostrarTodasAsCasas(e.target.checked);
                        setSelectedResidenciaIds([]); // Limpar seleção para evitar confusão de atribuição
                      }}
                      className="w-3.5 h-3.5 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    Ver Todas as Casas
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedResidenciaIds.length === residenciasDisponiveis.length) {
                        setSelectedResidenciaIds([]);
                      } else {
                        setSelectedResidenciaIds(residenciasDisponiveis.map(r => r.id));
                      }
                    }}
                    className="text-blue-600 font-bold hover:text-blue-700"
                  >
                    Alternar Todas ({residenciasDisponiveis.length})
                  </button>
                </div>
              </div>

              {residenciasDisponiveis.length === 0 ? (
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-slate-450 italic justify-center flex flex-col items-center">
                  Não possui residências atribuídas a esta empresa parceira. Vá ao módulo "Residências" para vincular casas a esta prestadora.
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto max-h-[290px] border border-gray-200 rounded-xl divide-y divide-gray-100 pr-2">
                  {/* Agrupar por Zona (campo bairro) para facilitar seleção */}
                  {Object.entries(
                    residenciasDisponiveis.reduce((zonas: { [key: string]: Residencia[] }, r) => {
                      if (!zonas[r.bairro]) zonas[r.bairro] = [];
                      zonas[r.bairro].push(r);
                      return zonas;
                    }, {})
                  ).map(([zonaNome, casasDaZona]) => {
                    const todosDestaZonaOk = casasDaZona.every(r => selectedResidenciaIds.includes(r.id));
                    return (
                      <div key={zonaNome} className="p-3 bg-white space-y-2">
                        <div className="flex items-center justify-between bg-slate-50/80 px-2 py-1.5 rounded border border-slate-100/50">
                          <span className="font-bold text-slate-800 flex items-center gap-1">🏘️ {zonaNome}</span>
                          <button
                            type="button"
                            onClick={() => selecionarTodasDaZona(zonaNome)}
                            className="text-[10px] font-bold text-slate-500 hover:text-teal-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition shadow-sm"
                          >
                            {todosDestaZonaOk ? 'Desmarcar Zona' : 'Selecionar Zona Inteira'}
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2">
                          {casasDaZona.map(res => {
                            const estaSel = selectedResidenciaIds.includes(res.id);
                            const lastServ = tipo === 'Fumigação' ? res.estadoFumigacao : res.estadoACS;
                            return (
                              <label
                                key={res.id}
                                htmlFor={`check-res-${res.id}`}
                                className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer ${
                                  estaSel 
                                    ? 'bg-teal-50/40 border-teal-200' 
                                    : 'bg-white hover:bg-slate-50/50 border-slate-100'
                                }`}
                              >
                                <input
                                  id={`check-res-${res.id}`}
                                  type="checkbox"
                                  checked={estaSel}
                                  onChange={() => toggleResidenciaSelection(res.id)}
                                  className="w-4 h-4 rounded text-teal-605 border-slate-300 focus:ring-teal-500 shrink-0 mt-0.5"
                                />
                                <div className="text-[11px]">
                                  <div className="font-mono font-bold text-slate-805 flex items-center gap-1.5">
                                    <span>{res.codigo}</span>
                                     <span className={`text-[9px] px-1 rounded ${
                                       lastServ === 'Concluída' ? 'bg-green-100 text-green-700' :
                                       lastServ === 'Em andamento' ? 'bg-amber-100 text-amber-700' :
                                       lastServ === 'Agendada' ? 'bg-blue-100 text-blue-700' :
                                       lastServ === 'Não realizada' ? 'bg-rose-100 text-rose-700' :
                                       lastServ === 'Atrasada' ? 'bg-rose-100 text-rose-800 font-bold animate-pulse' :
                                       'bg-slate-100 text-slate-500'
                                     }`}>
                                      {lastServ}
                                    </span>
                                  </div>
                                  <div className="font-semibold text-slate-900 mt-0.5">{res.nomeOcupante}</div>
                                  <div className="text-slate-500 text-[10px] truncate max-w-[190px] mt-0.5">{res.endereco}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Botões do Formulário */}
              <div className="pt-2 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-4 py-2 text-slate-600 font-semibold bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={selectedResidenciaIds.length === 0}
                  className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> {editingPlaneamento ? 'Salvar Alterações' : 'Gravar Planeamento'}
                </button>
              </div>
            </div>

          </form>
        </div>
      )}

      {/* Navegação de Modos (Calendário, Agenda Semanal, Agenda Diária) */}
      <div className="bg-white border border-slate-150 p-2 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm text-xs">
        <div className="flex p-0.5 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setActiveTab('mensal')}
            className={`px-4 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'mensal' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🗓️ Calendário Mensal
          </button>
          <button
            onClick={() => setActiveTab('semanal')}
            className={`px-4 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'semanal' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 Agenda Semanal
          </button>
          <button
            onClick={() => setActiveTab('diaria')}
            className={`px-4 py-1.5 rounded-md font-semibold transition ${
              activeTab === 'diaria' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ⚡ Hoje ({dataHojeString})
          </button>
        </div>

        <div className="text-slate-450 italic font-medium">
          {activeTab === 'mensal' && `${NOMES_MESES[currentMonth]} de ${currentYear}`}
          {activeTab === 'semanal' && 'Planeamento Integrado Semanal'}
          {activeTab === 'diaria' && `Agenda Diária Técnico-Operacional`}
        </div>
      </div>

      {/* CONTEÚDO DA TABA SELECIONADA */}
      
      {/* 1. VIEW: CALENDÁRIO MENSAL */}
      {activeTab === 'mensal' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 space-y-4 text-xs">
          
          {/* Navegação do Mês */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-sm uppercase font-sans flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-600" /> Programação Mensal
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={anteriorMes} 
                className="p-1 hover:bg-white rounded transition text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-800 px-2 font-sans">
                {NOMES_MESES[currentMonth]} {currentYear}
              </span>
              <button 
                onClick={proximoMes} 
                className="p-1 hover:bg-white rounded transition text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendário Grid */}
          <div className="grid grid-cols-7 gap-1 border border-slate-100 rounded-lg overflow-hidden shrink-0 bg-slate-50">
            {/* Dias da semana */}
            {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
              <span key={d} className="text-center py-2 text-[10px] font-bold text-slate-400 bg-slate-100 uppercase border-b border-slate-150">
                {d}
              </span>
            ))}

            {/* Dias numéricos */}
            {obterDiasDoMes(currentYear, currentMonth).map((dia, idx) => {
              const planes = obterPlaneamentosDia(dia || 0);
              const éHojeNum = currentYear === 2026 && currentMonth === 5 && dia === 22; // Hoje fixed demo
              
              return (
                <div 
                  key={idx} 
                  className={`min-h-[110px] p-1 bg-white border border-slate-100/40 relative flex flex-col justify-between ${
                    !dia ? 'bg-slate-50/50 cursor-default' : ''
                  } ${éHojeNum ? 'ring-1 ring-teal-500 ring-inset bg-teal-50/10' : ''}`}
                >
                  {/* Número Dia */}
                  {dia && (
                    <span className={`font-mono text-[10px] font-bold self-start px-1.5 py-0.5 rounded-md ${
                      éHojeNum ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-500'
                    }`}>
                      {dia}
                    </span>
                  )}

                  {/* Lista de Planeamentos no Dia */}
                  {dia && planes.length > 0 && (
                    <div className="space-y-1 mt-1 flex-1 overflow-y-auto">
                      {planes.map(p => {
                        const canEditOrDelete = currentRole === 'ADMIN_EXOFIX' || p.empresaId === currentEmpresaId;
                        return (
                          <div 
                            key={p.id} 
                            id={`cal-plan-${p.id}`}
                            title={`Equipa: ${p.equipaResponsavel} - ${p.residenciaIds.length} casas - Obs: ${p.observacoes || 'Nenhuma'}`}
                            className={`p-1.5 rounded text-[9px] font-medium border leading-tight truncate relative group transition hover:-translate-y-0.5 ${
                              p.tipo === 'Fumigação' 
                                ? 'bg-teal-50 text-teal-700 border-teal-200' 
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            }`}
                          >
                            <div className="font-bold truncate">{p.tipo === 'Fumigação' ? '🐜 Fumig' : '🔥 ACS'}</div>
                            <div className="truncate text-slate-500">{p.residenciaIds.length} casas • {p.equipaResponsavel.split(' ')[0]}</div>
                            
                            {/* Botões de Ação na Hover */}
                            {canEditOrDelete && (
                              <div className="absolute right-0.5 top-0.5 hidden group-hover:flex gap-0.5 bg-white/95 p-0.5 rounded shadow-sm border border-slate-100">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStartEdit(p); }}
                                  className="p-0.5 text-blue-600 hover:bg-slate-100 rounded transition"
                                  title="Editar Planeamento"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); onExcluirPlaneamento(p.id); }}
                                  className="p-0.5 text-rose-500 hover:bg-slate-100 rounded transition"
                                  title="Excluir Planeamento"
                                >
                                  <Trash2 className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. VIEW: AGENDA SEMANAL */}
      {activeTab === 'semanal' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 text-xs" id="week-agenda-grid">
          {DIAS_SEMANA_NOMES.map((d) => {
            const planSem = planeamentos.filter(p => {
              const corre = p.data === d.data;
              return currentRole === 'PRESTADORA' ? corre && p.empresaId === currentEmpresaId : corre;
            });

            const éHojeSem = d.data === dataHojeString;

            return (
              <div 
                key={d.data} 
                className={`flex flex-col rounded-xl border bg-white p-3 space-y-3 shadow-sm min-h-[350px] ${
                  éHojeSem ? 'border-teal-400 ring-2 ring-teal-500/10' : 'border-slate-100'
                }`}
              >
                {/* Header do Dia da Semana */}
                <div className="border-b border-slate-100 pb-2 text-center">
                  <span className={`text-[10px] font-bold block uppercase tracking-wider ${
                    éHojeSem ? 'text-teal-605' : 'text-slate-400'
                  }`}>
                    {d.curto}
                  </span>
                  <span className={`text-base font-bold font-mono tracking-tight block ${
                    éHojeSem ? 'text-teal-750' : 'text-slate-700'
                  }`}>
                    {d.data.split('-')[2]} / Jun
                  </span>
                  {éHojeSem && (
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-teal-600 text-white rounded-full text-[8px] font-extrabold uppercase tracking-wide">
                      Hoje
                    </span>
                  )}
                </div>

                {/* Eventos Planeados */}
                <div className="flex-1 space-y-3 overflow-y-auto">
                  {planSem.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 italic text-[10px]">Sem trabalhos.</div>
                  ) : (
                    planSem.map(p => {
                      const canEditOrDelete = currentRole === 'ADMIN_EXOFIX' || p.empresaId === currentEmpresaId;
                      return (
                        <div 
                          key={p.id} 
                          id={`week-plan-${p.id}`}
                          className={`p-2.5 rounded-lg border text-[11px] relative group space-y-1 ${
                            p.tipo === 'Fumigação' 
                              ? 'bg-teal-50/50 border-teal-200 text-teal-800' 
                              : 'bg-indigo-50/50 border-indigo-200 text-indigo-800'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold flex items-center gap-1">
                              {p.tipo === 'Fumigação' ? '🐜 Fumigação' : '🔥 ACS'}
                            </span>
                            
                            {/* Botões de Ações */}
                            {canEditOrDelete && (
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleStartEdit(p)}
                                  className="p-0.5 text-blue-600 hover:bg-white rounded transition"
                                  title="Editar"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onExcluirPlaneamento(p.id)}
                                  className="p-0.5 text-rose-500 hover:bg-rose-100 rounded transition"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="font-semibold text-slate-800 mt-1">{p.equipaResponsavel}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-0.5 mt-0.5">
                            <BookOpen className="w-3 h-3 text-slate-405 shrink-0" /> 
                            <span>{p.residenciaIds.length} residências</span>
                          </div>
                          
                          {/* Mostrar Zonas selecionadas */}
                          <div className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded inline-block text-slate-500 truncate max-w-full font-bold">
                            Zonas: {Array.from(new Set(p.residenciaIds.map(rid => residencias.find(r => r.id === rid)?.bairro))).join(', ')}
                          </div>

                          <p className="text-[10px] text-slate-500 italic mt-1 line-clamp-2" title={p.observacoes}>
                            "{p.observacoes || 'Sem detalhes'}"
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. VIEW: AGENDA DIÁRIA (Hoje) */}
      {activeTab === 'diaria' && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-5" id="daily-agenda-panel">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between text-xs">
            <div>
              <h3 className="font-sans font-bold text-sm text-slate-800">Escala de Trabalho para {dataHojeString}</h3>
              <p className="text-slate-500 text-xs">Visão direcionada a técnicos de serviço sobre todas as casas agendadas para hoje.</p>
            </div>
            <span className="font-mono text-xs font-bold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-500/10">
              {planeamentosDeHoje.length} ordens de trabalho
            </span>
          </div>

          {planeamentosDeHoje.length === 0 ? (
            <div className="text-center py-12 text-slate-400 italic">
              Não existem intervenções residenciais programadas para o dia de hoje.
            </div>
          ) : (
            <div className="space-y-6">
              {planeamentosDeHoje.map((p) => {
                const empParceiro = empresas.find(e => e.id === p.empresaId);
                const canEditOrDelete = currentRole === 'ADMIN_EXOFIX' || p.empresaId === currentEmpresaId;
                
                return (
                  <div key={p.id} className="border border-slate-150 rounded-xl overflow-hidden shadow-sm" id={`daily-plan-card-${p.id}`}>
                    <div className="bg-slate-900 text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                          p.tipo === 'Fumigação' ? 'bg-teal-500 text-slate-900' : 'bg-indigo-500 text-white'
                        }`}>
                          {p.tipo}
                        </span>
                        <h4 className="font-sans font-bold text-xs">{p.equipaResponsavel}</h4>
                      </div>
                      
                      <div className="text-[10px] text-slate-350 flex items-center gap-2.5 font-sans">
                        <span>Prestador: <strong className="text-white">{empParceiro?.nome}</strong></span>
                        
                        {/* Ações Rápidas de Edição */}
                        {canEditOrDelete && (
                          <div className="flex items-center gap-2 border-l border-slate-800 pl-2.5 ml-1">
                            <button
                              onClick={() => handleStartEdit(p)}
                              className="text-teal-400 hover:text-teal-300 font-bold flex items-center gap-0.5"
                            >
                              <Edit2 className="w-3 h-3" /> Editar
                            </button>
                            <button
                              onClick={() => onExcluirPlaneamento(p.id)}
                              className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-0.5"
                            >
                              <Trash2 className="w-3 h-3" /> Anular
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/30 text-xs space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Instruções Operativas</span>
                        <p className="text-slate-655 italic leading-relaxed font-semibold mt-0.5">"{p.observacoes || 'Nenhum comentário adicional assinalado para hoje.'}"</p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100 pb-1.5 block tracking-wider mb-2">Casas a Visitar ({p.residenciaIds.length} residências)</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {p.residenciaIds.map(resId => {
                            const rs = residencias.find(r => r.id === resId);
                            if (!rs) return null;
                            const estadoDoServico = p.tipo === 'Fumigação' ? rs.estadoFumigacao : rs.estadoACS;
                            
                            let estCor = "text-slate-700 bg-slate-50 border-slate-200";
                            if (estadoDoServico === 'Concluída') estCor = "text-green-700 bg-green-50 border-green-200";
                            if (estadoDoServico === 'Em andamento') estCor = "text-amber-700 bg-amber-50 border-amber-200";
                            if (estadoDoServico === 'Não realizada') estCor = "text-rose-700 bg-rose-50 border-rose-200";
                            if (estadoDoServico === 'Agendada') estCor = "text-blue-700 bg-blue-50 border-blue-200";
                            if (estadoDoServico === 'Atrasada') estCor = "text-rose-750 bg-rose-50 border-rose-300 font-bold animate-pulse";

                            return (
                              <div key={resId} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="font-mono font-bold text-teal-700 text-[11px]">{rs.codigo}</span>
                                    <h5 className="font-bold text-slate-900 mt-0.5 leading-tight">{rs.nomeOcupante}</h5>
                                  </div>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${estCor}`}>
                                    {estadoDoServico}
                                  </span>
                                </div>
                                <div className="text-slate-500 font-medium text-[10px] leading-relaxed space-y-1">
                                  <div className="flex items-start gap-1"><MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" /> <span>({rs.bairro}) {rs.endereco}</span></div>
                                  <div className="flex items-center gap-1 font-mono text-[9px]"><User className="w-3 h-3 text-slate-450 shrink-0" /> {rs.telefonePrincipal}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
