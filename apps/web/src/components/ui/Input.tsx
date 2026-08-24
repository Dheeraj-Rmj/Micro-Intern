import { cn } from "@/lib/utils";

/**
 * Input component — styled text input with label, helper text, and error state.
 */
export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string | undefined;
  helperText?: string | undefined;
  error?: string | undefined;
};

export function Input({ className, label, helperText, error, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label !== undefined && (
        <label htmlFor={inputId} className="text-sm font-medium text-[--color-foreground-default]">
          {label}
          {props.required === true && (
            <span className="ml-1 text-[--color-error-500]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <input
        id={inputId}
        className={cn(
          "flex h-10 w-full rounded-lg border bg-[--color-background-default] px-3 py-2",
          "text-sm text-[--color-foreground-default] placeholder:text-[--color-muted-foreground]",
          "transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring] focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error !== undefined
            ? "border-[--color-error-500] focus-visible:ring-[--color-error-500]"
            : "border-[--color-input] hover:border-[--color-muted-foreground]",
          className,
        )}
        aria-describedby={
          error !== undefined
            ? `${inputId}-error`
            : helperText !== undefined
              ? `${inputId}-helper`
              : undefined
        }
        aria-invalid={error !== undefined}
        {...props}
      />

      {error !== undefined && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-[--color-error-500]">
          {error}
        </p>
      )}

      {helperText !== undefined && error === undefined && (
        <p id={`${inputId}-helper`} className="text-xs text-[--color-muted-foreground]">
          {helperText}
        </p>
      )}
    </div>
  );
}

/**
 * Textarea component — same styling as Input.
 */
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string | undefined;
  helperText?: string | undefined;
  error?: string | undefined;
};

export function Textarea({ className, label, helperText, error, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label !== undefined && (
        <label htmlFor={inputId} className="text-sm font-medium text-[--color-foreground-default]">
          {label}
          {props.required === true && (
            <span className="ml-1 text-[--color-error-500]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(
          "flex min-h-[100px] w-full rounded-lg border bg-[--color-background-default] px-3 py-2",
          "text-sm text-[--color-foreground-default] placeholder:text-[--color-muted-foreground]",
          "resize-y transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-ring]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error !== undefined
            ? "border-[--color-error-500]"
            : "border-[--color-input] hover:border-[--color-muted-foreground]",
          className,
        )}
        aria-invalid={error !== undefined}
        {...props}
      />
      {error !== undefined && (
        <p role="alert" className="text-xs text-[--color-error-500]">
          {error}
        </p>
      )}
      {helperText !== undefined && error === undefined && (
        <p className="text-xs text-[--color-muted-foreground]">{helperText}</p>
      )}
    </div>
  );
}
