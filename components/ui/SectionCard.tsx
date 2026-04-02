import type { ComponentType, ReactNode } from 'react'

interface SectionCardProps {
  title?:     string
  icon?:      ComponentType<{ className?: string }>
  iconColor?: string
  badge?:     ReactNode
  action?:    ReactNode
  children:   ReactNode
  padding?:   string
  overflow?:  boolean
}

export function SectionCard({
  title,
  icon: Icon,
  iconColor = 'text-[#D16E41]',
  badge,
  action,
  children,
  padding   = 'p-6',
  overflow  = false,
}: SectionCardProps) {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-xl ${overflow ? 'overflow-hidden' : ''}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-700 flex items-center gap-2">
          {Icon && <Icon className={`w-5 h-5 ${iconColor}`} />}
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {badge  && <span className="ml-auto">{badge}</span>}
          {!badge && action && <span className="ml-auto">{action}</span>}
          {badge  && action && <span>{action}</span>}
        </div>
      )}
      <div className={padding}>{children}</div>
    </div>
  )
}
