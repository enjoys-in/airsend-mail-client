import HomeLayout from "../_components/landing/home-layout";

export const dynamic = 'force-static'

export default function Home({ children }: { children: React.ReactNode }) {
  return (
    <HomeLayout>
      {children}
    </HomeLayout>
  )
}

