import { Footer } from "./footer";
import { Navbar } from "./navbar";
const HomeLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-screen w-screen overflow-y-auto text-white dark:bg-[#1d1e24fe] bg-neutral-100" >
            <Navbar />
            <main className="xs:mt-2 md:mt-8">
                {children}
            </main>
            <Footer />
        </div>
    )
}

export default HomeLayout