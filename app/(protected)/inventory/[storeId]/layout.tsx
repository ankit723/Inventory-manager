import Sidebar from "@/components/navbar/sidebar"

interface LayoutProps {
  children: React.ReactNode;
  params: {
    storeId: string;
  };
}

export default function DashboardLayout({
  children,
  params
}: LayoutProps) {
  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[10] bg-gray-900 mt-20">
        <div className="flex flex-col flex-grow overflow-y-auto">
          <Sidebar storeId={params.storeId} />
        </div>
      </div>
      <main className="md:pl-72 h-full">
        <div className="h-full p-4">
          {children}
        </div>
      </main>
    </div>
  )
}