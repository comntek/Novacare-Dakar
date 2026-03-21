export function Avatar({ src, prenom, nom, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }

  const initials = `${prenom?.[0] || ''}${nom?.[0] || ''}`.toUpperCase() || '?'

  if (src) {
    return (
      <img
        src={src}
        alt={`${prenom} ${nom}`}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`}
        onError={(e) => {
          e.target.style.display = 'none'
        }}
      />
    )
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 font-semibold text-primary ${className}`}
    >
      {initials}
    </div>
  )
}

export default Avatar