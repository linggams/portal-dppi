import * as React from "react"

import { cn } from "@/lib/utils"

const inputClassName =
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"

function Input({
  className,
  type,
  placeholder,
  onChange,
  ...props
}: React.ComponentProps<"input">) {
  const [fileSelected, setFileSelected] = React.useState(false)
  const showFilePlaceholder = type === "file" && Boolean(placeholder) && !fileSelected

  if (type === "file") {
    return (
      <div className="relative w-full min-w-0">
        <input
          type={type}
          data-slot="input"
          className={cn(
            inputClassName,
            showFilePlaceholder && "text-transparent file:text-foreground",
            className
          )}
          placeholder={placeholder}
          onChange={(event) => {
            setFileSelected(Boolean(event.target.files?.length))
            onChange?.(event)
          }}
          {...props}
        />
        {showFilePlaceholder ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-3 left-[5.75rem] flex items-center truncate text-sm text-muted-foreground"
          >
            {placeholder}
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputClassName, className)}
      placeholder={placeholder}
      onChange={onChange}
      {...props}
    />
  )
}

export { Input }
