import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { fighterImage, initials, universeColor } from '@/lib/fighters'

interface Props {
  name: string
  gameName: string
  universe?: string
  className?: string
}

export function CharacterAvatar({ name, gameName, universe, className }: Props) {
  const color = universeColor(universe ?? name)
  return (
    <Avatar className={cn('rounded-lg', className)}>
      <AvatarImage src={fighterImage(gameName)} alt={name} />
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
