import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "#/lib/utils"

function Input({
  className,
  type,
  ...props
}: React.ComponentProps<typeof InputPrimitive> & { type?: string }) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:px-3 file:text-sm file:font-medium file:text-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-xs",
        "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        "placeholder:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Input }
