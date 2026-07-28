import { twMerge } from "tailwind-merge";
import { HTMLAttributes, forwardRef } from "react";

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  label?: string;
  heading: string;
  /** Use accent red for the heading (rare — for breaking sections) */
  accent?: boolean;
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, label, heading, accent = false, ...props }, ref) => {
    return (
      <div ref={ref} className={twMerge("py-8", className)} {...props}>
        {label && (
          <p className="font-mono text-xs uppercase tracking-widest text-neutral-500 mb-2">
            {label}
          </p>
        )}
        <h2
          className={twMerge(
            "font-serif text-3xl lg:text-4xl font-black leading-tight",
            accent ? "text-[#CC0000]" : "text-[#111111]"
          )}
        >
          {heading}
        </h2>
      </div>
    );
  }
);

SectionHeader.displayName = "SectionHeader";

export { SectionHeader };
