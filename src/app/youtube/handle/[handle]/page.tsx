'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ChannelHandlePage() {
  const params = useParams()
  const router = useRouter()
  const handle = params.handle as string

  useEffect(() => {
    // Redirect to the existing channel page with the handle as a query parameter
    router.replace(`/channel?q=@${handle}`)
  }, [handle, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-rausch border-t-transparent"></div>
    </div>
  )
}
