import CustomWidget from '@/components/common/custom-widget'
import HelpPopup from '@/components/common/helpPopup'
import { Suspense } from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense>
      {/* `hpanel-root` switches the whole page (portals included) to the h-panel type scale, see globals.css */}
      <div className="hpanel-root contents">
        <CustomWidget />
        {children}
        <HelpPopup />
      </div>
    </Suspense>
  )
}

export default layout
