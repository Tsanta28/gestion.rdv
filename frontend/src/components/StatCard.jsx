import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/** Anime un compteur numerique de 0 (ou valeur precedente) vers `target`. */
function useCountUp(target) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    const numeric = typeof target === 'number' ? target : null
    if (numeric === null) {
      setValue(target)
      return
    }
    let frame
    const start = performance.now()
    const duration = 600
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1)
      setValue(Math.round(numeric * progress))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target])
  return value
}

const ACCENTS = {
  primary: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30',
  emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30',
  amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30',
  rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30',
}

export default function StatCard({ label, value, accent = 'primary', icon: Icon, trend }) {
  const animated = useCountUp(value)
  const iconClasses = ACCENTS[accent] || ACCENTS.primary

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-soft hover:shadow-lg p-5 border border-gray-100 dark:border-gray-800 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${iconClasses.split(' ')[0]} ${iconClasses.split(' ')[1]}`}>
            {animated}
          </p>
          {trend !== undefined && (
            <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend >= 0 ? '+' : ''}{trend}% ce mois
            </p>
          )}
        </div>
        {Icon && (
          <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconClasses}`}>
            <Icon size={20} />
          </span>
        )}
      </div>
    </motion.div>
  )
}
