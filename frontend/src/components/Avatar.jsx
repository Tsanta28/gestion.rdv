import { User } from 'lucide-react'

const SIZES = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-lg' }

export default function Avatar({ src, name = '', size = 'sm', className = '' }) {
  const initials = name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
  const dimension = SIZES[size] || SIZES.sm

  if (src) {
    return <img src={src} alt={name} className={`${dimension} rounded-full object-cover shrink-0 ${className}`} />
  }
  return (
    <span className={`${dimension} rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-semibold shrink-0 ${className}`}>
      {initials || <User size={14} />}
    </span>
  )
}
