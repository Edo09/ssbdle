import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Swords } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
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

const emailSchema = z
  .string()
  .refine((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Enter a valid email')
const passwordSchema = z.string().min(6, 'At least 6 characters')
const usernameSchema = z
  .string()
  .min(3, 'At least 3 characters')
  .max(20, 'At most 20 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and _ only')

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: Props) {
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [busy, setBusy] = useState(false)

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
      toast.success('Welcome back!')
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
      if (needsConfirmation) {
        toast.success('Check your email to confirm your account.')
      } else {
        toast.success('Account created — you are in!')
      }
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
          <DialogTitle>Join SMASHDLE</DialogTitle>
          <DialogDescription>
            Save your streaks and climb the leaderboards.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign in</TabsTrigger>
            <TabsTrigger value="signup">Create account</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="mt-4">
            <form onSubmit={handleSignIn} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="si-email">Email</Label>
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
                <Label htmlFor="si-pass">Password</Label>
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
                {busy && <Loader2 className="animate-spin" />} Sign in
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-4">
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="su-user">Username</Label>
                <Input
                  id="su-user"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="shown on the leaderboard"
                  autoComplete="username"
                />
                {fieldError('username')}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-email">Email</Label>
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
                <Label htmlFor="su-pass">Password</Label>
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
                {busy && <Loader2 className="animate-spin" />} Create account
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
