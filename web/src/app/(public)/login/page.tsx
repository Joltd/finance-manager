'use client'

import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRequest } from '@/hooks/use-request'
import { userUrls } from '@/api/user'
import { Spinner } from '@/components/ui/spinner'
import { useRouter } from 'next/navigation'

type LoginFormData = z.infer<typeof formSchema>

const formSchema = z.object({
  login: z.string(),
  password: z.string(),
})

export default function Page() {
  const { loading, error, submit, reset } = useRequest(userUrls.login)
  const form = useForm<LoginFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: '',
      password: '',
    },
  })
  const router = useRouter()

  const onSubmit = (data: LoginFormData) => {
    submit(data).then(() => {
      reset()
      router.push('/')
    })
  }

  return (
    <Card className="w-80">
      <CardContent>
        <form id="login-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="login"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Login</FieldLabel>
                  <Input {...field} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <Input {...field} type="password" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field>
          {!!error && <FieldError errors={[{ message: error }]} />}
          <Button type="submit" form="login-form">
            {loading && <Spinner />}
            Login
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
