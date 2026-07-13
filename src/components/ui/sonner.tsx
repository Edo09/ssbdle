import { Toaster as Sonner, type ToasterProps } from 'sonner'

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      toastOptions={{
        style: {
          background: 'var(--card)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
          fontFamily: 'var(--font-sans)',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
