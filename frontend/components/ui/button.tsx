import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "danger";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

const variantClasses = {
  default: "bg-primary text-primary-foreground shadow hover:bg-primary/90 active:scale-[0.98]",
  outline: "border border-border bg-transparent shadow-sm hover:bg-muted hover:text-foreground text-foreground",
  secondary: "bg-muted text-muted-foreground hover:bg-muted/80",
  ghost: "hover:bg-muted hover:text-foreground text-muted-foreground",
  danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
}

const sizeClasses = {
  default: "h-10 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-12 rounded-lg px-8",
  icon: "h-10 w-10 flex items-center justify-center",
}

const baseClass = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50"

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const composedClass = cn(baseClass, variantClasses[variant], sizeClasses[size], className)
    
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(composedClass, (children as React.ReactElement<any>).props.className),
      })
    }

    return (
      <button
        className={composedClass}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
