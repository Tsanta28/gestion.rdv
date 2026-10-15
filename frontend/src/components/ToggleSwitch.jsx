export default function ToggleSwitch({ checked, onChange, labelOn = 'Actif', labelOff = 'Inactif' }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2"
    >
      <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
      <span className={`text-sm font-medium ${checked ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
        {checked ? labelOn : labelOff}
      </span>
    </button>
  )
}
