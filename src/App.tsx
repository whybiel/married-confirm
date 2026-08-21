import { useEffect, useState } from 'react'
import { Guest, GroupDef } from '@/data/mock'
import { type ImportRow } from '@/services/importGuests'
import { deleteGuest, fetchAdminLists, replaceFromImport, saveGuest, signOutAdmin, type GuestWrite } from '@/services/adminData'
import { confirmPresence } from '@/services/invite'
import { supabase } from '@/lib/supabase'
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
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authReady, setAuthReady] = useState(false)
  const [guests, setGuests] = useState<Guest[]>([])
  const [groups, setGroups] = useState<GroupDef[]>([])
  const [listsReady, setListsReady] = useState(false)

  const navigate = (s: Screen) => setScreen(s)

  const refreshAdminLists = async () => {
    const data = await fetchAdminLists()
    setGuests(data.guests)
    setGroups(data.groups)
    setListsReady(true)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session)
      setAuthReady(true)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
      if (!session) {
        setGuests([])
        setGroups([])
        setListsReady(false)
      }
    })

    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    refreshAdminLists().catch(() => {
      setListsReady(true)
    })
  }, [isAuthenticated])

  const handleGuestConfirm = async (confirmedIds: string[]) => {
    await confirmPresence(code, confirmedIds)
    navigate('sucesso')
  }

  const handleSaveGuest = async (data: GuestWrite, id?: string) => {
    await saveGuest(data, id, groups)
    await refreshAdminLists()
  }

  const handleDeleteGuest = async (id: string) => {
    await deleteGuest(id)
    await refreshAdminLists()
  }

  const handleImportGuests = async (rows: ImportRow[]) => {
    const data = await replaceFromImport(rows)
    setGuests(data.guests)
    setGroups(data.groups)
  }

  const handleLogout = async () => {
    await signOutAdmin()
    setIsAuthenticated(false)
    navigate('landing')
  }

  const handleAdminSuccess = () => {
    setIsAuthenticated(true)
    navigate('admin-dashboard')
  }

  if (screen === 'landing') {
    return (
      <Landing
        onSuccess={(c) => { setCode(c); navigate('confirmar') }}
        onAdminLink={() => navigate(isAuthenticated ? 'admin-dashboard' : 'admin-acesso')}
      />
    )
  }

  if (screen === 'confirmar') {
    return (
      <Confirmar
        code={code}
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
        onSuccess={handleAdminSuccess}
        onBack={() => navigate('landing')}
      />
    )
  }

  if (!authReady) return null

  if ((screen === 'admin-dashboard' || screen === 'admin-grupos') && !isAuthenticated) {
    return (
      <AdminAccess
        onSuccess={handleAdminSuccess}
        onBack={() => navigate('landing')}
      />
    )
  }

  if (screen === 'admin-dashboard') {
    return (
      <Dashboard
        guests={guests}
        groups={groups}
        loading={!listsReady}
        onSaveGuest={handleSaveGuest}
        onDeleteGuest={handleDeleteGuest}
        onImport={handleImportGuests}
        onNavigateGroups={() => navigate('admin-grupos')}
        onLogout={handleLogout}
      />
    )
  }

  if (screen === 'admin-grupos') {
    return (
      <Grupos
        guests={guests}
        groups={groups}
        onNavigateDashboard={() => navigate('admin-dashboard')}
        onLogout={handleLogout}
      />
    )
  }

  return null
}
