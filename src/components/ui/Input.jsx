import { forwardRef, useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

export const Label = ({ children, className, required, ...props }) => (
  <label className={clsx("block text-sm font-medium text-ink-300 mb-1.5", className)} {...props}>
    {children}
    {required && <span className="text-amber-400 ml-0.5">*</span>}
  </label>
);

export const Input = forwardRef(
  ({ className, error, icon, type = "text", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">{icon}</span>
        )}
        <input
          ref={ref}
          type={resolvedType}
          className={clsx(
            "w-full h-11 rounded-xl bg-ink-800 border text-ink-50 placeholder:text-ink-400 px-3.5 text-sm transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400",
            icon && "pl-10",
            isPassword && "pr-10",
            error ? "border-danger" : "border-ink-600",
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-200"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export const Select = forwardRef(({ className, error, children, ...props }, ref) => (
  <div>
    <select
      ref={ref}
      className={clsx(
        "w-full h-11 rounded-xl bg-ink-800 border text-ink-50 px-3.5 text-sm transition-colors appearance-none",
        "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400",
        error ? "border-danger" : "border-ink-600",
        className
      )}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
  </div>
));
Select.displayName = "Select";

export const Textarea = forwardRef(({ className, error, ...props }, ref) => (
  <div>
    <textarea
      ref={ref}
      className={clsx(
        "w-full min-h-24 rounded-xl bg-ink-800 border text-ink-50 placeholder:text-ink-400 px-3.5 py-2.5 text-sm transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400",
        error ? "border-danger" : "border-ink-600",
        className
      )}
      {...props}
    />
    {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
  </div>
));
Textarea.displayName = "Textarea";
