import './global.css'
import { Providers } from './providers'
import icon from './icon.jpg'

export const metadata = {
  title: 'Colorclash.io',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>{metadata.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Colorclash.io" />
        <link rel="icon" href={icon as any} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
