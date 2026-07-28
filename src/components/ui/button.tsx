import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { ButtonHTMLAttributes, forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest transition-all duration-200 ease-out min-h-[44px] min-w-[44px] px-6 py-3 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[#111111] text-[#F9F9F7] border border-transparent hover:bg-white hover:text-[#111111] hover:border-[#111111]",
        secondary:
          "border border-[#111111] bg-transparent text-[#111111] hover:bg-[#111111] hover:text-[#F9F9F7]",
        ghost:
          "border-none bg-transparent text-[#111111] hover:bg-[#E5E5E0]",
        link: "border-none bg-transparent text-[#111111] underline-offset-4 decoration-2 decoration-[#CC0000] hover:underline px-0 min-h-0",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, fullWidth, ...props }, ref) => {
    return (
      <button
        className={twMerge(buttonVariants({ variant, fullWidth }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
