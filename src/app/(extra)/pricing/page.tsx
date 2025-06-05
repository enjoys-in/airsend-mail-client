import React from 'react'
import MainPricing from './_components/MainPricing'
import PricingPage from './_components/NewPlans'
import CompetionPricing from './_components/CompetionPricing'
import ComparePlanDetails from './_components/ComparePlanDetails'

const page = () => {
  return (
    <>
      <PricingPage />
      <MainPricing />
      <ComparePlanDetails />
      {/* <CompetionPricing/> */}
    </>
  )
}

export default page