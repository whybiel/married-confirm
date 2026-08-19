import { useState } from 'react'
import { initialGuests, initialGroups, Guest } from '@/data/mock'
import Landing from '@/guest/Landing'
import Confirmar from '@/guest/Confirmar'
import Sucesso from '@/guest/Sucesso'
import AdminAccess from '@/admin/AdminAccess'
import Dashboard from '@/admin/Dashboard'
import Grupos from '@/admin/Grupos'

type Screen = 'landing' | 'confirmar' | 'sucesso' | 'admin-acesso' | 'admin-dashboard' | 'admin-grupos'

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [code, setCode] = useState('')
  const [guests, setGuests] = useState<Guest[]>(initialGuests)

  const navigate = (s: Screen) => setScreen(s)

  const handleGuestConfirm = (confirmedIds: string[]) => {
    setGuests((prev) =>
      prev.map((g) => (confirmedIds.includes(g.id) ? { ...g, confirmed: true, lastAccess: new Date().toISOString() } : g))
    )
    navigate('sucesso')
  }

  if (screen === 'landing') {
    return (
      <Landing
        onSuccess={(c) => { setCode(c); navigate('confirmar') }}
        onAdminLink={() => navigate('admin-acesso')}
      />
    )
  }

  if (screen === 'confirmar') {
    return (
      <Confirmar
        code={code}
        guests={guests}
        onConfirm={handleGuestConfirm}
        onBack={() => navigate('landing')}
      />
    )
  }

  if (screen === 'sucesso') {
    return <Sucesso onBack={() => navigate('landing')} />
  }

  if (screen === 'admin-acesso') {
    return (
      <AdminAccess
        onSuccess={() => navigate('admin-dashboard')}
        onBack={() => navigate('landing')}
      />
    )
  }

  if (screen === 'admin-dashboard') {
    return (
      <Dashboard
        guests={guests}
        groups={initialGroups}
        onUpdate={setGuests}
        onNavigateGroups={() => navigate('admin-grupos')}
        onLogout={() => navigate('landing')}
      />
    )
  }

  if (screen === 'admin-grupos') {
    return (
      <Grupos
        guests={guests}
        groups={initialGroups}
        onNavigateDashboard={() => navigate('admin-dashboard')}
        onLogout={() => navigate('landing')}
      />
    )
  }

  return null
}
