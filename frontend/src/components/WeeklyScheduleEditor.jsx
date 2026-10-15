import { Plus, Trash2 } from 'lucide-react'

const JOURS = [
  ['lundi', 'Lundi'], ['mardi', 'Mardi'], ['mercredi', 'Mercredi'], ['jeudi', 'Jeudi'],
  ['vendredi', 'Vendredi'], ['samedi', 'Samedi'], ['dimanche', 'Dimanche'],
]

/**
 * Editeur de planning hebdomadaire : { "lundi": ["08:00-12:00", "14:00-17:00"], ... }
 * value / onChange(value) suivent cette meme structure.
 */
export default function WeeklyScheduleEditor({ value, onChange }) {
  const schedule = value || {}

  function toggleDay(jour, actif) {
    const next = { ...schedule }
    if (actif) {
      next[jour] = ['08:00-12:00']
    } else {
      delete next[jour]
    }
    onChange(next)
  }

  function updateRange(jour, index, field, val) {
    const ranges = [...(schedule[jour] || [])]
    const [start, end] = (ranges[index] || '-').split('-')
    const updated = field === 'start' ? `${val}-${end}` : `${start}-${val}`
    ranges[index] = updated
    onChange({ ...schedule, [jour]: ranges })
  }

  function addRange(jour) {
    const ranges = [...(schedule[jour] || []), '14:00-17:00']
    onChange({ ...schedule, [jour]: ranges })
  }

  function removeRange(jour, index) {
    const ranges = (schedule[jour] || []).filter((_, i) => i !== index)
    if (ranges.length === 0) {
      const next = { ...schedule }
      delete next[jour]
      onChange(next)
    } else {
      onChange({ ...schedule, [jour]: ranges })
    }
  }

  return (
    <div className="space-y-2">
      {JOURS.map(([key, label]) => {
        const actif = key in schedule
        const ranges = schedule[key] || []
        return (
          <div key={key} className="border border-gray-100 dark:border-gray-800 rounded-lg p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={actif} onChange={(e) => toggleDay(key, e.target.checked)} />
              {label}
            </label>
            {actif && (
              <div className="mt-2 space-y-2 pl-6">
                {ranges.map((range, i) => {
                  const [start, end] = range.split('-')
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <input type="time" value={start || ''} onChange={(e) => updateRange(key, i, 'start', e.target.value)}
                        className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-sm" />
                      <span className="text-gray-400 text-sm">à</span>
                      <input type="time" value={end || ''} onChange={(e) => updateRange(key, i, 'end', e.target.value)}
                        className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-sm" />
                      <button type="button" onClick={() => removeRange(key, i)} className="text-rose-500 hover:text-rose-700">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
                <button type="button" onClick={() => addRange(key)}
                  className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400">
                  <Plus size={12} /> Ajouter une plage
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
