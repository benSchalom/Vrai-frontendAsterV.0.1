"use client"

import type * as React from "react"

interface InputProps {
  type?: string
  value?: any
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  name?: string
  id?: string
}

export function Input({
  type = "text",
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  className = "",
  name,
  id,
}: InputProps) {
  const baseClasses =
    "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive"

  const allClasses = `${baseClasses} ${className}`

  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={allClasses}
      name={name}
      id={id}
      data-slot="input"
    />
  )
}
