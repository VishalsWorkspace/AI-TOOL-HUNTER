'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  // Use your real key if you have it, otherwise leave as placeholder for now
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || 'phc_placeholder_key', {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only', 
    session_recording: {
        maskAllInputs: false,
    }
  })
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}