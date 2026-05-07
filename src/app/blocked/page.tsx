export default function BlockedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
        <div className="mb-4 text-4xl">&#9888;</div>
        <h1 className="mb-2 text-2xl font-bold text-red-600">Conta Bloqueada</h1>
        <p className="mb-6 text-gray-600">
          Seu periodo de teste expirou. Para continuar usando o Sistematize,
          realize o pagamento da sua assinatura.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Formas de pagamento:</p>
          <ul className="text-sm text-gray-600">
            <li>PIX (imediato ou agendado)</li>
            <li>Cartao de credito</li>
            <li>Cartao de debito</li>
          </ul>
        </div>
        <a href="/login" className="mt-6 inline-block text-sm text-black underline">
          Voltar ao login
        </a>
      </div>
    </main>
  );
}
