import React from 'react'
import { PageHeader } from '@/components/h-panel/kit'
import ProfileForm from './components/profile-form'

function AccountPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Profile" description="This is how others will see you on the site." />
      <ProfileForm />
    </div>
  )
}

export default AccountPage
