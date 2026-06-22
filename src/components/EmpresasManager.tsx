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
}

export default function EmpresasManager({ 
  empresas, 
  residencias, 
  onAddEmpresa, 
  onUpdateEmpresa, 
  onExcluirEmpresa 
}: EmpresasManagerProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null);

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

              {/* Botões de Ação */}
              <div className="flex gap-2 pt-2 border-t border-gray-150">
                <button
                  type="button"
                  onClick={() => openEditModal(emp)}
                  className="flex-1 py-1.5 border border-gray-200 text-slate-600 hover:text-blue-600 hover:bg-gray-50 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
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

    </div>
  );
}
