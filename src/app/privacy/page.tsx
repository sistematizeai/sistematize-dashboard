import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politica de Privacidade - Sistematize',
  description: 'Politica de privacidade da plataforma Sistematize, com informacoes sobre LGPD, dados e pagamentos.',
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-deep)] px-5 py-10 sm:py-14">
      <article className="mx-auto max-w-4xl rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-10">
        <Link href="/register" className="text-sm font-semibold text-[var(--color-accent)] hover:underline">
          Voltar ao cadastro
        </Link>

        <header className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Politica de Privacidade</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Ultima atualizacao: 26 de maio de 2026</p>
          <p className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4 text-sm leading-6 text-[var(--color-text-secondary)]">
            Esta politica explica como o Sistematize coleta, usa, compartilha, protege e retem dados pessoais na
            operacao da plataforma. Ela tambem informa como titulares podem exercer seus direitos previstos na LGPD.
          </p>
        </header>

        <div className="space-y-7 text-sm leading-7 text-[var(--color-text-secondary)]">
          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">1. Quem somos</h2>
            <p>
              O Sistematize e uma plataforma de gestao, assinatura e agendamento para negocios de beleza, estetica,
              saude, bem-estar e servicos locais. Tratamos dados pessoais para viabilizar cadastro, acesso, operacao da
              conta, agendamentos, comunicacoes, suporte, seguranca e recursos contratados.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">2. Papeis na LGPD</h2>
            <p>
              Para dados da conta do usuario administrador e do negocio contratante, o Sistematize pode atuar como
              controlador, pois define meios e finalidades necessarias para prestar o servico. Para dados de clientes
              finais inseridos pelo negocio, o negocio normalmente atua como controlador e o Sistematize como operador,
              tratando esses dados conforme as instrucoes do negocio e para funcionamento da plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">3. Dados coletados</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Dados de cadastro: nome, email, senha criptografada, CPF ou CNPJ, telefone e cidade.</li>
              <li>Dados do negocio: nome, segmento, tipo, equipe, servicos, agenda, faturamento estimado e preferencias.</li>
              <li>Dados de colaboradores: nome, contato, agenda, horarios, servicos realizados e permissoes de acesso.</li>
              <li>Dados de uso: acessos, acoes administrativas, configuracoes, registros tecnicos e logs de seguranca.</li>
              <li>Dados de clientes do negocio: nome, contato, agendamentos e informacoes necessarias para atendimento.</li>
              <li>
                Dados de pagamento: plano contratado, status de cobranca, identificadores de fatura, metodo de
                pagamento, vencimentos e comprovantes.
              </li>
              <li>
                Dados de suporte: mensagens enviadas ao suporte, historico de atendimento e evidencias tecnicas
                necessarias para resolver problemas.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">4. Finalidades</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Criar e administrar sua conta.</li>
              <li>Disponibilizar agenda, servicos, clientes, equipe, financeiro e pagina publica.</li>
              <li>Enviar emails transacionais, confirmacoes, avisos operacionais e comunicacoes de seguranca.</li>
              <li>Processar assinaturas, pagamentos e controles de acesso por plano.</li>
              <li>Melhorar estabilidade, seguranca, auditoria e suporte da plataforma.</li>
              <li>Prevenir fraude, abuso, uso indevido, acessos nao autorizados e incidentes de seguranca.</li>
              <li>Cumprir obrigacoes legais, fiscais, regulatorias, contratuais e ordens de autoridades competentes.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">5. Bases legais</h2>
            <p>
              Tratamos dados pessoais com base na execucao de contrato ou procedimentos preliminares relacionados ao
              contrato, cumprimento de obrigacoes legais ou regulatorias, exercicio regular de direitos, consentimento
              quando aplicavel e interesse legitimo para seguranca, suporte, melhoria do produto, prevencao de fraude e
              manutencao da operacao. Quando o consentimento for usado, ele podera ser revogado pelo titular, observadas
              obrigacoes legais e dados necessarios para execucao do servico.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">6. Compartilhamento e fornecedores</h2>
            <p>
              Podemos compartilhar dados com fornecedores essenciais para operacao da plataforma, como hospedagem, banco
              de dados, envio de email, autenticacao, processamento de pagamento, monitoramento, logs, suporte,
              comunicacao e automacoes. Isso pode incluir provedores como Asaas, Supabase, Render, Vercel, Resend,
              Gmail/SMTP e outros fornecedores tecnicos contratados. Nao vendemos dados pessoais.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">7. Pagamentos e tokenizacao</h2>
            <p>
              Pagamentos podem ser processados por provedores externos, como Asaas. O Sistematize nao deve armazenar
              numero completo de cartao nem codigo de seguranca. Quando houver pagamento por cartao, os dados do cartao
              devem ser enviados ao provedor para autorizacao e, quando disponivel, tokenizacao. Podemos armazenar apenas
              informacoes operacionais, como identificador da cobranca, status, bandeira, ultimos digitos, vencimento,
              metodo utilizado e token retornado pelo provedor para futuras tentativas autorizadas.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">
              8. Cookies, sessoes e tecnologias similares
            </h2>
            <p>
              Podemos usar cookies, armazenamento local, tokens de sessao e tecnologias similares para manter login,
              proteger acessos, lembrar preferencias, medir estabilidade, diagnosticar erros e melhorar a experiencia. O
              bloqueio dessas tecnologias pode impedir o funcionamento correto de partes da plataforma.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">9. Seguranca e retencao</h2>
            <p>
              Utilizamos medidas tecnicas e organizacionais para proteger os dados, incluindo controle de acesso,
              criptografia em transito, segregacao por conta, logs, backups e registros de auditoria quando aplicavel. Os
              dados sao mantidos pelo tempo necessario para prestacao do servico, cumprimento legal, seguranca, prevencao
              de fraude, auditoria, suporte, resolucao de conflitos e defesa de direitos. Apos o encerramento da conta,
              dados podem ser excluidos, anonimizados ou retidos quando houver obrigacao legal ou interesse legitimo
              aplicavel.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">10. Direitos do titular</h2>
            <p>
              Conforme a LGPD, o titular pode solicitar confirmacao de tratamento, acesso, correcao, anonimizacao,
              bloqueio ou eliminacao de dados desnecessarios ou tratados em desconformidade, portabilidade, informacoes
              sobre compartilhamento, revisao de decisoes exclusivamente automatizadas quando aplicavel, revogacao de
              consentimento e informacoes sobre as consequencias de nao fornecer consentimento. Solicitacoes podem exigir
              validacao de identidade e ser limitadas por obrigacoes legais, seguranca, segredo comercial, preservacao de
              direitos e dados controlados pelo negocio contratante.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">11. Transferencia internacional</h2>
            <p>
              Alguns fornecedores de infraestrutura, suporte, email, monitoramento ou pagamento podem processar dados em
              outros paises. Quando isso ocorrer, buscamos utilizar fornecedores com medidas adequadas de seguranca,
              contratos e controles compativeis com a legislacao aplicavel.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">12. Criancas e adolescentes</h2>
            <p>
              A plataforma e destinada a negocios e usuarios profissionais. Caso um negocio cadastre dados de menores
              para fins de atendimento, ele deve possuir base legal adequada e observar as regras aplicaveis, incluindo
              autorizacao de responsavel quando exigida.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">13. Alteracoes desta politica</h2>
            <p>
              Esta politica pode ser atualizada para refletir mudancas legais, tecnicas, operacionais ou comerciais. A
              versao vigente sera publicada nesta pagina, com a data de atualizacao. Mudancas relevantes poderao ser
              comunicadas por email, aviso na plataforma ou outro canal cadastrado.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">14. Contato</h2>
            <p>
              Para exercer direitos ou tirar duvidas sobre privacidade, envie email para{' '}
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
