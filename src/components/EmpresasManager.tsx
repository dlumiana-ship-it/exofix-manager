import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit2, 
  UserPlus, 
  Key, 
  Unlock, 
  Lock, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  ShieldAlert,
  Home,
  Save,
  CheckCircle,
  XCircle,
  X
} from 'lucide-react';
import { Empresa, Residencia } from '../types';

interface EmpresasManagerProps {
  empresas: Empresa[];
  residencias: Residencia[];
  onAddEmpresa: (nova: Omit<Empresa, 'id'>) => void;
  onUpdateEmpresa: (atualizada: Empresa) => void;
  onExcluirEmpresa: (id: string) => void;
  onBatchAssignResidencias: (empresaId: string, residenciaIds: string[]) => void;
}

export default function EmpresasManager({ 
  empresas, 
  residencias, 
  onAddEmpresa, 
  onUpdateEmpresa, 
  onExcluirEmpresa,
  onBatchAssignResidencias
}: EmpresasManagerProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);

  // Estados para Modal de Atribuição de Casas em Lote
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningEmpresa, setAssigningEmpresa] = useState<Empresa | null>(null);
  const [tempSelectedResIds, setTempSelectedResIds] = useState<string[]>([]);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('Todos');

  const openAssignModal = (emp: Empresa) => {
    setAssigningEmpresa(emp);
    const jáAtribuídas = residencias.filter(r => r.empresaId === emp.id).map(r => r.id);
    setTempSelectedResIds(jáAtribuídas);
    setSelectedZoneFilter('Todos');
    setShowAssignModal(true);
  };

  const zonasDisponiveis = Array.from(new Set(residencias.map(r => r.bairro))).sort();

  const residenciasFiltradasModal = residencias.filter(r => {
    return selectedZoneFilter === 'Todos' || r.bairro === selectedZoneFilter;
  });

  const toggleResSelection = (resId: string) => {
    if (tempSelectedResIds.includes(resId)) {
      setTempSelectedResIds(prev => prev.filter(id => id !== resId));
    } else {
      setTempSelectedResIds(prev => [...prev, resId]);
    }
  };

  const selecionarTodasFiltradas = () => {
    setTempSelectedResIds(prev => {
      const novas = [...prev];
      residenciasFiltradasModal.forEach(r => {
        if (!novas.includes(r.id)) novas.push(r.id);
      });
      return novas;
    });
  };

  const desmarcarTodasFiltradas = () => {
    const idsFiltrados = residenciasFiltradasModal.map(r => r.id);
    setTempSelectedResIds(prev => prev.filter(id => !idsFiltrados.includes(id)));
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (assigningEmpresa) {
      onBatchAssignResidencias(assigningEmpresa.id, tempSelectedResIds);
      setShowAssignModal(false);
      setAssigningEmpresa(null);
    }
  };

  // States do Formulário
  const [nome, setNome] = useState('');
  const [nuit, setNuit] = useState('');
  const [contactoPrincipal, setContactoPrincipal] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [endereco, setEndereco] = useState('');
  const [username, setUsername] = useState('');
  const [passwordKey, setPasswordKey] = useState('');
  const [ativa, setAtiva] = useState(true);

  const resetForm = () => {
    setNome('');
    setNuit('');
    setContactoPrincipal('');
    setTelefone('');
    setEmail('');
    setEndereco('');
    setUsername('');
    setPasswordKey('');
    setAtiva(true);
    setEditingEmpresa(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (emp: Empresa) => {
    setEditingEmpresa(emp);
    setNome(emp.nome);
    setNuit(emp.nuit);
    setContactoPrincipal(emp.contactoPrincipal);
    setTelefone(emp.telefone);
    setEmail(emp.email);
    setEndereco(emp.endereco);
    setUsername(emp.username);
    setPasswordKey(emp.passwordKey);
    setAtiva(emp.ativa);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !nuit || !username || !passwordKey) {
      alert('Por favor, preencha os campos obrigatórios (*).');
      return;
    }

    if (editingEmpresa) {
      onUpdateEmpresa({
        ...editingEmpresa,
        nome,
        nuit,
        contactoPrincipal,
        telefone,
        email,
        endereco,
        username,
        passwordKey,
        ativa,
      });
    } else {
      onAddEmpresa({
        nome,
        nuit,
        contactoPrincipal,
        telefone,
        email,
        endereco,
        username,
        passwordKey,
        ativa,
        isPasswordChanged: false,
      });
    }

    setShowModal(false);
    resetForm();
  };

  const handleExcluir = (id: string, nomeEmp: string) => {
    // Contar residências atribuídas
    const casasAtribuidas = residencias.filter(r => r.empresaId === id).length;
    let confirmMsg = `Tem a certeza que deseja eliminar a parceira ${nomeEmp}?`;
    if (casasAtribuidas > 0) {
      confirmMsg += `\n⚠️ ATENÇÃO: Esta empresa possui ${casasAtribuidas} residências atribuídas. Se prosseguir, estas residências ficarão desvinculadas das equipas operativas.`;
    }

    if (confirm(confirmMsg)) {
      onExcluirEmpresa(id);
    }
  };

  const toggleStatusDirectly = (emp: Empresa) => {
    onUpdateEmpresa({
      ...emp,
      ativa: !emp.ativa
    });
  };

  // Contar residências por empresa
  const obterContagemCasas = (empId: string) => {
    return residencias.filter(r => r.empresaId === empId).length;
  };

  return (
    <div className="space-y-6" id="empresas-manager-root">
      
      {/* Header do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fade-in">
        <div>
          <h2 className="text-lg font-sans font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="text-blue-600 w-5 h-5" /> Gestão de Empresas Prestadoras
          </h2>
          <p className="text-gray-500 text-xs mt-1">
            Cadastre novas empresas, forneça credenciais de acesso operacionais e acompanhe as suas parcerias ativas.
          </p>
        </div>
        <button
          onClick={openAddModal}
          id="btn-add-empresa"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition shrink-0"
        >
          <UserPlus className="w-4 h-4" /> Registar Prestadora
        </button>
      </div>

      {/* Grid de Empresas Parceiras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="empresas-grid">
        {empresas.map((emp) => {
          const numCasas = obterContagemCasas(emp.id);
          return (
            <div 
              key={emp.id} 
              id={`emp-card-${emp.id}`}
              className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-4 ${
                emp.ativa ? 'border-gray-200' : 'border-rose-200 bg-rose-50/10'
              }`}
            >
              {/* Header do Card */}
              <div className="space-y-1">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono bg-gray-50 px-2 py-0.5 rounded text-gray-500 font-bold uppercase border border-gray-200">
                    ID: {emp.id}
                  </span>
                  
                  {/* Badge Ativa / Inativa */}
                  <button
                    onClick={() => toggleStatusDirectly(emp)}
                    title="Clique para alternar o estado da conta"
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-sm border transition-all ${
                      emp.ativa 
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-150' 
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-150'
                    }`}
                  >
                    {emp.ativa ? (
                      <>
                        <ShieldCheck className="w-3 h-3 text-green-600 animate-pulse" /> Ativa
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-3 h-3 text-rose-600" /> Inativa
                      </>
                    )}
                  </button>
                </div>

                <h3 className="text-sm font-bold font-sans text-slate-900 leading-snug line-clamp-2 min-h-[40px] pt-1">
                  {emp.nome}
                </h3>
              </div>

              {/* Cor               <div className="space-y-2 border-t border-gray-150 pt-3 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">NUIT Geral:</span>
                  <span className="font-mono font-medium text-slate-800">{emp.nuit}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Pessoa de Contacto:</span>
                  <span className="font-medium text-slate-800 font-sans">{emp.contactoPrincipal}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{emp.telefone}</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0 truncate" />
                  <span className="truncate">{emp.email}</span>
                </div>

                <div className="flex items-start gap-2 text-[11px] text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <span className="line-clamp-2 leading-relaxed">{emp.endereco || 'Sem endereço'}</span>
                </div>
              </div>

              {/* Informações de Acesso e Indicador de Volume */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200 text-[11px]">
                <div className="flex justify-between items-center text-gray-600">
                  <span className="flex items-center gap-1 font-bold">
                    <Key className="w-3.5 h-3.5 text-blue-500" /> Conta Atribuída
                  </span>
                  {emp.isPasswordChanged ? (
                    <span className="text-[9px] text-green-700 bg-green-50 px-1 py-0.5 rounded font-extrabold uppercase">🔐 Alterada</span>
                  ) : (
                    <span className="text-[9px] text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-extrabold uppercase">⏳ Temporária</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1 font-mono text-xs text-slate-600 pt-1">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-sans font-bold block">Utilizador</span>
                    <span className="text-gray-800 font-extrabold">{emp.username}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase font-sans font-bold block">Palavra-passe</span>
                    <span className="text-gray-800 font-extrabold font-mono tracking-wide">{emp.passwordKey}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-250 border-gray-200 mt-1">
                  <span className="text-gray-400 uppercase text-[9px] font-bold">Casas Atribuídas:</span>
                  <span className="inline-flex items-center gap-1.5 font-sans font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    <Home className="w-3 h-3 text-blue-600" /> {numCasas} casas
                  </span>
                </div>
              </div>

              {/* Vincular Casas em Lote */}
              <button
                type="button"
                onClick={() => openAssignModal(emp)}
                className="w-full py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 shadow-sm font-sans"
              >
                <Home className="w-3.5 h-3.5" /> Vincular Casas em Lote
              </button>

              {/* Botões de Ação */}
              <div className="flex gap-2 pt-2 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => openEditModal(emp)}
                  className="flex-1 py-1.5 border border-gray-200 text-slate-655 hover:text-blue-600 hover:bg-gray-50 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleExcluir(emp.id, emp.nome)}
                  className="py-1.5 px-3 border border-gray-200 text-gray-450 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Registar ou Editar Empresa */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="empresa-form-modal">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-[#111827] px-6 py-4 flex items-center justify-between text-white shrink-0">
              <h3 className="font-sans font-bold text-xs uppercase tracking-wider">
                {editingEmpresa ? 'Editar Dados da Empresa' : 'Registar Nova Empresa Prestadora'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-800 rounded-lg transition text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nome da Empresa */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nome de Registo Comercial *</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="Ex: PestControl de Moçambique, S.A."
                  />
                </div>

                {/* NUIT */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NUIT da Empresa *</label>
                  <input
                    type="text"
                    required
                    value={nuit}
                    onChange={(e) => setNuit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="Ex: 400123456"
                  />
                </div>

                {/* Contacto Principal */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contacto Principal (Gestor) *</label>
                  <input
                    type="text"
                    required
                    value={contactoPrincipal}
                    onChange={(e) => setContactoPrincipal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="Ex: Henrique Matusse"
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telemóvel / Telefone Geral</label>
                  <input
                    type="text"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="Ex: +258 84 123 4567"
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">E-mail Corporativo</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="Ex: contacto@ecopest.co.mz"
                  />
                </div>

                {/* Endereço Sede */}
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Endereço Sede</label>
                  <input
                    type="text"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500 outline-none"
                    placeholder="Ex: Av. Mao Tse Tung, nº 1420, Maputo"
                  />
                </div>

                {/* Dados de Acesso */}
                <div className="sm:col-span-2 border-t border-slate-100 pt-3">
                  <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wide text-[10px] text-teal-601 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-teal-600" /> Dados de Acesso à Plataforma
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div>
                      <label className="block text-slate-400 uppercase font-sans font-bold block mb-1">Nome de Utilizador *</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-teal-500 outline-none"
                        placeholder="Ex: ecopest"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 uppercase font-sans font-bold block mb-1">
                        {editingEmpresa ? 'Definir Nova Palavra-passe' : 'Palavra-passe Temporária *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={passwordKey}
                        onChange={(e) => setPasswordKey(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-teal-500 outline-none"
                        placeholder="Ex: ecopest123"
                      />
                    </div>
                  </div>
                </div>

                {/* Estado da Conta */}
                <div className="sm:col-span-2 pt-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="checkbox-ativa"
                    checked={ativa}
                    onChange={(e) => setAtiva(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="checkbox-ativa" className="font-semibold text-slate-700 select-none">
                    Ativa para Operar (Empresa autorizada a entrar no sistema e planejar)
                  </label>
                </div>

              </div>

              {/* Botões */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-55 transition font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow transition flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Guardar Dados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Vincular Casas em Lote */}
      {showAssignModal && assigningEmpresa && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="assign-houses-modal">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-[#111827] px-6 py-4 flex items-center justify-between text-white shrink-0">
              <div>
                <span className="text-[10px] text-teal-400 font-mono tracking-wider uppercase">Vínculo em Lote</span>
                <h3 className="font-sans font-bold text-xs mt-0.5">
                  Vincular Casas à Prestadora: {assigningEmpresa.nome}
                </h3>
              </div>
              <button 
                onClick={() => setShowAssignModal(false)}
                className="p-1 hover:bg-gray-800 rounded-lg transition text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Painel de Filtros e Seleção rápida no Modal */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-655">Filtrar por Zona:</span>
                <select
                  value={selectedZoneFilter}
                  onChange={(e) => setSelectedZoneFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                >
                  <option value="Todos">🏡 Todas as Zonas</option>
                  {zonasDisponiveis.map(z => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selecionarTodasFiltradas}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold border border-blue-200 transition"
                >
                  Selecionar Filtradas ({residenciasFiltradasModal.length})
                </button>
                <button
                  type="button"
                  onClick={desmarcarTodasFiltradas}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold border border-rose-250 transition"
                >
                  Desmarcar Filtradas
                </button>
              </div>
            </div>

            {/* Listagem de Casas com Checkbox */}
            <form onSubmit={handleSaveAssignment} className="flex-1 overflow-y-auto p-6 flex flex-col space-y-4">
              <span className="text-[11px] text-gray-500 font-medium font-sans">
                Selecione as casas que deseja atribuir a esta prestadora. As casas desmarcadas serão desvinculadas se já estivessem atribuídas a ela.
              </span>
              
              <div className="border border-gray-200 rounded-xl divide-y divide-gray-150 max-h-[300px] overflow-y-auto pr-1">
                {Object.entries(
                  residenciasFiltradasModal.reduce((acc: { [key: string]: Residencia[] }, r) => {
                    if (!acc[r.bairro]) acc[r.bairro] = [];
                    acc[r.bairro].push(r);
                    return acc;
                  }, {})
                ).map(([zona, casas]) => (
                  <div key={zona} className="p-3 bg-white space-y-2">
                    <div className="font-bold text-gray-800 bg-gray-50/70 px-2 py-1 rounded border border-gray-100 text-[11px]">
                      🏘️ {zona} ({casas.length} casas)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-1">
                      {casas.map(res => {
                        const isChecked = tempSelectedResIds.includes(res.id);
                        const outraEmpresa = res.empresaId && res.empresaId !== assigningEmpresa.id
                          ? empresas.find(e => e.id === res.empresaId)?.nome.split(' (')[0]
                          : null;

                        return (
                          <label
                            key={res.id}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all cursor-pointer text-xs ${
                              isChecked 
                                ? 'bg-blue-50/40 border-blue-200' 
                                : 'bg-white hover:bg-slate-50/50 border-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleResSelection(res.id)}
                              className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 shrink-0 mt-0.5"
                            />
                            <div>
                              <div className="font-mono font-bold text-blue-700">{res.codigo}</div>
                              <div className="font-bold text-gray-900 mt-0.5">{res.nomeOcupante}</div>
                              <div className="text-[10px] text-gray-400 truncate max-w-[200px] mt-0.5">{res.endereco}</div>
                              {outraEmpresa && (
                                <span className="inline-block text-[9px] text-amber-700 bg-amber-50 border border-amber-200 px-1 py-0.2 rounded font-semibold mt-1">
                                  ⚠️ Vinculada à: {outraEmpresa}
                                </span>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Botões do Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 shrink-0 mt-auto">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-slate-650 hover:bg-gray-50 transition font-bold text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 text-xs font-sans"
                >
                  <Save className="w-4 h-4" /> Gravar Vínculos ({tempSelectedResIds.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
