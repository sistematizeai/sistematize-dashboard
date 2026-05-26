import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Termos de Uso - Sistematize',
  description: 'Termos de uso da plataforma Sistematize para gestao de agenda, clientes, equipe e assinaturas.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-deep)] px-5 py-10 sm:py-14">
      <article className="mx-auto max-w-4xl rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-10">
        <Link href="/register" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">
          Voltar ao cadastro
        </Link>

        <header className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Termos de Uso</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Ultima atualizacao: 26 de maio de 2026</p>
          <p className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            Estes termos regulam o uso da plataforma Sistematize. Ao criar conta, acessar o painel, usar a pagina
            publica de agendamento ou contratar um plano, voce concorda com as regras abaixo e com a nossa{' '}
            <Link href="/privacy" className="font-semibold text-[var(--color-accent)] hover:underline">
              Politica de Privacidade
            </Link>
            .
          </p>
        </header>

        <div className="space-y-7 text-sm leading-7 text-[var(--color-text-secondary)]">
          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">1. Aceitacao e elegibilidade</h2>
            <p>
              O Sistematize e destinado a usuarios capazes de contratar servicos em nome proprio ou em nome do negocio
              que representam. Ao usar a plataforma, voce declara que possui autorizacao para cadastrar o negocio,
              contratar planos, incluir colaboradores, configurar servicos e tratar dados de clientes no sistema.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">2. Servico oferecido</h2>
            <p>
              O Sistematize e uma plataforma SaaS para gestao de agenda, clientes, servicos, colaboradores, assinatura,
              financeiro operacional, pagina publica de agendamento e recursos administrativos para negocios de beleza,
              estetica, saude, bem-estar e servicos locais. As funcionalidades disponiveis podem variar conforme o plano,
              configuracoes da conta, integracoes ativas e evolucao do produto.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">
              3. Cadastro e responsabilidade da conta
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>As informacoes do cadastro devem ser verdadeiras, completas e atualizadas.</li>
              <li>Voce e responsavel por proteger login, senha, sessoes ativas e acessos administrativos.</li>
              <li>Voce deve usar a plataforma apenas para fins licitos e relacionados ao seu negocio.</li>
              <li>Voce deve revisar permissoes de colaboradores e remover acessos que nao sejam mais necessarios.</li>
              <li>
                Contas podem ser suspensas em caso de fraude, uso indevido, inadimplencia, risco de seguranca ou
                violacao destes termos.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">4. Uso da plataforma</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Voce nao deve tentar acessar dados de outros negocios ou usuarios.</li>
              <li>Voce nao deve interferir na seguranca, disponibilidade ou integridade do sistema.</li>
              <li>Voce e responsavel pelos dados, servicos, precos, horarios e regras cadastradas no seu painel.</li>
              <li>Voce deve cumprir a LGPD e demais leis aplicaveis ao tratar dados dos seus clientes.</li>
              <li>
                Voce nao deve cadastrar conteudo ofensivo, discriminatorio, fraudulento, ilegal ou que viole direitos
                de terceiros.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">5. Planos, teste e pagamento</h2>
            <p>
              O acesso pode incluir periodo gratuito, planos pagos e modulos adicionais. Valores, limites, recursos e
              condicoes sao apresentados na area de assinatura ou proposta comercial vigente. Pagamentos, boletos, Pix,
              cartao e recorrencias podem ser processados por provedores de pagamento, incluindo Asaas, conforme a
              disponibilidade da conta e das integracoes contratadas.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>A falta de pagamento pode limitar, bloquear ou suspender o acesso ate a regularizacao.</li>
              <li>Upgrades podem gerar cobranca proporcional ou imediata, conforme a regra exibida no checkout.</li>
              <li>Downgrades podem ser aplicados no fim do ciclo ja pago, preservando o acesso contratado ate o vencimento.</li>
              <li>
                Taxas, tributos, estornos e prazos de compensacao seguem as regras do metodo de pagamento e do provedor
                utilizado.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">6. Cancelamento e encerramento</h2>
            <p>
              O cancelamento pode ser solicitado pelo painel, suporte ou canal indicado na plataforma. O cancelamento
              impede novas cobrancas futuras, mas nao elimina automaticamente valores vencidos, encargos ja processados
              ou obrigacoes legais de retencao de dados. A exclusao definitiva de dados deve ser solicitada pelo canal
              de privacidade, observados prazos legais, seguranca, auditoria e defesa de direitos.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">7. Integracoes e terceiros</h2>
            <p>
              A plataforma pode usar servicos de terceiros, como provedores de pagamento, banco de dados, hospedagem,
              email, automacoes, autenticacao, monitoramento e comunicacao. O funcionamento dessas integracoes tambem
              depende de disponibilidade, permissoes, limites, contratos e politicas dos respectivos provedores. Quando
              uma integracao externa for desativada, indisponivel ou nao autorizada, alguns recursos podem ficar
              limitados.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">8. Dados, conteudo e LGPD</h2>
            <p>
              O negocio contratante continua responsavel pelos dados, conteudos, servicos, valores, horarios, politicas
              de atendimento e informacoes de seus proprios clientes. Em relacao aos dados de clientes finais
              cadastrados pelo negocio, o Sistematize normalmente atua como operador, tratando os dados conforme as
              instrucoes do negocio e conforme a nossa Politica de Privacidade. O negocio deve possuir base legal para
              coletar, inserir e utilizar esses dados.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">9. Propriedade intelectual</h2>
            <p>
              A marca Sistematize, codigo, layout, textos, fluxos, componentes, estrutura de produto e materiais da
              plataforma pertencem ao Sistematize ou a seus licenciantes. Os dados do negocio, dados dos clientes,
              historico de agendamentos e conteudos inseridos pelo usuario permanecem vinculados ao respectivo titular
              ou responsavel, sem transferencia de propriedade ao Sistematize.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">
              10. Disponibilidade e limitacao de responsabilidade
            </h2>
            <p>
              Trabalhamos para manter o sistema seguro e disponivel, mas nao garantimos operacao ininterrupta. Nao nos
              responsabilizamos por perdas indiretas, lucros cessantes, queda de faturamento, dados inseridos
              incorretamente pelo usuario, configuracoes feitas pelo proprio negocio, indisponibilidade de terceiros,
              falhas de internet, dispositivos do usuario ou uso da plataforma em desacordo com estes termos.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">11. Suporte e comunicacoes</h2>
            <p>
              Podemos enviar comunicacoes operacionais sobre conta, seguranca, pagamento, alteracoes relevantes,
              suporte, avisos tecnicos e recursos contratados. Comunicacoes promocionais podem ser enviadas quando
              permitidas e poderao ser descadastradas quando aplicavel.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">12. Alteracoes dos termos</h2>
            <p>
              Estes termos podem ser atualizados para refletir mudancas legais, tecnicas ou comerciais. Quando houver
              mudanca relevante, poderemos comunicar pelos canais cadastrados, pela propria plataforma ou por aviso nas
              paginas legais. O uso continuado da plataforma apos a publicacao da nova versao representa concordancia com
              os termos atualizados.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">13. Lei aplicavel e contato</h2>
            <p>
              Estes termos sao regidos pelas leis brasileiras. Para duvidas sobre estes termos, conta, assinatura ou uso
              da plataforma, entre em contato pelo email{' '}
              <a href="mailto:sistematizeai@gmail.com" className="font-semibold text-[var(--color-accent)] hover:underline">
                sistematizeai@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
