import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { fullPortrait, smallPortrait } from '@/lib/assets'
import { initials, universeColor } from '@/lib/fighters'

interface Props {
  name: string
  universe?: string
  /** Use the 512×512 art instead of the roster thumbnail (large avatars). */
  full?: boolean
  className?: string
}

export function CharacterAvatar({ name, universe, full, className }: Props) {
  const color = universeColor(universe ?? name)
  const src = full ? fullPortrait(name) : smallPortrait(name)
  return (
    <Avatar className={cn('rounded-lg', className)}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback
        aria-hidden
        style={{
          background: `linear-gradient(150deg, ${color}, color-mix(in srgb, ${color} 55%, #000))`,
          color: '#fff',
        }}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
