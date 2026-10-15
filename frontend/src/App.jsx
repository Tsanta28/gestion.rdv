import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import RoleGuard from './components/RoleGuard'
import RoleLayout from './layouts/RoleLayout'

import Landing from './pages/public/Landing'
import Login from './pages/public/Login'
import Register from './pages/public/Register'

import PatientDashboard from './pages/patient/Dashboard'
import PatientDoctors from './pages/patient/Doctors'
import DoctorDetail from './pages/patient/DoctorDetail'
import PatientAppointments from './pages/patient/Appointments'
import PatientConsultations from './pages/patient/Consultations'
import PatientAgenda from './pages/patient/Agenda'
import PatientProfile from './pages/patient/Profile'

import DocteurDashboard from './pages/docteur/Dashboard'
import DocteurAgenda from './pages/docteur/Agenda'
import DocteurAppointments from './pages/docteur/Appointments'
import DocteurPatients from './pages/docteur/Patients'
import DocteurPatientDetail from './pages/docteur/PatientDetail'
import DocteurProfile from './pages/docteur/Profile'

import SecretaireDashboard from './pages/secretaire/Dashboard'
import SecretaireAppointments from './pages/secretaire/Appointments'
import SecretairePatients from './pages/secretaire/Patients'
import SecretaireDoctors from './pages/secretaire/Doctors'
import SecretaireAgendas from './pages/secretaire/Agendas'
import SecretaireProfile from './pages/secretaire/Profile'

import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminDoctors from './pages/admin/Doctors'
import AdminSecretaries from './pages/admin/Secretaries'
import AdminAppointments from './pages/admin/Appointments'
import AdminAgendas from './pages/admin/Agendas'
import AdminSettings from './pages/admin/Settings'
import AdminProfile from './pages/admin/Profile'

const HOME_BY_ROLE = {
  admin: '/admin/dashboard',
  secretaire: '/secretaire/dashboard',
  docteur: '/docteur/dashboard',
  patient: '/patient/dashboard',
}

function RoleHome() {
  const { role } = useAuth()
  return <Navigate to={HOME_BY_ROLE[role] || '/login'} replace />
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Connecte : redirection vers l'espace du role */}
        <Route element={<ProtectedRoute />}>
          <Route path="/accueil" element={<RoleHome />} />

          {/* Espace Patient */}
          <Route element={<RoleGuard allowedRoles={['patient']} />}>
            <Route path="/patient" element={<RoleLayout />}>
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="docteurs" element={<PatientDoctors />} />
              <Route path="docteurs/:id" element={<DoctorDetail />} />
              <Route path="rendezvous" element={<PatientAppointments />} />
              <Route path="consultations" element={<PatientConsultations />} />
              <Route path="agenda" element={<PatientAgenda />} />
              <Route path="profil" element={<PatientProfile />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
          </Route>

          {/* Espace Docteur */}
          <Route element={<RoleGuard allowedRoles={['docteur']} />}>
            <Route path="/docteur" element={<RoleLayout />}>
              <Route path="dashboard" element={<DocteurDashboard />} />
              <Route path="agenda" element={<DocteurAgenda />} />
              <Route path="rendezvous" element={<DocteurAppointments />} />
              <Route path="patients" element={<DocteurPatients />} />
              <Route path="patients/:id" element={<DocteurPatientDetail />} />
              <Route path="profil" element={<DocteurProfile />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
          </Route>

          {/* Espace Secretaire */}
          <Route element={<RoleGuard allowedRoles={['secretaire', 'admin']} />}>
            <Route path="/secretaire" element={<RoleLayout />}>
              <Route path="dashboard" element={<SecretaireDashboard />} />
              <Route path="rendezvous" element={<SecretaireAppointments />} />
              <Route path="patients" element={<SecretairePatients />} />
              <Route path="docteurs" element={<SecretaireDoctors />} />
              <Route path="agendas" element={<SecretaireAgendas />} />
              <Route path="agenda" element={<SecretaireAppointments />} />
              <Route path="profil" element={<SecretaireProfile />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
          </Route>

          {/* Espace Admin */}
          <Route element={<RoleGuard allowedRoles={['admin']} />}>
            <Route path="/admin" element={<RoleLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="utilisateurs" element={<AdminUsers />} />
              <Route path="docteurs" element={<AdminDoctors />} />
              <Route path="secretaires" element={<AdminSecretaries />} />
              <Route path="rendezvous" element={<AdminAppointments />} />
              <Route path="agendas" element={<AdminAgendas />} />
              <Route path="parametres" element={<AdminSettings />} />
              <Route path="profil" element={<AdminProfile />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}
