import { AuthGuard } from "@/components/auth-guard";
import { TrialGuard } from "@/components/trial-guard";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <TrialGuard>
        <div className="min-h-screen bg-gray-50">
          <header className="border-b bg-white px-6 py-4">
            <h1 className="text-xl font-bold">Sistematize</h1>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </TrialGuard>
    </AuthGuard>
  );
}
