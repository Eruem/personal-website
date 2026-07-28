import { twMerge } from "tailwind-merge";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={twMerge(
          "border-b-2 border-[#111111] bg-transparent px-3 py-2 font-mono text-sm transition-colors duration-200",
          "placeholder:text-neutral-400",
          "focus:bg-[#F0F0F0] focus:outline-none",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={twMerge(
          "border-b-2 border-[#111111] bg-transparent px-3 py-2 font-mono text-sm transition-colors duration-200 resize-y min-h-[80px]",
          "placeholder:text-neutral-400",
          "focus:bg-[#F0F0F0] focus:outline-none",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
