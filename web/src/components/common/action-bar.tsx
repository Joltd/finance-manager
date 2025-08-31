'use client'
import { Portal } from '@radix-ui/react-portal'
import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Action } from '@/types/common/action'

const ID = 'action-bar'

export interface ActionBarProps {
  open?: boolean
  className?: string
  children: React.ReactNode
}

export function ActionBar({ open, className, children }: ActionBarProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const [available, setAvailable] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    setContainer(document.getElementById(ID))
  }, [])

  useEffect(() => {
    if (open) {
      setAvailable(true)
      setTimeout(() => setShow(true), 0)
    } else {
      setShow(false)
      setTimeout(() => setAvailable(false), 500)
    }
  }, [open])

  return (
    available && (
      <Portal
        container={container}
        className={cn(
          'absolute bottom-4 left-1/2 translate-x-[-50%] translate-y-[200%] z-50 duration-300',
          show && 'translate-y-0',
        )}
      >
        <div className={cn('flex bg-sidebar gap-2 p-2 rounded-md ', className)}>{children}</div>
      </Portal>
    )
  )
}

export function ActionBarContainer() {
  return <div id={ID} />
}

export interface ActionBarButtonProps {
  hint: string
  icon: React.ReactNode
  available: boolean
  perform: () => void
}

export function ActionBarButton({ hint, icon, available, perform }: ActionBarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" disabled={!available} onClick={() => perform()}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{hint}</TooltipContent>
    </Tooltip>
  )
}
