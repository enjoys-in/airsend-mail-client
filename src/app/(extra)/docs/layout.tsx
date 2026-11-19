import DocsSidebar from "./_components/docs-sidebar";
import DocsMobileNav from "./_components/docs-mobile-nav";

export const dynamic = "force-static";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0c0e12] text-neutral-900 dark:text-neutral-100 transition-colors">
      <div className="flex">
        <DocsSidebar />
        <main className="flex-1 min-w-0">
          {/* Pages that render a right-hand "On this page" rail mark themselves with [data-docs-wide]
              and get a wider container; every other docs page keeps max-w-4xl. */}
          <div className="max-w-4xl has-[[data-docs-wide]]:max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
            <DocsMobileNav />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}