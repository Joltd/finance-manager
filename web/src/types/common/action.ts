import React from 'react'

export interface Action {
  title: string
  hint: string
  icon: React.ReactNode
  available: boolean
  perform: (...args: any) => void
}
