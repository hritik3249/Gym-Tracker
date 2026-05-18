import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-lg border border-line bg-white/[0.04] px-3 text-sm text-white outline-none transition placeholder:text-steel focus:border-acid/70 focus:ring-2 focus:ring-acid/10",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-lg border border-line bg-panelSoft px-3 text-sm text-white outline-none transition focus:border-acid/70 focus:ring-2 focus:ring-acid/10",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-lg border border-line bg-white/[0.04] px-3 py-3 text-sm text-white outline-none transition placeholder:text-steel focus:border-acid/70 focus:ring-2 focus:ring-acid/10",
        className,
      )}
      {...props}
    />
  );
}
