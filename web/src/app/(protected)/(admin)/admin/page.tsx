'use client'
import { AdminUserBrowser } from '@/components/user/admin-user-browser'
import { useAdminUserListStore } from '@/store/user'
import { AdminUserSheet, useAdminUserSheetStore } from '@/components/user/admin-user-sheet'
import { useEffect } from 'react'
import { Section } from '@/components/common/layout/section'
import { ResponsiveButton } from '@/components/common/responsive-button'
import { PlusIcon } from 'lucide-react'
import { DataPlaceholder } from '@/components/common/data-placeholder'
import { Stack } from '@/components/common/layout/stack'
import { Pointable } from '@/components/common/pointable'
import { Layout } from '@/components/common/layout/layout'

export default function Page() {
  const adminUserListStore = useAdminUserListStore(
    'data',
    'fetch',
    'dataFetched',
    'loading',
    'error',
  )
  const adminUserSheet = useAdminUserSheetStore('openWith')

  useEffect(() => {
    adminUserListStore.fetch()
  }, [])

  return (
    <Layout>
      <Section
        text="Users"
        actions={
          <ResponsiveButton
            label="Add user"
            icon={<PlusIcon />}
            onClick={() => adminUserSheet.openWith()}
          />
        }
      >
        <DataPlaceholder {...adminUserListStore}>
          <Stack>
            {adminUserListStore.data?.map((user) => (
              <Pointable key={user.id} onClick={() => adminUserSheet.openWith(user.id)}>
                <Stack orientation="horizontal">
                  <div className="flex-1/3">{user.login}</div>
                  <div className="flex-1/3">{user.name}</div>
                  <div className="flex-1/3">{user.tenant}</div>
                </Stack>
              </Pointable>
            ))}
          </Stack>
        </DataPlaceholder>
        <AdminUserSheet />
      </Section>
    </Layout>
  )
}
