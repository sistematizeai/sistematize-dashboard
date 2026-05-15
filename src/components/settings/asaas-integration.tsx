'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api-client';
import { getApiErrorMessage } from '@/lib/errors';

const card = 'bg-white rounded-2xl border border-[var(--color-border)] p-6';
const input = 'w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white text-sm focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)] transition-all';

interface AsaasStatus {
  connected: boolean;
  status?: string;
  environment?: string;
  apiKeyLast4?: string;
  webhookActive?: boolean;
  lastTestedAt?: string;
}

export default function AsaasIntegration() {
  const [status, setStatus] = useState<AsaasStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConnect, setShowConnect] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadStatus(); }, []);

  async function loadStatus() {
    try {
      const { data } = await api.get('/api/integrations/asaas/status');
      setStatus(data);
    } catch {
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    if (!apiKey || apiKey.length < 20) {
      setError('API Key deve ter no minimo 20 caracteres.');
      return;
    }
    setConnecting(true);
    setError('');
    try {
      await api.post('/api/integrations/asaas/connect', { apiKey, environment });
      setSuccess('Asaas conectado com sucesso!');
      setShowConnect(false);
      setApiKey('');
      await loadStatus();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao conectar. Verifique a API Key.'));
    } finally {
      setConnecting(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setError('');
    try {
      await api.post('/api/integrations/asaas/test');
      setSuccess('Conexao testada com sucesso!');
      await loadStatus();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Falha no teste de conexao.'));
    } finally {
      setTesting(false);
    }
  }

  async function handleDisconnect() {
    if (!confirm('Tem certeza que deseja desconectar o Asaas?')) return;
    setError('');
    try {
      await api.delete('/api/integrations/asaas/disconnect');
      setSuccess('Asaas desconectado.');
      await loadStatus();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao desconectar.'));
    }
  }

  async function handleRecreateWebhook() {
    setError('');
    try {
      await api.post('/api/integrations/asaas/recreate-webhook');
      setSuccess('Webhook recriado com sucesso!');
      await loadStatus();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Erro ao recriar webhook.'));
    }
  }

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 4000);
      return () => clearTimeout(t);
    }
  }, [success]);

  if (loading) {
    return <div className="flex items-center justify-center py-12 text-sm text-[var(--color-text-muted)]">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">{success}</div>
      )}

      {/* Header */}
      <div className={card}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1A73E8]/10 flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Integracao Asaas</h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              Conecte sua conta Asaas para receber pagamentos por Pix, boleto e cartao diretamente pelos agendamentos.
            </p>
          </div>
          <div className="shrink-0">
            {status?.connected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Conectado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-500 border border-gray-200">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                Desconectado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Connected state */}
      {status?.connected && (
        <>
          <div className={card}>
            <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">Detalhes da conexao</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Ambiente</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5">
                  {status.environment === 'production' ? 'Producao' : 'Sandbox (teste)'}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Chave API</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5 font-mono">
                  **** **** **** {status.apiKeyLast4}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Webhook</p>
                <p className="text-sm font-semibold mt-0.5">
                  {status.webhookActive ? (
                    <span className="text-green-600">Ativo</span>
                  ) : (
                    <span className="text-amber-600">Inativo</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Ultimo teste</p>
                <p className="text-sm font-semibold text-[var(--color-text-primary)] mt-0.5">
                  {status.lastTestedAt
                    ? new Date(status.lastTestedAt).toLocaleString('pt-BR')
                    : 'Nunca testado'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleTest}
              disabled={testing}
              className="px-5 py-2.5 rounded-xl bg-[var(--color-accent)] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
            >
              {testing ? 'Testando...' : 'Testar conexao'}
            </button>
            <button
              onClick={() => { setShowConnect(true); setApiKey(''); }}
              className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] transition-all cursor-pointer"
            >
              Trocar chave
            </button>
            <button
              onClick={handleRecreateWebhook}
              className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-accent)] transition-all cursor-pointer"
            >
              Recriar webhook
            </button>
            <button
              onClick={handleDisconnect}
              className="px-5 py-2.5 rounded-xl border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all cursor-pointer"
            >
              Desconectar
            </button>
          </div>

          {/* Security info */}
          <div className={card}>
            <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-3">Seguranca da integracao</h4>
            <div className="space-y-2">
              {[
                'Chave armazenada com criptografia AES-256',
                'Webhook com token de autenticacao',
                'Cobrancas passam pelo servidor seguro',
                'Eventos duplicados sao bloqueados',
                'Logs protegidos por tenant',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {text}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Disconnected state or connect modal */}
      {(!status?.connected || showConnect) && (
        <div className={card}>
          <h4 className="text-sm font-bold text-[var(--color-text-primary)] mb-4">
            {showConnect && status?.connected ? 'Trocar chave API' : 'Conectar conta Asaas'}
          </h4>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">Ambiente</label>
              <div className="flex gap-3">
                {(['sandbox', 'production'] as const).map(env => (
                  <button
                    key={env}
                    onClick={() => setEnvironment(env)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all ${
                      environment === env
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]'
                    }`}
                  >
                    {env === 'sandbox' ? 'Sandbox (teste)' : 'Producao'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Cole sua API Key do Asaas aqui"
                className={input}
              />
              <p className="text-xs text-[var(--color-text-muted)] mt-2">
                Sua chave sera criptografada e armazenada com seguranca. Ela nao sera exibida novamente apos a conexao.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleConnect}
                disabled={connecting || !apiKey}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4A6CF7] to-[#6C5CE7] text-white text-sm font-semibold hover:brightness-110 transition-all cursor-pointer disabled:opacity-50"
              >
                {connecting ? 'Validando...' : 'Validar e conectar'}
              </button>
              {showConnect && status?.connected && (
                <button
                  onClick={() => setShowConnect(false)}
                  className="px-5 py-2.5 rounded-xl border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tutorial link */}
      {!status?.connected && !showConnect && (
        <div className="text-center">
          <a
            href="https://docs.asaas.com/docs/obtendo-a-api-key"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            Como obter minha API Key do Asaas?
          </a>
        </div>
      )}
    </div>
  );
}
