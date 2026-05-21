import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termos de Uso - Sistematize',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-deep)] px-5 py-10 sm:py-14">
      <article className="mx-auto max-w-3xl rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-10">
        <Link href="/register" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">
          Voltar ao cadastro
        </Link>

        <header className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Termos de Uso</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Ultima atualizacao: 21 de maio de 2026</p>
        </header>

        <div className="space-y-7 text-sm leading-7 text-[var(--color-text-secondary)]">
          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">1. Aceitacao</h2>
            <p>
              Ao criar uma conta ou utilizar a plataforma Sistematize, voce declara que leu, entendeu e concorda com
              estes Termos de Uso e com a nossa <Link href="/privacy" className="font-semibold text-[var(--color-accent)] hover:underline">Politica de Privacidade</Link>.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">2. Servico oferecido</h2>
            <p>
              O Sistematize e uma plataforma SaaS para gestao de agenda, clientes, servicos, equipe, financeiro,
              pagina publica de agendamento e recursos administrativos para negocios de beleza e bem-estar.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">3. Cadastro e responsabilidade da conta</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>As informacoes do cadastro devem ser verdadeiras, completas e atualizadas.</li>
              <li>Voce e responsavel por proteger seu login, senha e acessos administrativos.</li>
              <li>Voce deve usar a plataforma apenas para fins licitos e relacionados ao seu negocio.</li>
              <li>Contas podem ser bloqueadas em caso de fraude, uso indevido, inadimplencia ou violacao destes termos.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">4. Uso da plataforma</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Voce nao deve tentar acessar dados de outros negocios ou usuarios.</li>
              <li>Voce nao deve interferir na seguranca, disponibilidade ou integridade do sistema.</li>
              <li>Voce e responsavel pelos dados, servicos, precos, horarios e regras cadastradas no seu painel.</li>
              <li>Voce deve cumprir a LGPD e demais leis aplicaveis ao tratar dados dos seus clientes.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">5. Planos, teste e pagamento</h2>
            <p>
              O acesso pode incluir periodo gratuito, planos pagos e modulos adicionais. Valores, recursos e condicoes
              podem variar conforme o plano contratado. A falta de pagamento pode limitar ou suspender o acesso ate a
              regularizacao.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">6. Integracoes e terceiros</h2>
            <p>
              A plataforma pode usar servicos de terceiros, como provedores de pagamento, banco de dados, hospedagem,
              email e automacoes. O funcionamento dessas integracoes tambem depende das regras e disponibilidade desses
              provedores.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">7. Disponibilidade e limitacao de responsabilidade</h2>
            <p>
              Trabalhamos para manter o sistema seguro e disponivel, mas nao garantimos operacao ininterrupta. Nao nos
              responsabilizamos por perdas indiretas, lucros cessantes, dados inseridos incorretamente pelo usuario ou
              falhas causadas por terceiros.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">8. Alteracoes</h2>
            <p>
              Estes termos podem ser atualizados para refletir mudancas legais, tecnicas ou comerciais. Quando houver
              mudanca relevante, poderemos comunicar pelos canais cadastrados ou pela propria plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">9. Contato</h2>
            <p>
              Para duvidas sobre estes termos, entre em contato pelo email{' '}
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
