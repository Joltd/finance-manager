import { UserRole } from '@/types/user'

export const homes: Record<UserRole, string> = {
  [UserRole.ADMIN]: '/admin',
  [UserRole.USER]: '/',
}
