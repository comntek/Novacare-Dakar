export function LoadingSpinner({ size = 'md', color = 'primary' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }
  const colors = {
    primary: 'border-primary',
    white: 'border-white',
    gray: 'border-gray-400',
  }
  return (
    <div
      className={`${sizes[size]} border-2 ${colors[color]} border-t-transparent rounded-full animate-spin`}
    />
  )
}

export function PageLoader({ text = 'Chargement...' }) {
  return (
    <div className="min-h-screen bg-neutral-bg flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-neutral-subtle text-sm">{text}</p>
    </div>
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card space-y-3 animate-pulse">
      <div className="skeleton h-4 w-2/3 rounded" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-3 rounded ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  )
}

export function SkeletonList({ count = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card flex items-center gap-3 animate-pulse">
          <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-1/3 rounded" />
            <div className="skeleton h-3 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default LoadingSpinner