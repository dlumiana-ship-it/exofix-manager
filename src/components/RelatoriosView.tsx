import { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';
import { Residencia, Empresa, IntervencaoHistorico } from '../types';

interface RelatoriosViewProps {
  residencias: Residencia[];
  empresas: Empresa[];
  historico: IntervencaoHistorico[];
}

export default function RelatoriosView({ residencias, empresas, historico }: RelatoriosViewProps) {
  const [reportType, setReportType] = useState<'diario' | 'progresso'>('diario');
  const [selectedDate, setSelectedDate] = useState('2026-06-22'); // Data demo hoje
  const [successToast, setSuccessToast] = useState('');

  // Sincronizar logs para a data selecionada (para o Relatório Diário)
  // Filtramos o histórico que começa com a data selecionada (YYYY-MM-DD)
  const logsDoDia = historico.filter(h => h.dataHora.startsWith(selectedDate));

  // Agrupamento para o Relatório Diário
  const casasConcluidasDia = logsDoDia.filter(h => h.estadoNovo === 'Concluída');
  const casasEmAndamentoDia = logsDoDia.filter(h => h.estadoNovo === 'Em andamento');
  const casasNaoRealizadasDia = logsDoDia.filter(h => h.estadoNovo === 'Não realizada');
  const casasAgendadasDia = logsDoDia.filter(h => h.estadoNovo === 'Agendada');

  // Cálculos do Relatório Geral de Progresso
  const totalCasas = residencias.length;
  // Consideramos concluída se ambos foram Concluídos
  const totalConcluidasGeral = residencias.filter(r => r.estadoFumigacao === 'Concluída' && r.estadoACS === 'Concluída').length;
  
  // Pelo menos um agendado ou ambos agendados e nenhum concluído/em andamento
  const totalAgendadasGeral = residencias.filter(r => r.estadoFumigacao === 'Agendada' || r.estadoACS === 'Agendada').length;
  const totalEmAndamentoGeral = residencias.filter(r => r.estadoFumigacao === 'Em andamento' || r.estadoACS === 'Em andamento').length;
  const totalNaoRealizadasGeral = residencias.filter(r => r.estadoFumigacao === 'Não realizada' || r.estadoACS === 'Não realizada').length;
  
  // Percentagens
  const concluidasFum = residencias.filter(r => r.estadoFumigacao === 'Concluída').length;
  const concluidasACS = residencias.filter(r => r.estadoACS === 'Concluída').length;
  const percentFum = totalCasas > 0 ? Math.round((concluidasFum / totalCasas) * 100) : 0;
  const percentACS = totalCasas > 0 ? Math.round((concluidasACS / totalCasas) * 100) : 0;
  
  const totalServicosConcluidos = concluidasFum + concluidasACS;
  const totalServicosEsperados = totalCasas * 2;
  const percentExecucaoGeral = totalServicosEsperados > 0 
    ? Math.round((totalServicosConcluidos / totalServicosEsperados) * 100) 
    : 0;

  // Distribuição por Zonas para relatório geral
  const zonasCalculadas = residencias.reduce((acc: { [key: string]: { total: number; fumOk: number; acsOk: number } }, r) => {
    if (!acc[r.bairro]) acc[r.bairro] = { total: 0, fumOk: 0, acsOk: 0 };
    acc[r.bairro].total += 1;
    if (r.estadoFumigacao === 'Concluída') acc[r.bairro].fumOk += 1;
    if (r.estadoACS === 'Concluída') acc[r.bairro].acsOk += 1;
    return acc;
  }, {});

  const handleSimulatedExport = (tipo: 'PDF' | 'EXCEL') => {
    setSuccessToast(`Exportando Relatório para formato ${tipo}... Por favor, guarde um momento.`);
    setTimeout(() => {
      setSuccessToast('');
      // Abrir impressão padrão do navegador se for PDF para autenticidade
      if (tipo === 'PDF') {
        window.print();
      } else {
        alert(`Relatório compactado e descarregado como Exofix_Relatorio_${reportType}_${selectedDate}.xlsx com sucesso!`);
      }
    }, 1500);
  };

  return (
    <div className="space-y-6" id="relatorios-view-root">
      
      {/* Toast Notificação de Exportação */}
      {successToast && (
        <div className="fixed top-5 right-5 bg-slate-900 text-white px-5 py-3 rounded-xl border border-teal-500/20 shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <span className="animate-spin text-teal-400">🌀</span>
          <span className="text-xs font-semibold">{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm">
        <div>
          <h2 className="text-xl font-sans font-bold text-slate-800 flex items-center gap-2">
            <FileText className="text-teal-600 w-5.5 h-5.5" /> Módulo de Relatórios e Auditorias
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Extraia métricas diárias, acompanhe a taxa cumulativa de execução das empresas e audite anotações de campo.
          </p>
        </div>

        {/* Exportadores de topo */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleSimulatedExport('EXCEL')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-250 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-bold rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Exportar XLS
          </button>
          <button
            onClick={() => handleSimulatedExport('PDF')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-950 text-white text-xs font-bold rounded-lg transition shadow"
          >
            <Printer className="w-3.5 h-3.5 text-slate-350" /> Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Navegador das Abas de Relatório */}
      <div className="bg-white border border-slate-100 p-2 rounded-xl flex items-center justify-between shadow-sm text-xs">
        <div className="flex bg-slate-100 p-0.5 rounded-lg shrink-0">
          <button
            onClick={() => setReportType('diario')}
            className={`px-4 py-1.5 rounded-md font-semibold transition ${
              reportType === 'diario' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📊 Relatório Diário de Atividades
          </button>
          <button
            onClick={() => setReportType('progresso')}
            className={`px-4 py-1.5 rounded-md font-semibold transition ${
              reportType === 'progresso' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📈 Relatório Geral de Progresso (Acumulado)
          </button>
        </div>

        {reportType === 'diario' && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-500 font-semibold text-[11px] font-sans">Data de Consulta:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-medium outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
        )}
      </div>

      {/* CONTEÚDO 1: RELATÓRIO DIÁRIO */}
      {reportType === 'diario' && (
        <div className="space-y-6" id="relatorio-diario-content">
          
          {/* Informações Estatísticas do Dia */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4" id="daily-report-kpis">
            
            <div className="bg-white border border-slate-105 p-4 rounded-xl shadow-sm text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Visitas Concluídas</span>
              <div className="flex justify-center items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-green-550 rounded-full bg-green-600" />
                <span className="text-xl font-sans font-bold text-slate-800">{casasConcluidasDia.length}</span>
              </div>
              <span className="text-[9px] text-slate-400 block mt-0.5">Visitas realizadas com sucesso</span>
            </div>

            <div className="bg-white border border-slate-105 p-4 rounded-xl shadow-sm text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Em Andamento</span>
              <div className="flex justify-center items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-amber-550 rounded-full bg-amber-500" />
                <span className="text-xl font-sans font-bold text-slate-800">{casasEmAndamentoDia.length}</span>
              </div>
              <span className="text-[9px] text-slate-400 block mt-0.5">Equipas de campo ativas</span>
            </div>

            <div className="bg-white border border-slate-105 p-4 rounded-xl shadow-sm text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Não Realizadas</span>
              <div className="flex justify-center items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-rose-550 rounded-full bg-rose-600" />
                <span className="text-xl font-sans font-bold text-slate-800">{casasNaoRealizadasDia.length}</span>
              </div>
              <span className="text-[9px] text-slate-400 block mt-0.5">Contratempos operacionais</span>
            </div>

            <div className="bg-white border border-slate-105 p-4 rounded-xl shadow-sm text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Agendadas Restantes</span>
              <div className="flex justify-center items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-blue-550 rounded-full bg-blue-500" />
                <span className="text-xl font-sans font-bold text-slate-800">{casasAgendadasDia.length}</span>
              </div>
              <span className="text-[9px] text-slate-400 block mt-0.5">Pendente de contacto</span>
            </div>

          </div>

          {/* Listagem das Casas do Dia por Categorias e Comentários */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
            <h3 className="text-xs font-bold font-sans uppercase tracking-wider text-slate-400 border-b border-sidebar-100 pb-2">
              Detalhes do Diário Operacional para {selectedDate}
            </h3>

            {logsDoDia.length === 0 ? (
              <p className="text-slate-400 py-10 text-center italic text-xs">
                Nenhum registo de intervenção foi gerado pelas empresas executoras na data informada ({selectedDate}).
                <br />
                <span className="text-[10px] font-sans block mt-1">Utilize o painel operativo de telemóvel para atualizar estados ou o Planeador para agendar tarefas.</span>
              </p>
            ) : (
              <div className="space-y-6" id="daily-report-categories-wrapper">
                
                {/* 1. SECÇÃO CONCLUÍDAS */}
                {casasConcluidasDia.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 className="w-4.5 h-4.5 text-green-600" /> Casas Concluídas ({casasConcluidasDia.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1 text-xs">
                      {casasConcluidasDia.map(log => (
                        <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                          <div className="flex justify-between items-center font-bold">
                            <span className="font-mono text-teal-700">{log.residenciaCodigo} — {log.residenciaNome}</span>
                            <span className="text-[10px] text-slate-400">{log.tipo}</span>
                          </div>
                          {log.observacoes && (
                            <p className="text-[11px] text-slate-650 italic mt-1 font-medium bg-white p-2 rounded border border-slate-100/50">
                              "{log.observacoes}"
                            </p>
                          )}
                          <div className="text-[10px] text-slate-400 text-right">Mudar Estado: {log.dataHora.split(' ')[1]} por {log.utilizadorResponsavel}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. SECÇÃO EM ANDAMENTO */}
                {casasEmAndamentoDia.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <Clock className="w-4.5 h-4.5 text-amber-650" /> Casas em Andamento ({casasEmAndamentoDia.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1 text-xs">
                      {casasEmAndamentoDia.map(log => (
                        <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                          <div className="flex justify-between items-center font-bold">
                            <span className="font-mono text-teal-700">{log.residenciaCodigo} — {log.residenciaNome}</span>
                            <span className="text-[10px] text-slate-400">{log.tipo}</span>
                          </div>
                          {log.observacoes && (
                            <p className="text-[11px] text-slate-650 italic mt-1 font-medium bg-white p-2 rounded border border-slate-100/50">
                              "{log.observacoes}"
                            </p>
                          )}
                          <div className="text-[10px] text-slate-400 text-right">Início: {log.dataHora.split(' ')[1]} por {log.utilizadorResponsavel}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. SECÇÃO NÃO REALIZADAS */}
                {casasNaoRealizadasDia.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <AlertTriangle className="w-4.5 h-4.5 text-rose-600" /> Casas Não Realizadas (Contratempos) ({casasNaoRealizadasDia.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-1 text-xs">
                      {casasNaoRealizadasDia.map(log => (
                        <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-150 space-y-1">
                          <div className="flex justify-between items-center font-bold">
                            <span className="font-mono text-teal-700">{log.residenciaCodigo} — {log.residenciaNome}</span>
                            <span className="text-[10px] text-slate-400">{log.tipo}</span>
                          </div>
                          {log.observacoes && (
                            <p className="text-[11px] text-rose-750 italic mt-1 font-bold bg-white p-2 border border-rose-100/50 rounded">
                              ⚠️ "{log.observacoes}"
                            </p>
                          )}
                          <div className="text-[10px] text-slate-400 text-right">Relato: {log.dataHora.split(' ')[1]} por {log.utilizadorResponsavel}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. OBSERVAÇÕES E NOTAS DE CAMPO DO DIA (Histórico compilado de observações) */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                    <MessageSquare className="w-4 h-4 text-slate-400" /> Compilação de Observações e Notas de Campo
                  </h4>
                  <div className="space-y-2">
                    {logsDoDia.filter(l => l.observacoes).length === 0 ? (
                      <p className="text-slate-400 italic text-[11px]">Nenhuma nota de texto para esta data.</p>
                    ) : (
                      logsDoDia.filter(l => l.observacoes).map((log, idx) => (
                        <div key={idx} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs italic text-slate-650 relative leading-normal">
                          <span className="absolute top-2 right-2 text-[10px] text-slate-400 font-mono not-italic">{log.residenciaCodigo}</span>
                          <p className="font-medium">"{log.observacoes}"</p>
                          <div className="text-[10px] text-slate-400 mt-1 not-italic">
                            — Registado por <strong className="text-slate-500 font-sans">{log.utilizadorResponsavel}</strong> às {log.dataHora.split(' ')[1]} para o serviço de {log.tipo}.
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* CONTEÚDO 2: RELATÓRIO GERAL DE PROGRESSO */}
      {reportType === 'progresso' && (
        <div className="space-y-6 animate-fade-in" id="relatorio-progresso-content">
          
          {/* Dashboard Geral de Indicadores de Produção */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Card Cumulativo Geral */}
            <div className="bg-slate-905 bg-slate-900 text-white rounded-xl p-5 shadow flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[10px] text-teal-400 font-mono uppercase font-bold tracking-wider">Estado de Cobertura Cumulativa</span>
                <h3 className="text-base font-bold font-sans mt-1">Percentagem Global de Execução</h3>
              </div>
              
              <div className="text-center py-3">
                <span className="text-4xl font-extrabold font-sans text-teal-400 tracking-tight">{percentExecucaoGeral}%</span>
                <p className="text-[10px] text-slate-300 mt-1 uppercase font-mono font-bold">Taxa cumprida</p>
              </div>

              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-400 rounded-full transition-all duration-1000"
                  style={{ width: `${percentExecucaoGeral}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-400 leading-snug">
                As brigadas concluíram com êxito {totalServicosConcluidos} intervenções das {totalServicosEsperados} estimas globais da base cadastral.
              </p>
            </div>

            {/* Progresso Fumigação */}
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Campanha Preventiva</span>
                <h3 className="text-xs font-bold text-slate-800 font-sans mt-0.5">Fumigação de Residências</h3>
              </div>

              <div className="text-center py-2">
                <span className="text-3xl font-extrabold text-teal-600 font-sans">{percentFum}%</span>
                <p className="text-[10px] text-slate-400 font-medium">Casas Finalizadas</p>
              </div>

              <div className="space-y-1">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-teal-600 rounded-full"
                    style={{ width: `${percentFum}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-450 pt-1 font-semibold">
                  <span>{concluidasFum} concluídas</span>
                  <span>{totalCasas - concluidasFum} pendentes</span>
                </div>
              </div>

              <div className="text-[10px] bg-slate-50 text-slate-550 border border-slate-100 p-2 rounded italic">
                Cobre segurança preventiva contra pragas urbanas e transmissores.
              </div>
            </div>

            {/* Progresso ACS */}
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow flex flex-col justify-between space-y-3">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Campanha Climatização</span>
                <h3 className="text-xs font-bold text-slate-805 font-sans mt-0.5">Manutenção de ACS</h3>
              </div>

              <div className="text-center py-2">
                <span className="text-3xl font-extrabold text-indigo-650 text-indigo-600 font-sans">{percentACS}%</span>
                <p className="text-[10px] text-slate-400 font-medium font-sans">Casas Reguladas</p>
              </div>

              <div className="space-y-1">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${percentACS}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-450 pt-1 font-semibold">
                  <span>{concluidasACS} concluídas</span>
                  <span>{totalCasas - concluidasACS} pendentes</span>
                </div>
              </div>

              <div className="text-[10px] bg-slate-50 text-slate-550 border border-slate-100 p-2 rounded italic">
                Inspeção a vasos térmicos, válvulas de escape e pressões hídricas.
              </div>
            </div>

          </div>

          {/* Audit Trail e Tabela Completa de Auditoria por Zonas */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-sans font-bold text-slate-800">Censo Operacional Geográfico</h3>
                <p className="text-slate-500 text-xs">Mapeamento detalhado do cumprimento de obrigações assistidas por zona administrativa.</p>
              </div>
              <MapPin className="w-4.5 h-4.5 text-slate-400" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-650" id="zona-distribution-report-table">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-400 uppercase tracking-wider text-[10px] bg-slate-50/50">
                    <th className="py-2.5 px-3">Zona</th>
                    <th className="py-2.5 text-center">Fumigação OK</th>
                    <th className="py-2.5 text-center">ACS OK</th>
                    <th className="py-2.5 text-center">Pendente Geral (Casas a intervir)</th>
                    <th className="py-2.5 text-right px-3">Esforço Estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-105">
                  {Object.entries(zonasCalculadas).map(([zona, stats]) => {
                    const fumP = Math.round((stats.fumOk / stats.total) * 100);
                    const acsP = Math.round((stats.acsOk / stats.total) * 100);
                    const casasComPendencia = stats.total - (stats.fumOk === stats.total && stats.acsOk === stats.total ? stats.total : Math.min(stats.fumOk, stats.acsOk));
                    
                    return (
                      <tr key={zona} className="hover:bg-slate-50/40 transition">
                        <td className="py-2.5 px-3 font-bold text-slate-800">{zona}</td>
                        <td className="py-2.5 text-center">
                          <span className="font-semibold text-slate-700 font-mono">{stats.fumOk} / {stats.total}</span>
                          <span className="text-[9px] text-slate-450 block font-semibold">({fumP}%)</span>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className="font-semibold text-slate-750 font-mono">{stats.acsOk} / {stats.total}</span>
                          <span className="text-[9px] text-slate-450 block font-semibold">({acsP}%)</span>
                        </td>
                        <td className="py-2.5 text-center text-amber-600 font-bold font-mono">
                          {casasComPendencia} casas
                        </td>
                        <td className="py-2.5 text-right px-3 font-medium">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            casasComPendencia === 0 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {casasComPendencia === 0 ? 'Completo' : 'Visitas pendentes'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
