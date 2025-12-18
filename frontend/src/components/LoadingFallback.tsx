export default function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="spinner h-12 w-12 mx-auto"></div>
        <p className="mt-4 text-light-muted">Carregando...</p>
      </div>
    </div>
  )
}
