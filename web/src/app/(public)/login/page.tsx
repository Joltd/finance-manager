'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRequest } from '@/hooks/use-request'
import { userUrls } from '@/api/user'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'

const schema = z.object({
  login: z.string().min(1, 'Введите логин'),
  password: z.string().min(1, 'Введите пароль'),
})

type LoginForm = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(schema),
  })

  const { loading, error, submit } = useRequest<null, LoginForm>(userUrls.auth)

  const onSubmit = async (data: LoginForm) => {
    try {
      await submit({ body: data })
      const redirectUrl = searchParams.get('redirectUrl')
      router.replace(redirectUrl ?? '/')
    } catch {
      // error state managed by useRequest
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">Sign in</CardTitle>
        <CardDescription>Enter login and password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field data-invalid={errors.login ? 'true' : undefined}>
              <FieldLabel htmlFor="login">Логин</FieldLabel>
              <Input
                id="login"
                type="text"
                autoComplete="username"
                autoFocus
                aria-invalid={!!errors.login}
                disabled={loading}
                {...register('login')}
              />
              <FieldError>{errors.login?.message}</FieldError>
            </Field>
            <Field data-invalid={errors.password ? 'true' : undefined}>
              <FieldLabel htmlFor="password">Пароль</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                disabled={loading}
                {...register('password')}
              />
              <FieldError>{errors.password?.message}</FieldError>
            </Field>
            {error && <FieldError>{error}</FieldError>}
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading && <Spinner />}
              Login
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
