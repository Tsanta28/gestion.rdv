import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'


const PasswordInput = forwardRef(function PasswordInput({ className = '', ...props }, ref) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <input
        ref={ref}
        type={visible ? 'text' : 'password'}
        className={`pr-10 ${className}`}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  )
})

export default PasswordInput
