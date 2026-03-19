import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[0.5rem] whitespace-nowrap rounded-[0.75rem] text-[0.875rem] font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] [&_svg]:pointer-events-none [&_svg]:size-[1rem] [&_svg]:shrink-0 will-change-transform",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border-[2px] border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:brightness-105 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        neu: "bg-primary text-white hover:bg-primary/95 shadow-xl",
        neuSecondary: "bg-secondary text-primary hover:brightness-105 shadow-xl",
      },
      size: {
        default: "h-[2.5rem] px-[1.25rem] py-[0.5rem]",
        sm: "h-[2rem] rounded-[0.5rem] px-[0.75rem] text-[0.625rem]",
        lg: "h-[3rem] rounded-[1rem] px-[2rem] text-[1rem]",
        xl: "h-[clamp(3.5rem,8vh,4.5rem)] rounded-[1.25rem] px-[clamp(1.5rem,5vw,3.5rem)] text-[clamp(1rem,2vw,1.25rem)] font-black uppercase tracking-tight",
        icon: "h-[2.25rem] w-[2.25rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }