import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import { getDocteurPatientDetails } from '../../services/consultationService'
import { saveConsultation } from '../../services/appointmentService'
import Avatar from '../../components/Avatar'
import Loader from '../../components/Loader'
import { useToast } from '../../components/Toast'
import { STATUT_LABELS, STATUT_STYLES } from '../../components/AppointmentCard'

export default function DocteurPatientDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [openId, setOpenId] = useState(null)
  const [editingConsult, setEditingConsult] = useState(null)
  const [form, setForm] = useState({ diagnostic: '', notes: '', prescription: '' })
  const [saving, setSaving] = useState(false)
  const { push } = useToast()

  function load() {
    getDocteurPatientDetails(id).then(setData).catch(() => setData(false))
  }
  useEffect(load, [id])

  function startEdit(rdv) {
    setEditingConsult(rdv.id)
    setForm({
      diagnostic: rdv.consultation?.diagnostic || '',
      notes: rdv.consultation?.notes || '',
      prescription: rdv.consultation?.prescription || '',
    })
  }

  async function handleSaveConsultation(rdvId) {
    setSaving(true)
    try {
      await saveConsultation(rdvId, form)
      push('Consultation enregistrée ✅', 'success')
      setEditingConsult(null)
      load()
    } catch {
      push("Erreur lors de l'enregistrement.", 'error')
    } finally {
      setSaving(false)
    }
  }

  if (data === null) return <Loader />
  if (data === false) return <p className="text-gray-400">Impossible d'afficher ce patient.</p>

  const { patient, derniere_consultation, historique } = data

  return (
    <div>
      <Link to="/docteur/patients" className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 mb-4">
        <ArrowLeft size={14} /> Retour aux patients
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <Avatar src={patient.photo} name={`${patient.user.first_name} ${patient.user.last_name}`} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">{patient.user.first_name} {patient.user.last_name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{patient.user.email} · {patient.user.phone || 'pas de téléphone'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Informations personnelles</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-gray-400">Date de naissance</dt><dd>{patient.date_naissance || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">Groupe sanguin</dt><dd>{patient.groupe_sanguin || '—'}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-400">N° assurance</dt><dd>{patient.numero_assurance || '—'}</dd></div>
            <div><dt className="text-gray-400">Antécédents</dt><dd>{patient.antecedents_medicaux || '—'}</dd></div>
          </dl>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">Dernière consultation</h2>
          {derniere_consultation ? (
            <dl className="space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-gray-400">Date</dt><dd>{new Date(derniere_consultation.date_heure).toLocaleDateString('fr-FR')}</dd></div>
              <div><dt className="text-gray-400">Motif</dt><dd>{derniere_consultation.motif || '—'}</dd></div>
              <div><dt className="text-gray-400">Diagnostic</dt><dd>{derniere_consultation.diagnostic || '—'}</dd></div>
              <div><dt className="text-gray-400">Prescription</dt><dd>{derniere_consultation.prescription || '—'}</dd></div>
            </dl>
          ) : (
            <p className="text-sm text-gray-400">Aucune consultation enregistrée pour le moment.</p>
          )}
        </div>
      </div>

      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Historique des rendez-vous ({historique.length})
      </h2>
      <div className="space-y-2">
        {historique.map((rdv) => {
          const isOpen = openId === rdv.id
          return (
            <div key={rdv.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <button
                onClick={() => setOpenId(isOpen ? null : rdv.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-medium">{new Date(rdv.date_heure).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                  <p className="text-xs text-gray-400">{rdv.motif || 'Sans motif précisé'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUT_STYLES[rdv.statut]}`}>{STATUT_LABELS[rdv.statut]}</span>
                  {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-800 pt-3">
                  {editingConsult === rdv.id ? (
                    <div className="space-y-2">
                      <textarea placeholder="Diagnostic" rows={2} value={form.diagnostic}
                        onChange={(e) => setForm({ ...form, diagnostic: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-sm" />
                      <textarea placeholder="Notes" rows={2} value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-sm" />
                      <textarea placeholder="Prescription" rows={2} value={form.prescription}
                        onChange={(e) => setForm({ ...form, prescription: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent text-sm" />
                      <div className="flex gap-2">
                        <button onClick={() => setEditingConsult(null)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                          Annuler
                        </button>
                        <button onClick={() => handleSaveConsultation(rdv.id)} disabled={saving}
                          className="text-xs px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60">
                          Enregistrer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm space-y-1.5">
                      {rdv.consultation ? (
                        <>
                          <p><span className="text-gray-400">Diagnostic :</span> {rdv.consultation.diagnostic || '—'}</p>
                          <p><span className="text-gray-400">Notes :</span> {rdv.consultation.notes || '—'}</p>
                          <p><span className="text-gray-400">Prescription :</span> {rdv.consultation.prescription || '—'}</p>
                        </>
                      ) : (
                        <p className="text-gray-400">Aucun compte-rendu pour ce rendez-vous.</p>
                      )}
                      <button onClick={() => startEdit(rdv)} className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                        {rdv.consultation ? 'Modifier le compte-rendu' : 'Ajouter un compte-rendu'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
