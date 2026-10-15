import Modal from './Modal'

export default function ConfirmModal({ open, onClose, onConfirm, title = 'Confirmer', message, danger = true }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      <div className="flex justify-end gap-2 mt-5">
        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
          Annuler
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-primary-600 hover:bg-primary-700'}`}
        >
          Confirmer
        </button>
      </div>
    </Modal>
  )
}
