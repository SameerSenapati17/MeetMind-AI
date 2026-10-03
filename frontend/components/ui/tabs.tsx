"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value?: string, onValueChange?: (val: string) => void }>(
  ({ className, value, onValueChange, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  )
)
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground", className)}
      {...props}
    />
  )
)
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string, activeValue?: string, setActiveValue?: (val: string) => void }>(
  ({ className, value, activeValue, setActiveValue, ...props }, ref) => {
    const isActive = value === activeValue
    return (
      <button
        ref={ref}
        type="button"
        onClick={() => setActiveValue?.(value)}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50 hover:text-foreground",
          className
        )}
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string, activeValue?: string }>(
  ({ className, value, activeValue, ...props }, ref) => {
    if (value !== activeValue) return null
    return (
      <div
        ref={ref}
        className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}
        {...props}
      />
    )
  }
)
TabsContent.displayName = "TabsContent"

export function TabsGroup({ defaultValue, children, className }: { defaultValue: string, children: React.ReactNode, className?: string }) {
  const [active, setActive] = React.useState(defaultValue)
  
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Pass down active state to direct children (TabsList, TabsContent)
          return React.cloneElement(child as any, { 
            activeValue: active,
            setActiveValue: setActive
          })
        }
        return child
      })}
    </div>
  )
}

export function TabsListGroup({ children, activeValue, setActiveValue, className }: any) {
  return (
    <TabsList className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { activeValue, setActiveValue })
        }
        return child
      })}
    </TabsList>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
