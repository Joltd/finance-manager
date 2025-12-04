import { useUserStore } from '@/store/user'
import { UserRole } from '@/types/user'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

export const useHome = () => {
  const userStore = useUserStore('data')
  const router = useRouter()

  const home = useMemo(() => getHome(userStore.data?.role), [userStore.data?.role])

  const redirect = () => {
    router.push(home)
  }

  return {
    home,
    redirect,
  }
}

export function getHome(role?: UserRole) {
  switch (role) {
    case UserRole.USER:
      return '/'
    case UserRole.ADMIN:
      return '/admin'
    default:
      return '/login'
  }
}
