import React, { useState } from 'react';
import { Shield, Key, User, Info, Building2 } from 'lucide-react';
import { Empresa } from '../types';

interface LoginFormProps {
  empresas: Empresa[];
  onLoginSuccess: (role: 'ADMIN_EXOFIX' | 'PRESTADORA', details: { id?: string; nome: string }) => void;
}

export default function LoginForm({ empresas, onLoginSuccess }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Para fluxo de primeiro acesso da empresa prestadora
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [pendingCompany, setPendingCompany] = useState<Empresa | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 1. Verificar se é Admin Exofix
    if (username.toLowerCase() === 'admin' && password === 'admin123') {
      onLoginSuccess('ADMIN_EXOFIX', { nome: 'Administrador Exofix' });
      return;
    }

    // 2. Verificar se é uma Empresa Prestadora
    const empresa = empresas.find(
      (emp) => emp.username.toLowerCase() === username.toLowerCase() && emp.passwordKey === password
    );

    if (empresa) {
      if (!empresa.ativa) {
        setError('Esta conta de empresa está atualmente INATIVA. Contacte a Exofix.');
        return;
      }

      // Se é o primeiro acesso (passwordKey coincide com a original e não marcou password mudada)
      if (!empresa.isPasswordChanged) {
        setPendingCompany(empresa);
        setShowPasswordChange(true);
        return;
      }

      onLoginSuccess('PRESTADORA', { id: empresa.id, nome: empresa.nome });
      return;
    }

    setError('Credenciais incorretas. Por favor, tente novamente.');
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setError('A nova palavra-passe deve ter pelo menos 4 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As palavras-passe não coincidem.');
      return;
    }

    if (pendingCompany) {
      // Atualizar a palavra-passe no localStorage
      const empresasLS = localStorage.getItem('exofix_empresas');
      if (empresasLS) {
        const lista: Empresa[] = JSON.parse(empresasLS);
        const index = lista.findIndex((emp) => emp.id === pendingCompany.id);
        if (index !== -1) {
          lista[index].passwordKey = newPassword;
          lista[index].isPasswordChanged = true;
          localStorage.setItem('exofix_empresas', JSON.stringify(lista));
          
          // Sincronizar dados em memória da empresa atualizada
          pendingCompany.passwordKey = newPassword;
          pendingCompany.isPasswordChanged = true;
        }
      }

      // Login bem-sucedido após alterar password
      onLoginSuccess('PRESTADORA', { id: pendingCompany.id, nome: pendingCompany.nome });
    }
  };



  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center p-4 sm:p-6" id="login-container">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" id="login-card">
        
        {/* Header da Logo */}
        <div className="bg-[#111827] px-6 py-8 text-center relative" id="login-card-header">
          <div className="absolute top-3 right-3 bg-blue-500/10 text-blue-450 font-mono text-xs px-2.5 py-1 rounded-sm border border-blue-500/20 text-blue-400">
            v1.0.0
          </div>
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-sm bg-blue-500 text-white mb-3 shadow-md">
            <Shield className="w-5 h-5" id="logo-icon" />
          </div>
          <h1 className="text-xl font-sans font-bold tracking-tight text-white mb-1" id="app-title">
            EXOFIX
          </h1>
          <p className="text-gray-400 text-[10px] tracking-widest uppercase font-mono" id="app-subtitle">
            Gestão de Intervenções
          </p>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8" id="login-form-body">
          {!showPasswordChange ? (
            <form onSubmit={handleLogin} className="space-y-5" id="form-login">
              <div className="text-center mb-4">
                <h2 className="text-base font-sans font-bold text-gray-800">
                  Bem-vindo à Plataforma
                </h2>
                <p className="text-gray-500 text-xs">
                  Introduza os dados de acesso fornecidos pela Exofix.
                </p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-start gap-2.5" id="login-error">
                  <span className="font-bold shrink-0 mt-0.5">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="username-input">
                  Nome de Utilizador
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="username-input"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Ex: admin ou ecopest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="password-input">
                  Palavra-passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    id="password-input"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-login-submit"
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
              >
                Entrar no Sistema
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordChangeSubmit} className="space-y-5" id="form-password-change">
              <div className="text-center mb-4">
                <h2 className="text-base font-sans font-bold text-gray-800 flex items-center justify-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" /> Primeiro Acesso
                </h2>
                <p className="text-gray-500 text-xs mt-1">
                  Por motivos de segurança, altere a palavra-passe temporária da empresa <strong className="text-gray-700">{pendingCompany?.nome}</strong>.
                </p>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs flex items-center gap-2" id="pwd-error">
                  <span>⚠️ {error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="new-password">
                  Nova Palavra-passe
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Mínimo 4 caracteres"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="confirm-password">
                  Confirmar Nova Palavra-passe
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Repita a palavra-passe"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordChange(false);
                    setError('');
                  }}
                  className="w-1/2 py-2 text-xs text-gray-650 border border-gray-250 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition shadow-sm"
                >
                  Salvar e Entrar
                </button>
              </div>
            </form>
          )}


        </div>
      </div>
    </div>
  );
}
