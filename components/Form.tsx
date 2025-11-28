import type { ComponentChildren } from "preact";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ComponentChildren;
}

export function FormField({ label, htmlFor, hint, children }: FormFieldProps) {
  return (
    <div class="form-field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <p class="text-sm text-slate-500">{hint}</p>}
    </div>
  );
}

interface FormActionsProps {
  primary: ComponentChildren;
  secondary?: ComponentChildren;
}

export function FormActions({ primary, secondary }: FormActionsProps) {
  return (
    <div class="flex flex-wrap gap-3 pt-2">
      {primary}
      {secondary}
    </div>
  );
}
