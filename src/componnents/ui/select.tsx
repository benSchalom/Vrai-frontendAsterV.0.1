import type * as React from "react"

interface SelectProps {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
  disabled?: boolean
  required?: boolean
  className?: string
  name?: string
  id?: string
}

export function Select({
  value,
  onChange,
  children,
  disabled = false,
  required = false,
  className = "",
  name,
  id,
}: SelectProps) {
  const baseClasses =
    "flex h-9 w-full items-center justify-between gap-2 whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"

  const allClasses = `${baseClasses} ${className}`

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={allClasses}
      name={name}
      id={id}
      data-slot="select"
    >
      {children}
    </select>
  )
}
