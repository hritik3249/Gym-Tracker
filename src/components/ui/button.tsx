import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-acid text-ink hover:brightness-110",
        variant === "secondary" && "border border-line bg-white/5 text-cream hover:bg-white/10",
        variant === "ghost" && "text-steel hover:bg-white/5 hover:text-cream",
        variant === "danger" && "bg-red-500/15 text-red-200 hover:bg-red-500/25",
        className,
      )}
      {...props}
    />
  );
}
