import CustomWidget from '@/components/common/custom-widget'
import HelpPopup from '@/components/common/helpPopup'
import { Suspense } from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense>
      <CustomWidget />
      {children}
      <HelpPopup />
    </Suspense>
  )
}

export default layout