import DocsSidebar from "./_components/docs-sidebar"
import DocsMobileNav from "./_components/docs-mobile-nav"

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
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
