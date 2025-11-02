import { useUserStore } from '@/store/user'
import { UserRole } from '@/types/user'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

export const useHome = () => {
  const userStore = useUserStore('data')
  const router = useRouter()

  const home = useMemo(() => {
    return userStore.data?.role === UserRole.USER
      ? '/'
      : userStore.data?.role === UserRole.ADMIN
        ? '/admin'
        : '/login'
  }, [userStore.data?.role])

  const redirect = () => {
    router.push(home)
  }

  return {
    home,
    redirect,
  }
}
