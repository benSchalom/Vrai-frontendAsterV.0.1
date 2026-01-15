"use client"

import type * as React from "react"

interface LabelProps {
  children: React.ReactNode
  htmlFor?: string
  className?: string
}

export function Label({ children, htmlFor, className = "" }: LabelProps) {
  const baseClasses =
    "flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"

  const allClasses = `${baseClasses} ${className}`

  return (
    <label htmlFor={htmlFor} className={allClasses} data-slot="label">
      {children}
    </label>
  )
}
