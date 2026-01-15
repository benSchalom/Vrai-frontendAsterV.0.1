"use client"

import type * as React from "react"

interface ButtonProps extends React.HTMLAttributes<HTMLDivElement>{
  children: React.ReactNode
  onClick?: () => void
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function Button({
  style,
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "default",
  size = "default",
  className = "",
}: ButtonProps) {
  // Base classes - toujours appliquées
  const baseClasses =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"

  // Variant classes
  let variantClasses = ""
  if (variant === "default") {
    variantClasses = "bg-primary text-primary-foreground hover:bg-primary/90"
  } else if (variant === "destructive") {
    variantClasses = "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20"
  } else if (variant === "outline") {
    variantClasses = "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground"
  } else if (variant === "secondary") {
    variantClasses = "bg-secondary text-secondary-foreground hover:bg-secondary/80"
  } else if (variant === "ghost") {
    variantClasses = "hover:bg-accent hover:text-accent-foreground"
  } else if (variant === "link") {
    variantClasses = "text-primary underline-offset-4 hover:underline"
  }

  // Size classes
  let sizeClasses = ""
  if (size === "default") {
    sizeClasses = "h-9 px-4 py-2"
  } else if (size === "sm") {
    sizeClasses = "h-8 rounded-md gap-1.5 px-3"
  } else if (size === "lg") {
    sizeClasses = "h-10 rounded-md px-6"
  } else if (size === "icon") {
    sizeClasses = "size-9"
  }

  const allClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`

  return (
    <button style = {style} type={type} onClick={onClick} disabled={disabled} className={allClasses} data-slot="button">
      {children}
    </button>
  )
}
