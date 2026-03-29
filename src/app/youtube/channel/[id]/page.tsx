'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ChannelIdPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  useEffect(() => {
    // Redirect to the existing channel page with the ID as a query parameter
    router.replace(`/channel?id=${id}`)
  }, [id, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-rausch border-t-transparent"></div>
    </div>
  )
}
