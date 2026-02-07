import type * as React from "react"

interface AlertProps {
  children: React.ReactNode
  variant?: "default" | "destructive"
  className?: string
}

export function Alert({ children, variant = "default", className = "" }: AlertProps) {
  const baseClasses =
    "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current"

  let variantClasses = ""
  if (variant === "default") {
    variantClasses = "bg-card text-card-foreground"
  } else if (variant === "destructive") {
    variantClasses = "text-red-600 bg-red-50 border-red-200 [&>svg]:text-red-600 *:data-[slot=alert-description]:text-red-700"
  }

  const allClasses = `${baseClasses} ${variantClasses} ${className}`

  return (
    <div role="alert" className={allClasses} data-slot="alert">
      {children}
    </div>
  )
}

interface AlertTitleProps {
  children: React.ReactNode
  className?: string
}

export function AlertTitle({ children, className = "" }: AlertTitleProps) {
  const baseClasses = "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight"
  const allClasses = `${baseClasses} ${className}`

  return (
    <div className={allClasses} data-slot="alert-title">
      {children}
    </div>
  )
}

interface AlertDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function AlertDescription({ children, className = "" }: AlertDescriptionProps) {
  const baseClasses = "col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed"
  const allClasses = `${baseClasses} ${className}`

  return (
    <div className={allClasses} data-slot="alert-description">
      {children}
    </div>
  )
}
