'use client';

import dynamic from 'next/dynamic'

const Graph = dynamic(() => import('@/components/Graph'), {
  ssr: false,
})

export default function Home() {
  return (
    <main className="w-full h-screen bg-black">
      <Graph />
    </main>
  )
}
