import type * as React from "react"

interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = "" }: CardProps) {
  const baseClasses = "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm"
  const allClasses = `${baseClasses} ${className}`

  return (
    <div className={allClasses} data-slot="card">
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  const baseClasses =
    "grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto]"
  const allClasses = `${baseClasses} ${className}`

  return (
    <div className={allClasses} data-slot="card-header">
      {children}
    </div>
  )
}

interface CardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

export function CardTitle({ children, className = "" , style}: CardTitleProps) {
  const baseClasses = "leading-none font-semibold"
  const allClasses = `${baseClasses} ${className}`

  return (
    <div className={allClasses} style = {style} data-slot="card-title">
      {children}
    </div>
  )
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLDivElement>  {
  children: React.ReactNode
  className?: string
}

export function CardDescription({ children, className = "", style }: CardDescriptionProps) {
  const baseClasses = "text-muted-foreground text-sm"
  const allClasses = `${baseClasses} ${className}`

  return (
    <div className={allClasses} style = {style}  data-slot="card-description">
      {children}
    </div>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className = "" }: CardContentProps) {
  const baseClasses = "px-6"
  const allClasses = `${baseClasses} ${className}`

  return (
    <div className={allClasses} data-slot="card-content">
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  const baseClasses = "flex items-center px-6"
  const allClasses = `${baseClasses} ${className}`

  return (
    <div className={allClasses} data-slot="card-footer">
      {children}
    </div>
  )
}
