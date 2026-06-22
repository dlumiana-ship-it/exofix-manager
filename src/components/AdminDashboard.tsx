import { useState } from 'react';
import { 
  Home, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  MapPin, 
  Users,
  Activity
} from 'lucide-react';
import { Residencia, Empresa, IntervencaoHistorico } from '../types';

interface AdminDashboardProps {
  residencias: Residencia[];
  empresas: Empresa[];
  historico: IntervencaoHistorico[];
  onNavigateTo: (tab: string) => void;
}

export default function AdminDashboard({ residencias, empresas, historico, onNavigateTo }: AdminDashboardProps) {
  // 1. Cálculos de Indicadores Principais
  const totalResidencias = residencias.length;
  
  // Total de residências "Concluídas" (Consideramos concluída se ambos os serviços estão Concluídos ou se não há pendentes)
  const concluidas = residencias.filter(r => r.estadoFumigacao === 'Concluída' && r.estadoACS === 'Concluída').length;
  
  // Agendadas (pelo menos um serviço agendado, e nenhum em andamento)
  const agendadas = residencias.filter(r => 
    (r.estadoFumigacao === 'Agendada' || r.estadoACS === 'Agendada') && 
    r.estadoFumigacao !== 'Em andamento' && r.estadoACS !== 'Em andamento'
  ).length;

  // Em andamento (pelo menos um em andamento)
  const emAndamento = residencias.filter(r => r.estadoFumigacao === 'Em andamento' || r.estadoACS === 'Em andamento').length;

  // Pendentes / Não Realizadas (restantes ou específicas)
  const naoRealizadas = residencias.filter(r => r.estadoFumigacao === 'Não realizada' || r.estadoACS === 'Não realizada').length;
  const pendentesGerais = totalResidencias - concluidas;

  // 2. Indicadores de progresso por tipo de serviço
  const fumConcluidas = residencias.filter(r => r.estadoFumigacao === 'Concluída').length;
  const acsConcluidas = residencias.filter(r => r.estadoACS === 'Concluída').length;

  const percentFumigacao = totalResidencias > 0 ? Math.round((fumConcluidas / totalResidencias) * 100) : 0;
  const percentACS = totalResidencias > 0 ? Math.round((acsConcluidas / totalResidencias) * 100) : 0;
  
  // Progresso Geral (Média ponderada de ambos os serviços realizados em 50 casas)
  const totalServicosRealizados = fumConcluidas + acsConcluidas;
  const totalServicosPlaneados = totalResidencias * 2;
  const percentGeral = totalServicosPlaneados > 0 
    ? Math.round((totalServicosRealizados / totalServicosPlaneados) * 100) 
    : 0;

  // 3. Distribuição por Zonas (Bento Grid Visual)
  const zonasStats = residencias.reduce((acc: { [key: string]: { total: number, fumOk: number, acsOk: number } }, r) => {
    if (!acc[r.bairro]) {
      acc[r.bairro] = { total: 0, fumOk: 0, acsOk: 0 };
    }
    acc[r.bairro].total += 1;
    if (r.estadoFumigacao === 'Concluída') acc[r.bairro].fumOk += 1;
    if (r.estadoACS === 'Concluída') acc[r.bairro].acsOk += 1;
    return acc;
  }, {});

  // 4. Atividades recentes (últimos 5 registos históricos)
  const ultimasAtividades = historico.slice().reverse().slice(0, 5);

  // 5. Comentários Recentes relevantes
  const comentariosRecentes = historico
    .filter(h => h.observacoes && h.observacoes.trim() !== '')
    .slice()
    .reverse()
    .slice(0, 4);

  return (
    <div className="space-y-6" id="admin-dashboard-root">
      
      {/* Banner de Boas-vindas */}
      <div className="bg-[#111827] text-white rounded-xl p-6 shadow-sm border border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4" id="welcome-banner">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-blue-500/10 text-blue-400 text-[10px] tracking-wider uppercase font-mono border border-blue-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Painel de Supervisão Geral
          </div>
          <h1 className="text-xl font-sans font-bold tracking-tight text-white">Olá, Administrador Exofix</h1>
          <p className="text-gray-400 text-xs mt-1 max-w-xl">
            Acompanhe a execução das fumigações e das manutenções de ACS em tempo real. Veja indicadores, controle as residências e distribua com eficiência.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => onNavigateTo('planeamento')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition shadow-sm"
          >
            Novo Planeamento
          </button>
          <button
            onClick={() => onNavigateTo('residencias')}
            className="px-4 py-2 bg-transparent text-gray-300 border border-gray-705 border-gray-700 hover:bg-gray-800 rounded-lg text-xs font-semibold transition"
          >
            Ver Residências
          </button>
        </div>
      </div>

      {/* Grid de Indicadores Principais - KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="kpi-grid">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-xs block font-semibold uppercase tracking-wider">Residências</span>
            <span className="text-2xl font-bold font-sans text-gray-900 mt-1 block">{totalResidencias}</span>
            <span className="text-[10px] text-gray-450 font-medium mt-1 inline-block">Mapeadas no total</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gray-50 text-gray-650 flex items-center justify-center shrink-0 border border-gray-200">
            <Home className="w-4.5 h-4.5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-xs block font-semibold uppercase tracking-wider">Concluídas</span>
            <span className="text-2xl font-bold font-sans text-green-600 mt-1 block">{concluidas}</span>
            <span className="text-[10px] text-green-605 font-medium mt-1 inline-block">100% Executadas</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-green-50 text-green-605 flex items-center justify-center shrink-0 border border-green-200">
            <CheckCircle2 className="w-4.5 h-4.5 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-xs block font-semibold uppercase tracking-wider">Agendadas</span>
            <span className="text-2xl font-bold font-sans text-blue-600 mt-1 block">{agendadas}</span>
            <span className="text-[10px] text-blue-500 font-medium mt-1 inline-block">Em carteira</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-650 flex items-center justify-center shrink-0 border border-blue-200">
            <Calendar className="w-4.5 h-4.5 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-gray-500 text-xs block font-semibold uppercase tracking-wider">Em Andamento</span>
            <span className="text-2xl font-bold font-sans text-amber-500 mt-1 block">{emAndamento}</span>
            <span className="text-[10px] text-amber-600 font-medium mt-1 inline-block">Equipas no terreno</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200">
            <Clock className="w-4.5 h-4.5 text-amber-500" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between col-span-2 lg:col-span-1">
          <div>
            <span className="text-gray-500 text-xs block font-semibold uppercase tracking-wider">Problemas</span>
            <span className="text-2xl font-bold font-sans text-rose-600 mt-1 block">{naoRealizadas}</span>
            <span className="text-[10px] text-rose-500 font-medium mt-1 inline-block">Requerem atenção</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Grid de Indicadores de Progresso e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="progress-and-activities">
        
        {/* Coluna 1 & 2: Progresso e Bairros */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card de Progresso Operacional */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-sans font-bold text-gray-850">Progresso Operacional Geral</h3>
                <p className="text-gray-500 text-xs">Visão geral da taxa de conclusão dos dois principais vetores</p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>

            {/* Barra Geral de Execução */}
            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <span className="text-xs font-semibold text-gray-700">Taxa Geral de Execução Cumulativa</span>
                <span className="text-base font-bold text-gray-900">{percentGeral}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-lg overflow-hidden border border-gray-150">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg transition-all duration-1000"
                  style={{ width: `${percentGeral}%` }}
                />
              </div>
              <p className="text-[10px] text-gray-400">
                Calculado com base em {totalServicosRealizados} intervenções concluídas de {totalServicosPlaneados} programadas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Barra Fumigações */}
              <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-700">Fumigações Concluídas</span>
                  <span className="text-sm font-bold text-blue-600">{percentFumigacao}%</span>
                </div>
                <div className="w-full h-2 bg-gray-205 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                    style={{ width: `${percentFumigacao}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-550 block font-medium">{fumConcluidas} de {totalResidencias} casas higienizadas</span>
              </div>

               {/* Barra ACS */}
              <div className="p-3.5 rounded-lg border border-gray-200 bg-gray-50 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-700">Manutenções ACS Concluídas</span>
                  <span className="text-sm font-bold text-indigo-650 text-indigo-600">{percentACS}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-650 bg-indigo-600 rounded-full transition-all duration-1000"
                    style={{ width: `${percentACS}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-550 block font-medium">{acsConcluidas} de {totalResidencias} aquecedores vistoriados</span>
              </div>
            </div>
          </div>

          {/* Cobertura Geográfica por Zona */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-sans font-bold text-gray-850">Cobertura por Zona</h3>
                <p className="text-gray-500 text-xs">Mapeamento operacional das atividades nas zonas de atuação</p>
              </div>
              <MapPin className="w-4.5 h-4.5 text-gray-400" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700" id="zona-coverage-table">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-2.5">Zona</th>
                    <th className="py-2.5 text-center">Fumigação OK</th>
                    <th className="py-2.5 text-center">ACS OK</th>
                    <th className="py-2.5 text-right font-semibold">Casas Totais</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {Object.entries(zonasStats).map(([zona, stats]) => {
                    const fumPercent = Math.round((stats.fumOk / stats.total) * 100);
                    const acsPercent = Math.round((stats.acsOk / stats.total) * 100);
                    return (
                      <tr key={zona} className="hover:bg-gray-50/70 transition">
                        <td className="py-2.5 font-bold text-gray-800">{zona}</td>
                        <td className="py-2.5 text-center">
                          <span className={`inline-flex items-center gap-1 font-mono text-xs ${fumPercent === 100 ? 'text-blue-600 font-bold' : 'text-gray-600'}`}>
                            {stats.fumOk}/{stats.total} 
                            <span className="text-[10px] text-gray-400">({fumPercent}%)</span>
                          </span>
                        </td>
                        <td className="py-2.5 text-center">
                          <span className={`inline-flex items-center gap-1 font-mono text-xs ${acsPercent === 100 ? 'text-indigo-650 text-indigo-600 font-bold' : 'text-gray-655 text-gray-600'}`}>
                            {stats.acsOk}/{stats.total}
                            <span className="text-[10px] text-gray-400">({acsPercent}%)</span>
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-gray-700">{stats.total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Coluna 3: Atividade Recente e Comentários */}
        <div className="space-y-6">
          
          {/* Card de Atividade Recente */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-sans font-bold text-gray-850">Atividade Recente</h3>
                <p className="text-gray-500 text-[11px]">Últimas intervenções registadas</p>
              </div>
              <Activity className="w-4 h-4 text-blue-600" />
            </div>

            <div className="space-y-3.5">
              {ultimasAtividades.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-4">Sem registo de atividades.</p>
              ) : (
                ultimasAtividades.map((act) => {
                  let badgeColor = "bg-blue-50 text-blue-700 ring-blue-600/10";
                  if (act.estadoNovo === 'Concluída') badgeColor = "bg-green-50 text-green-700 ring-green-600/10";
                  if (act.estadoNovo === 'Em andamento') badgeColor = "bg-amber-50 text-amber-700 ring-amber-600/10";
                  if (act.estadoNovo === 'Não realizada') badgeColor = "bg-rose-50 text-rose-700 ring-rose-600/10";

                  return (
                    <div key={act.id} className="text-xs border-b border-gray-100 pb-2.5 last:border-b-0 last:pb-0 font-medium" id={`act-${act.id}`}>
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="font-bold text-gray-800">{act.residenciaCodigo} ({act.residenciaNome})</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ring-1 ring-inset ${badgeColor}`}>
                          {act.estadoNovo}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-500">
                        <span>{act.tipo} por <strong className="text-gray-600">{act.utilizadorResponsavel}</strong></span>
                        <span className="font-mono text-[9px]">{act.dataHora.split(' ')[1] || act.dataHora}</span>
                      </div>
                      {act.observacoes && (
                        <p className="mt-1 text-[11px] text-gray-550 bg-gray-50 p-1.5 rounded italic border border-gray-150">
                          "{act.observacoes}"
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            
            <button
              onClick={() => onNavigateTo('relatorios')}
              className="w-full text-center py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-150 hover:bg-blue-100 rounded-lg transition"
            >
              Consultar Histórico Completo
            </button>
          </div>

          {/* Últimas Observações / Diário Operacional */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-sans font-bold text-gray-850">Notas de Campo</h3>
                <p className="text-gray-500 text-[11px]">Últimos comentários nas residências</p>
              </div>
              <MessageSquare className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-3">
              {comentariosRecentes.length === 0 ? (
                <p className="text-gray-400 text-xs text-center py-4">Nenhuma observação registada no momento.</p>
              ) : (
                comentariosRecentes.map((com) => (
                  <div key={com.id} className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-gray-800">{com.residenciaCodigo} - {com.tipo}</span>
                      <span className="text-gray-400 font-mono text-[9px]">{com.dataHora.split(' ')[0]}</span>
                    </div>
                    <p className="text-[11px] text-gray-600 italic">"{com.observacoes}"</p>
                    <div className="text-[9px] text-gray-400 text-right font-semibold">— {com.utilizadorResponsavel}</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
