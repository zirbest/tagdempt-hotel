import { useLocation, useNavigate } from '@solidjs/router'
import { createContext, createSignal, useContext } from 'solid-js'

const AuthContext = createContext<any>()

export function AuthProvider(props: any) {
  const navigate = useNavigate()
  const location = useLocation()
  // const { user, isAuthenticated, login, logout } = useAuth();
  const [user, setUser] = createSignal<null | object>(null)

  async function logIn(data?: any) {
    const resData = await window.electron.ipcRenderer.invoke('login', data)
    setUser(resData)

    resData?.username
      ? navigate(location.pathname === '/login' ? '/' : location.pathname)
      : navigate('/login')
  }

  logIn()

  const auth = [
    user,
    {
      logIn,
      async logOut() {
        await window.electron.ipcRenderer.invoke('logout')
        setUser(null)
        navigate('/login')
      },
    },
  ]

  return (
    <AuthContext.Provider value={auth}>
      {props.children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
