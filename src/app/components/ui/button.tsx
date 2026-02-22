import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// buttonVariants — used by shadcn components like Calendar
export function buttonVariants(options?: {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive" | "default";
  size?: "sm" | "md" | "lg" | "icon" | "default";
}) {
  const variant = options?.variant ?? "primary";
  const size = options?.size ?? "md";

  const variants: Record<string, string> = {
    primary: "bg-hack-blue text-white hover:bg-hack-blue/90 shadow-lg shadow-hack-blue/20",
    secondary: "bg-hack-purple text-white hover:bg-hack-purple/90 shadow-lg shadow-hack-purple/20",
    ghost: "bg-transparent hover:bg-secondary text-foreground",
    outline: "bg-transparent border border-border hover:bg-secondary text-foreground",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    default: "bg-hack-blue text-white hover:bg-hack-blue/90",
  };

  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4",
    lg: "h-12 px-8 text-lg",
    icon: "h-10 w-10 p-0 flex items-center justify-center",
    default: "h-10 px-4",
  };

  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95 cursor-pointer",
    variants[variant] ?? variants.primary,
    sizes[size] ?? sizes.md,
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
