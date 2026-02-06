import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-300 active:scale-95 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-lg shadow-destructive/20 hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-2 border-slate-200 bg-transparent text-slate-700 hover:border-primary/50 hover:text-primary hover:bg-primary/5 dark:border-slate-800 dark:hover:bg-slate-800",
        secondary:
          "bg-white/50 backdrop-blur-md border border-white/20 text-slate-700 hover:bg-white/80 shadow-sm hover:shadow-md",
        ghost:
          "hover:bg-primary/10 hover:text-primary text-slate-600",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "bg-white/20 backdrop-blur-lg border border-white/30 text-white hover:bg-white/30 shadow-sm",
        glassDark: "bg-slate-900/20 backdrop-blur-lg border border-slate-900/10 text-slate-900 hover:bg-slate-900/30 shadow-sm",
      },
      size: {
        default: "h-11 px-6 py-2 has-[>svg]:px-4",
        sm: "h-9 rounded-full gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-full px-8 has-[>svg]:px-5",
        icon: "size-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> & {
      asChild?: boolean;
    }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
