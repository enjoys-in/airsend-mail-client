import HomeLayout from "../_components/landing/home-layout";


export default function Home({ children }: { children: React.ReactNode }) {
  return (
    <HomeLayout>
      {children}
    </HomeLayout>
  )
}

