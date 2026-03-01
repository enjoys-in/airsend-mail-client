"use client"

import { ConfirmationModal } from '@/components/common/confirmationModal';
import { LandingPage } from './_components/landing'
import HomeLayout from './_components/landing/home-layout'
import PromoBanner from "@/components/common/promo-banner";

export default function Home() {

  return (
    <HomeLayout>
      <PromoBanner />
      <LandingPage />
      <ConfirmationModal title="Confirmation" message="It's Under Development" onConfirm={() => { }} />

    </HomeLayout>
  )
}

