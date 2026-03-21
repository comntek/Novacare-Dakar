import { Inbox } from 'lucide-react'

export function EmptyState({
  icon: Icon = Inbox,
  title = 'Aucun résultat',
  description = '',
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-neutral-bg rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-neutral-muted opacity-50" />
      </div>
      <h3 className="font-semibold text-neutral-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-subtle max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export default EmptyState