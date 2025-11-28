import type { ComponentChildren } from "preact";

type Variant = "success" | "danger" | "info";

const variantClass: Record<Variant, string> = {
  success: "alert alert-success",
  danger: "alert alert-danger",
  info: "alert",
};

interface AlertProps {
  title?: string;
  children?: ComponentChildren;
  variant?: Variant;
}

export function Alert({ title, children, variant = "info" }: AlertProps) {
  return (
    <div class={variantClass[variant]}>
      {title && <p class="font-semibold mb-1">{title}</p>}
      {children}
    </div>
  );
}
