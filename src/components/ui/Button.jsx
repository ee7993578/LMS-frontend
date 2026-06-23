import { forwardRef } from "react";
import clsx from "clsx";

const variants = {
  primary:
    "bg-gradient-to-br from-amber-400 to-amber-500 text-white hover:from-amber-300 hover:to-amber-400 shadow-[var(--shadow-glow-amber)] active:scale-[0.98]",
  secondary:
    "bg-ink-800 text-ink-100 border border-ink-600 hover:bg-ink-700 active:scale-[0.98]",
  ghost:
    "bg-transparent text-ink-200 hover:bg-ink-800 hover:text-ink-50",
  outline:
    "bg-transparent border border-ink-600 text-ink-100 hover:border-amber-400 hover:text-amber-300",
  danger:
    "bg-danger text-white hover:bg-danger/90 active:scale-[0.98]",
  link: "bg-transparent text-amber-400 hover:text-amber-300 underline-offset-4 hover:underline p-0",
};

const sizes = {
  sm: "h-8 px-3 text-sm rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
  icon: "h-10 w-10 rounded-xl",
};

const Button = forwardRef(
  (
    {
      children,
      variant = "primary",
      size = "md",
      className,
      loading = false,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={clsx(
          "inline-flex items-center justify-center font-medium transition-all duration-150 whitespace-nowrap select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
          variants[variant],
          variant !== "link" && sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
