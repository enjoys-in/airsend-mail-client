import React from 'react'
import { LoginForm } from './(version-2)/_components/auth/login-form'

const page = () => {

  return (
    <div suppressHydrationWarning className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}

export default page