import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  initialized: boolean
  init: () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    username: string,
  ) => Promise<{ needsConfirmation: boolean }>
  signOut: () => Promise<void>
}

/** Display name for the signed-in user (metadata username, else email prefix). */
export function displayName(user: User | null): string | null {
  if (!user) return null
  const meta = user.user_metadata as { username?: string } | undefined
  return meta?.username || user.email?.split('@')[0] || 'player'
}

let subscribed = false

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,

  init: () => {
    if (subscribed) return
    subscribed = true
    supabase.auth.getSession().then(({ data }) => {
      set({
        session: data.session,
        user: data.session?.user ?? null,
        initialized: true,
      })
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null, initialized: true })
    })
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  },

  signUp: async (email, password, username) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })
    if (error) throw new Error(error.message)
    return { needsConfirmation: !data.session }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null })
  },
}))
