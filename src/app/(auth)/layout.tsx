export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-600 text-xl font-bold text-white">
            M
          </div>
          <h1 className="text-xl font-semibold text-neutral-900">Maintenance Requests 2.0</h1>
          <p className="mt-1 text-sm text-neutral-500">Station &amp; Engineering maintenance management</p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-card">{children}</div>
      </div>
    </div>
  );
}
