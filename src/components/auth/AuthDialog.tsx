import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Swords } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useI18n } from '@/i18n/useI18n'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: Props) {
  const { t } = useI18n()
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

  const emailSchema = z
    .string()
    .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), t('auth.errEmail'))
  const passwordSchema = z.string().min(6, t('auth.errPassword'))
  const usernameSchema = z
    .string()
    .min(3, t('auth.errUserMin'))
    .max(20, t('auth.errUserMax'))
    .regex(/^[a-zA-Z0-9_]+$/, t('auth.errUserChars'))

  function fieldError(key: string) {
    return errors[key] ? (
      <span className="text-xs text-destructive">{errors[key]}</span>
    ) : null
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    const parsed = z
      .object({ email: emailSchema, password: passwordSchema })
      .safeParse({ email, password })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setBusy(true)
    try {
      await signIn(email, password)
      toast.success(t('auth.welcomeBack'))
      onOpenChange(false)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    const parsed = z
      .object({
        email: emailSchema,
        password: passwordSchema,
        username: usernameSchema,
      })
      .safeParse({ email, password, username })
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setBusy(true)
    try {
      const { needsConfirmation } = await signUp(email, password, username)
      toast.success(
        needsConfirmation ? t('auth.checkEmail') : t('auth.accountCreated'),
      )
      onOpenChange(false)
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-1 flex size-11 items-center justify-center rounded-xl bg-primary/15 text-primary sm:mx-0">
            <Swords className="size-6" />
          </div>
          <DialogTitle>{t('auth.title')}</DialogTitle>
          <DialogDescription>{t('auth.subtitle')}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t('auth.signInTab')}</TabsTrigger>
            <TabsTrigger value="signup">{t('auth.signUpTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-4">
            <form onSubmit={handleSignIn} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="si-email">{t('auth.email')}</Label>
                <Input
                  id="si-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                {fieldError('email')}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="si-pass">{t('auth.password')}</Label>
                <Input
                  id="si-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                {fieldError('password')}
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="animate-spin" />} {t('auth.signInBtn')}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="su-user">{t('auth.username')}</Label>
                <Input
                  id="su-user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('auth.usernamePlaceholder')}
                  autoComplete="username"
                />
                {fieldError('username')}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-email">{t('auth.email')}</Label>
                <Input
                  id="su-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                {fieldError('email')}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-pass">{t('auth.password')}</Label>
                <Input
                  id="su-pass"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                {fieldError('password')}
              </div>
              <Button type="submit" className="w-full" disabled={busy}>
                {busy && <Loader2 className="animate-spin" />} {t('auth.createBtn')}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !out[key]) out[key] = issue.message
  }
  return out
}
