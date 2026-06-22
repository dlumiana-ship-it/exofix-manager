import React, { useState } from 'react';
import { 
  Building,
  Search, 
  MapPin, 
  Plus, 
  Edit3, 
  Eye, 
  Phone, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle,
  FolderSync,
  X,
  PlusCircle,
  Save,
  Trash2
} from 'lucide-react';
import { Residencia, Empresa, IntervencaoHistorico, EstadoIntervencao } from '../types';

interface ResidenciasManagerProps {
  residencias: Residencia[];
  empresas: Empresa[];
  historico: IntervencaoHistorico[];
  onAddResidencia: (nova: Omit<Residencia, 'id' | 'codigo'>) => void;
  onUpdateResidencia: (atualizada: Residencia) => void;
  onExcluirResidencia: (id: string) => void;
}

export default function ResidenciasManager({ 
  residencias, 
  empresas, 
  historico, 
  onAddResidencia, 
  onUpdateResidencia,
  onExcluirResidencia
}: ResidenciasManagerProps) {
  // Estados para filtro e pesquisa
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZona, setSelectedZona] = useState('Todos');
  const [selectedEstadoFum, setSelectedEstadoFum] = useState('Todos');
  const [selectedEstadoACS, setSelectedEstadoACS] = useState('Todos');
  const [selectedEmpresa, setSelectedEmpresa] = useState('Todos');

  // Estados para Modal de adicionar/editar
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingResidencia, setEditingResidencia] = useState<Residencia | null>(null);
  
  // Dados do formulário
  const [nomeOcupante, setNomeOcupante] = useState('');
  const [telefonePrincipal, setTelefonePrincipal] = useState('');
  const [telefoneAlternativo, setTelefoneAlternativo] = useState('');
  const [bairro, setBairro] = useState('');
  const [endereco, setEndereco] = useState('');
  const [observacoesGerais, setObservacoesGerais] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [estadoFumigacao, setEstadoFumigacao] = useState<EstadoIntervencao>('Agendada');
  const [estadoACS, setEstadoACS] = useState<EstadoIntervencao>('Agendada');

  // Estado para Visualização de Histórico Completo
  const [selectedDetailResidencia, setSelectedDetailResidencia] = useState<Residencia | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const itemsPerPage = showAll ? 1000 : 10;

  // Lista única de zonas para dropdown
  const zonasDisponiveis = Array.from(new Set(residencias.map(r => r.bairro))).sort();

  // Filtragem inteligente
  const residenciasFiltradas = residencias.filter(res => {
    const correspondePesquisa = 
      res.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.nomeOcupante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.endereco.toLowerCase().includes(searchTerm.toLowerCase());
    
    const correspondeZona = selectedZona === 'Todos' || res.bairro === selectedZona;
    const correspondeFum = selectedEstadoFum === 'Todos' || res.estadoFumigacao === selectedEstadoFum;
    const correspondeACS = selectedEstadoACS === 'Todos' || res.estadoACS === selectedEstadoACS;
    const correspondeEmpresa = selectedEmpresa === 'Todos' || res.empresaId === selectedEmpresa;

    return correspondePesquisa && correspondeZona && correspondeFum && correspondeACS && correspondeEmpresa;
  });

  // Cálculo de paginação
  const totalPages = Math.ceil(residenciasFiltradas.length / itemsPerPage);
  const paginatedResidencias = residenciasFiltradas.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const resetForm = () => {
    setNomeOcupante('');
    setTelefonePrincipal('');
    setTelefoneAlternativo('');
    setBairro(zonasDisponiveis[0] || 'ZONA BEIRA');
    setEndereco('');
    setObservacoesGerais('');
    setEmpresaId(empresas[0]?.id || '');
    setEstadoFumigacao('Agendada');
    setEstadoACS('Agendada');
    setEditingResidencia(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  const openEditModal = (res: Residencia) => {
    setEditingResidencia(res);
    setNomeOcupante(res.nomeOcupante);
    setTelefonePrincipal(res.telefonePrincipal);
    setTelefoneAlternativo(res.telefoneAlternativo);
    setBairro(res.bairro);
    setEndereco(res.endereco);
    setObservacoesGerais(res.observacoesGerais);
    setEmpresaId(res.empresaId);
    setEstadoFumigacao(res.estadoFumigacao);
    setEstadoACS(res.estadoACS);
    setShowFormModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeOcupante || !bairro || !endereco) {
      alert('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    if (editingResidencia) {
      onUpdateResidencia({
        ...editingResidencia,
        nomeOcupante,
        telefonePrincipal,
        telefoneAlternativo,
        bairro,
        endereco,
        observacoesGerais,
        empresaId,
        estadoFumigacao,
        estadoACS,
      });
    } else {
      onAddResidencia({
        nomeOcupante,
        telefonePrincipal,
        telefoneAlternativo,
        bairro,
        endereco,
        observacoesGerais,
        empresaId,
        estadoFumigacao,
        estadoACS,
        ultimaFumigacao: estadoFumigacao === 'Concluída' ? '2026-06-22' : 'Nenhuma',
        ultimaACS: estadoACS === 'Concluída' ? '2026-06-22' : 'Nenhuma',
      });
    }
    setShowFormModal(false);
    resetForm();
  };

  const handleExcluir = (id: string, codigo: string) => {
    if (confirm(`Tem a certeza que deseja remover a residência ${codigo}? Esta ação não pode ser desfeita.`)) {
      onExcluirResidencia(id);
      if (selectedDetailResidencia?.id === id) {
        setSelectedDetailResidencia(null);
      }
    }
  };

  const renderStatusBadge = (estado: EstadoIntervencao) => {
    let classes = "";
    switch (estado) {
      case 'Concluída':
        classes = "bg-green-50 text-green-700 border-green-250 ring-green-600/20";
        break;
      case 'Em andamento':
        classes = "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20";
        break;
      case 'Agendada':
        classes = "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20";
        break;
      case 'Não realizada':
        classes = "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20";
        break;
      case 'Pendente':
        classes = "bg-slate-50 text-slate-700 border-slate-200 ring-slate-600/20";
        break;
      case 'Atrasada':
        classes = "bg-rose-50 text-rose-750 border-rose-300 ring-rose-600/20 font-bold animate-pulse";
        break;
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${classes}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${
          estado === 'Concluída' ? 'bg-green-600' :
          estado === 'Em andamento' ? 'bg-amber-500' :
          estado === 'Agendada' ? 'bg-blue-500' :
          estado === 'Atrasada' ? 'bg-rose-600' : 'bg-slate-400'
        }`} />
        {estado}
      </span>
    );
  };

  // Filtrar histórico para a casa selecionada
  const historicoCasaSelecionada = selectedDetailResidencia 
    ? historico.filter(h => h.residenciaId === selectedDetailResidencia.id).sort((a,b) => b.dataHora.localeCompare(a.dataHora))
    : [];

  return (
    <div className="space-y-6" id="residencias-manager-root">
      
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-sans font-bold text-gray-800 flex items-center gap-2">
            <Building className="text-blue-600 w-5 h-5" /> Base de Dados de Residências
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Cadastre, edite, atribua e consulte informações operacionais de todas as unidades residenciais e seus históricos.
          </p>
        </div>
        <button
          onClick={openAddModal}
          id="btn-add-residencia"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Registar Residência
        </button>
      </div>

      {/* Painel Avançado de Filtros e Pesquisa */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Filtros Operacionais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Caixa de Texto Pesquisa */}
          <div className="relative md:col-span-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar ocupante, cód..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Filtro Zona */}
          <div>
            <select
              value={selectedZona}
              onChange={(e) => {
                setSelectedZona(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-750 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="Todos">🏡 Zona: Todos</option>
              {zonasDisponiveis.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Filtro Estado Fumigação */}
          <div>
            <select
              value={selectedEstadoFum}
              onChange={(e) => {
                setSelectedEstadoFum(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-750 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="Todos">🐜 Fumigação: Todos</option>
              <option value="Agendada">Agendada</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluída">Concluída</option>
              <option value="Não realizada">Não realizada</option>
            </select>
          </div>

          {/* Filtro Estado ACS */}
          <div>
            <select
              value={selectedEstadoACS}
              onChange={(e) => {
                setSelectedEstadoACS(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-750 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="Todos">🔥 ACS: Todos</option>
              <option value="Agendada">Agendada</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluída">Concluída</option>
              <option value="Não realizada">Não realizada</option>
            </select>
          </div>

          {/* Filtro Empresa */}
          <div>
            <select
              value={selectedEmpresa}
              onChange={(e) => {
                setSelectedEmpresa(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-750 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              <option value="Todos">🏢 Empresa Atribuída: Todos</option>
              {empresas.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nome}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabela Principal de Resultados */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" id="residence-table-container">
        
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-gray-550 font-medium">
          <div className="flex items-center gap-3">
            <span>A mostrar <strong className="text-gray-800">{residenciasFiltradas.length}</strong> de <strong className="text-gray-800">{residencias.length}</strong> residências cadastradas.</span>
            <div className="flex bg-gray-200 p-0.5 rounded-lg text-[10px] shrink-0 border border-gray-300">
              <button
                type="button"
                onClick={() => { setShowAll(false); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  !showAll ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Paginado (10)
              </button>
              <button
                type="button"
                onClick={() => { setShowAll(true); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  showAll ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                Ver Lista Completa
              </button>
            </div>
          </div>
          {searchTerm || selectedZona !== 'Todos' || selectedEstadoFum !== 'Todos' || selectedEstadoACS !== 'Todos' || selectedEmpresa !== 'Todos' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedZona('Todos');
                setSelectedEstadoFum('Todos');
                setSelectedEstadoACS('Todos');
                setSelectedEmpresa('Todos');
                setCurrentPage(1);
              }}
              className="text-blue-600 hover:text-blue-700 font-bold"
            >
              Limpar Filtros
            </button>
          ) : null}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="residencias-main-table">
            <thead>
              <tr className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-200 font-bold">
                <th className="py-3 px-4">Código / Ocupante</th>
                <th className="py-3 px-4">Localização (Zona)</th>
                <th className="py-3 px-4 text-center">Fumigação</th>
                <th className="py-3 px-4 text-center">Manutenção ACS</th>
                <th className="py-3 px-4">Prestadora Atribuída</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700 text-xs">
              {paginatedResidencias.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400 italic">
                    Nenhuma residência corresponde aos filtros estabelecidos.
                  </td>
                </tr>
              ) : (
                paginatedResidencias.map((res) => {
                  const empresaResp = empresas.find(e => e.id === res.empresaId);
                  return (
                    <tr key={res.id} className="hover:bg-gray-50/70 transition duration-150" id={`row-${res.id}`}>
                      {/* Código e Ocupante */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-blue-600">{res.codigo}</div>
                        <div className="font-bold text-gray-800 mt-0.5">{res.nomeOcupante}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-300" /> {res.telefonePrincipal}
                        </div>
                      </td>

                      {/* Zona e Endereço */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                          <MapPin className="w-3 h-3 text-gray-400" /> {res.bairro}
                        </span>
                        <p className="text-[11px] text-gray-500 truncate mt-1" title={res.endereco}>
                          {res.endereco}
                        </p>
                      </td>

                      {/* Estado Fumigação */}
                      <td className="py-3.5 px-4 text-center">
                        {renderStatusBadge(res.estadoFumigacao)}
                        {res.ultimaFumigacao !== 'Nenhuma' && (
                          <div className="text-[9px] text-slate-400 mt-1 font-mono">Última: {res.ultimaFumigacao}</div>
                        )}
                      </td>

                      {/* Estado ACS */}
                      <td className="py-3.5 px-4 text-center">
                        {renderStatusBadge(res.estadoACS)}
                        {res.ultimaACS !== 'Nenhuma' && (
                          <div className="text-[9px] text-slate-400 mt-1 font-mono">Última: {res.ultimaACS}</div>
                        )}
                      </td>

                      {/* Empresa Responsável */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 truncate max-w-[150px]">
                          {empresaResp ? empresaResp.nome.split(' (')[0] : 'Não atribuída'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {empresaResp ? `CONTACTO: ${empresaResp.contactoPrincipal}` : ''}
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedDetailResidencia(res)}
                            title="Ver Ficha & Histórico"
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-gray-100 rounded transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(res)}
                            title="Editar Dados"
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-gray-100 rounded transition"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExcluir(res.id, res.codigo)}
                            title="Eliminar Casa"
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs" id="pagination-panel">
            <span className="text-gray-500 font-medium">
              Página <strong className="text-gray-800">{currentPage}</strong> de <strong className="text-gray-800">{totalPages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 text-gray-700 font-bold transition disabled:opacity-50 disabled:pointer-events-none"
              >
                Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 text-gray-700 font-bold transition disabled:opacity-50 disabled:pointer-events-none"
              >
                Seguinte
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Registo e Edição de Residência */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="residencia-form-modal">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="bg-[#111827] px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider">
                {editingResidencia ? `Editar Residência – ${editingResidencia.codigo}` : 'Registar Nova Unidade Residencial'}
              </h3>
              <button 
                onClick={() => setShowFormModal(false)}
                className="p-1 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Formulário */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nome Ocupante */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nome do Ocupante *</label>
                  <input
                    type="text"
                    required
                    value={nomeOcupante}
                    onChange={(e) => setNomeOcupante(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="Ex: Anabela Sitoe"
                  />
                </div>

                {/* Telefone Principal */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone Principal *</label>
                  <input
                    type="text"
                    required
                    value={telefonePrincipal}
                    onChange={(e) => setTelefonePrincipal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="Ex: +258 84 111 2222"
                  />
                </div>

                {/* Telefone Alternativo */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone Alternativo</label>
                  <input
                    type="text"
                    value={telefoneAlternativo}
                    onChange={(e) => setTelefoneAlternativo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="Ex: +258 82 233 4455"
                  />
                </div>

                {/* Zona */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Zona *</label>
                  <select
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-750 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {zonasDisponiveis.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                    {!zonasDisponiveis.includes(bairro) && bairro && (
                      <option value={bairro}>{bairro}</option>
                    )}
                    <option value="ZONA BEIRA">ZONA BEIRA</option>
                    <option value="ZONA MUNHAVA">ZONA MUNHAVA</option>
                    <option value="ZONA MANGA">ZONA MANGA</option>
                    <option value="ZONA INHAMIZUA">ZONA INHAMIZUA</option>
                    <option value="ZONA CHIMOIO">ZONA CHIMOIO</option>
                    <option value="ZONA TETE">ZONA TETE</option>
                  </select>
                </div>

                {/* Empresa Prestadora de Serviços */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Empresa Prestadora Responsável *</label>
                  <select
                    value={empresaId}
                    onChange={(e) => setEmpresaId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-750 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="">-- Selecione uma Empresa --</option>
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.nome}</option>
                    ))}
                  </select>
                </div>

                {/* Endereço Detalhado */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Endereço Detalhado *</label>
                  <input
                    type="text"
                    required
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Ex: Av. Julius Nyerere, nº 1400, Bloco C, Apt 21"
                  />
                </div>

                {/* Estado Fumigação (Caso queira definir manualmente na edição) */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estado de Fumigação</label>
                  <select
                    value={estadoFumigacao}
                    onChange={(e) => setEstadoFumigacao(e.target.value as EstadoIntervencao)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-750 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="Agendada">Agendada</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Não realizada">Não realizada</option>
                  </select>
                </div>

                {/* Estado ACS */}
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estado de Manutenção ACS</label>
                  <select
                    value={estadoACS}
                    onChange={(e) => setEstadoACS(e.target.value as EstadoIntervencao)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-750 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    <option value="Agendada">Agendada</option>
                    <option value="Em andamento">Em andamento</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Não realizada">Não realizada</option>
                  </select>
                </div>

                {/* Observações Gerais */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-700 mb-1">Observações Gerais</label>
                  <textarea
                    value={observacoesGerais}
                    onChange={(e) => setObservacoesGerais(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                    placeholder="Notas internas da Exofix sobre a residência, preferências de horário, segurança, etc."
                  />
                </div>
              </div>

              {/* Ações do Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 pointer-events-auto transition font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 text-xs"
                >
                  <Save className="w-4 h-4" /> Guardar Dados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER/MODAL: Histórico e Ficha Completa da Residência */}
      {selectedDetailResidencia && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-end z-50 animate-slide-in" id="residencia-history-drawer">
          <div className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-gray-200 flex flex-col overflow-hidden">
            {/* Header Drawer */}
            <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] text-teal-400 font-mono tracking-wider uppercase">Ficha da Unidade</span>
                <h3 className="text-base font-sans font-bold mt-1">
                  Residência {selectedDetailResidencia.codigo}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedDetailResidencia(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Drawer */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              
              {/* Informações Básicas de Identificação */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-1">
                  📋 Informações Básicas
                </h4>
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ocupante</span>
                    <span className="text-sm font-bold text-slate-800">{selectedDetailResidencia.nomeOcupante}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Telefone Principal</span>
                    <span className="font-mono text-slate-800 font-semibold">{selectedDetailResidencia.telefonePrincipal}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Telefone Alternativo</span>
                    <span className="font-mono text-slate-800">{selectedDetailResidencia.telefoneAlternativo || 'Nenhum'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Endereço (Zona: {selectedDetailResidencia.bairro})</span>
                    <span className="text-slate-705 leading-relaxed font-medium">{selectedDetailResidencia.endereco}</span>
                  </div>
                  {selectedDetailResidencia.observacoesGerais && (
                    <div className="col-span-2 border-t border-slate-150 pt-2.5">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Notas Gerais</span>
                      <p className="text-slate-650 italic mt-0.5">"{selectedDetailResidencia.observacoesGerais}"</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status de Serviço */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-1">
                  ⚡ Estado Operacional Corrente
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Fumigação</span>
                    <div className="inline-block">{renderStatusBadge(selectedDetailResidencia.estadoFumigacao)}</div>
                    <span className="text-[9px] text-slate-400 block font-mono">Última: {selectedDetailResidencia.ultimaFumigacao}</span>
                  </div>
                  <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-center space-y-1.5">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Manutenção ACS</span>
                    <div className="inline-block">{renderStatusBadge(selectedDetailResidencia.estadoACS)}</div>
                    <span className="text-[9px] text-slate-400 block font-mono">Última: {selectedDetailResidencia.ultimaACS}</span>
                  </div>
                </div>
              </div>

              {/* Histórico Completo de Mudanças de Estado */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1.5 flex items-center gap-1 mb-2">
                  ⏳ Linha do Tempo e Histórico de Intervenções
                </h4>

                {historicoCasaSelecionada.length === 0 ? (
                  <p className="text-slate-400 italic text-center py-6 bg-slate-50 rounded-lg">
                    Ainda não há intervenções registadas para esta casa no histórico.
                  </p>
                ) : (
                  <div className="relative border-l border-slate-200 pl-4 space-y-5 ml-1.5">
                    {historicoCasaSelecionada.map((item, index) => {
                      let nodeColor = "bg-blue-500";
                      if (item.estadoNovo === 'Concluída') nodeColor = "bg-green-600";
                      if (item.estadoNovo === 'Não realizada') nodeColor = "bg-rose-600";
                      if (item.estadoNovo === 'Em andamento') nodeColor = "bg-amber-500";

                      return (
                        <div key={item.id} className="relative text-xs" id={`history-item-${item.id}`}>
                          {/* Timeline dot */}
                          <span className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white ${nodeColor}`} />
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-slate-400">
                            <span className="font-mono text-slate-500 font-semibold">{item.dataHora}</span>
                            <span>Executado por: <strong className="text-slate-600">{item.utilizadorResponsavel}</strong></span>
                          </div>

                          <div className="mt-1 bg-white p-3 rounded-xl border border-slate-100 shadow-sm space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 text-[11px]">{item.tipo}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                item.estadoNovo === 'Concluída' ? 'text-green-700 bg-green-50' :
                                item.estadoNovo === 'Não realizada' ? 'text-rose-700 bg-rose-50' :
                                item.estadoNovo === 'Em andamento' ? 'text-amber-700 bg-amber-50' : 'text-blue-700 bg-blue-50'
                              }`}>
                                {item.estadoAnterior} → {item.estadoNovo}
                              </span>
                            </div>
                            
                            {item.observacoes && (
                              <p className="text-slate-650 italic mt-1 bg-slate-50/50 p-2 rounded border border-slate-100 leading-normal">
                                "{item.observacoes}"
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Ações Rápidas do Drawer Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 shrink-0">
              <button
                onClick={() => {
                  openEditModal(selectedDetailResidencia);
                }}
                className="w-full text-center py-2.5 bg-slate-800 hover:bg-slate-950 text-white font-semibold rounded-lg transition text-xs"
              >
                Editar Informações da Casa
              </button>
              <button
                onClick={() => {
                  setSelectedDetailResidencia(null);
                }}
                className="w-1/3 text-center py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition text-xs font-semibold"
              >
                Fechar Ficha
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
