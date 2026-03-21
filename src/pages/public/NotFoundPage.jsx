import { useNavigate } from 'react-router-dom'
import { Stethoscope, ArrowLeft, Home } from 'lucide-react'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center px-4 font-sans">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Stethoscope className="w-10 h-10 text-primary" />
        </div>
        <p className="text-8xl font-black text-primary/20 mb-2">404</p>
        <h1 className="text-2xl font-bold text-neutral-text mb-3">Page introuvable</h1>
        <p className="text-neutral-muted mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-outline flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Retour
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-primary flex items-center gap-2"
          >
            <Home className="w-4 h-4" /> Accueil
          </button>
        </div>
      </div>
    </div>
  )
}