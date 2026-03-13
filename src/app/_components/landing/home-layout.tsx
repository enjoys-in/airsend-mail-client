import PromoBanner from "@/components/common/promo-banner";
import { Footer } from "./footer";
import { Navbar } from "./navbar";
const HomeLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-screen w-screen overflow-y-auto text-white dark:bg-[#201B39] bg-neutral-100" >
            <PromoBanner />
            <Navbar />
            <main className="xs:mt-2 md:mt-8">
                {children}
            </main>
            <Footer />
        </div>
    )
}

export default HomeLayout