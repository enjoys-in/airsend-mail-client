import CustomWidget from '@/components/common/custom-widget'
import { Suspense } from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense>
      <CustomWidget />
      {children}
    </Suspense>
  )
}

export default layout