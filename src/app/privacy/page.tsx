import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politica de Privacidade - Sistematize',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-deep)] px-5 py-10 sm:py-14">
      <article className="mx-auto max-w-3xl rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-10">
        <Link href="/register" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">
          Voltar ao cadastro
        </Link>

        <header className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Politica de Privacidade</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Ultima atualizacao: 21 de maio de 2026</p>
        </header>

        <div className="space-y-7 text-sm leading-7 text-[var(--color-text-secondary)]">
          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">1. Quem somos</h2>
            <p>
              O Sistematize e uma plataforma de gestao e agendamento para negocios de beleza e bem-estar. Tratamos dados
              pessoais para viabilizar cadastro, acesso, administracao da conta, agendamentos, comunicacoes e operacao
              dos recursos contratados.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">2. Dados coletados</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Dados de cadastro: nome, email, senha criptografada, CPF ou CNPJ, telefone e cidade.</li>
              <li>Dados do negocio: nome, segmento, tipo, equipe, servicos, agenda, faturamento estimado e preferencias.</li>
              <li>Dados de uso: acessos, acoes administrativas, configuracoes, registros tecnicos e logs de seguranca.</li>
              <li>Dados de clientes do negocio: nome, contato, agendamentos e informacoes necessarias para atendimento.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">3. Finalidades</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Criar e administrar sua conta.</li>
              <li>Disponibilizar agenda, servicos, clientes, equipe, financeiro e pagina publica.</li>
              <li>Enviar emails transacionais, confirmacoes, avisos operacionais e comunicacoes de seguranca.</li>
              <li>Processar assinaturas, pagamentos e controles de acesso por plano.</li>
              <li>Melhorar estabilidade, seguranca, auditoria e suporte da plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">4. Base legal</h2>
            <p>
              Tratamos dados com base na execucao de contrato, cumprimento de obrigacoes legais, consentimento quando
              aplicavel e interesse legitimo para seguranca, suporte, melhoria do produto e prevencao de fraude.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">5. Compartilhamento</h2>
            <p>
              Podemos compartilhar dados com fornecedores essenciais para operacao da plataforma, como hospedagem,
              banco de dados, envio de email, processamento de pagamento, monitoramento e suporte. Nao vendemos dados
              pessoais.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">6. Seguranca e retencao</h2>
            <p>
              Utilizamos medidas tecnicas e organizacionais para proteger os dados, incluindo controle de acesso,
              criptografia em transito, segregacao por conta e registros de auditoria. Os dados sao mantidos pelo tempo
              necessario para prestacao do servico, cumprimento legal, seguranca e defesa de direitos.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">7. Direitos do titular</h2>
            <p>
              Voce pode solicitar acesso, correcao, exclusao, portabilidade, informacoes sobre compartilhamento,
              revogacao de consentimento e revisao de tratamentos automatizados, conforme a LGPD.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">8. Contato</h2>
            <p>
              Para exercer direitos ou tirar duvidas sobre privacidade, envie email para{' '}
              <a href="mailto:sistematizeai@gmail.com" className="font-semibold text-[var(--color-accent)] hover:underline">
                sistematizeai@gmail.com
              </a>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
