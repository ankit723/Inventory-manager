import Navbar from '@/components/navbar/bar1'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col ">
        <Navbar />
        <main className="flex-1">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                {children}
            </div>
        </main>
    </div>
  )
}