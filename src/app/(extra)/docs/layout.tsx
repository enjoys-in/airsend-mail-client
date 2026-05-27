import DocsSidebar from "./_components/docs-sidebar"
import DocsMobileNav from "./_components/docs-mobile-nav"

export const dynamic = 'force-static'

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 via-neutral-50 to-[#E5E5E5] dark:from-[#201B39] dark:via-[#18181B] dark:to-[#0b0b0c]">
      <div className="flex">
        <DocsSidebar />
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12">
            <DocsMobileNav />
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
