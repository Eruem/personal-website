import { twMerge } from "tailwind-merge";
import { HTMLAttributes, forwardRef } from "react";

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** "thin" = 1px, "heavy" = 4px, "ornament" = ✦ ✦ ✦ */
  variant?: "thin" | "heavy" | "ornament";
}

const Divider = forwardRef<HTMLDivElement, DividerProps>(
  ({ className, variant = "thin", ...props }, ref) => {
    if (variant === "ornament") {
      return (
        <div
          ref={ref}
          className={twMerge(
            "py-8 text-center font-serif text-2xl text-neutral-400 tracking-[1em] select-none",
            className
          )}
          {...props}
        >
          <span aria-hidden="true">&#x2727; &#x2727; &#x2727;</span>
        </div>
      );
    }

    return (
      <hr
        ref={ref as React.Ref<HTMLHRElement>}
        className={twMerge(
          "border-[#111111]",
          variant === "heavy" ? "border-t-4" : "border-t",
          className
        )}
        {...(props as React.HTMLAttributes<HTMLHRElement>)}
      />
    );
  }
);

Divider.displayName = "Divider";

export { Divider };
