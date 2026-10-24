import type { ButtonHTMLAttributes } from "react";

const VARIANTS = {
  primary:
    "bg-olive-700 text-cream shadow-[0_4px_0_var(--color-olive-900)] hover:bg-olive-900 active:translate-y-0.5 active:shadow-[0_2px_0_var(--color-olive-900)]",
  gold: "bg-gold text-olive-900 shadow-[0_4px_0_var(--color-olive-700)] hover:brightness-105 active:translate-y-0.5 active:shadow-[0_2px_0_var(--color-olive-700)]",
  secondary: "bg-cream text-olive-900 ring-2 ring-olive-300 hover:ring-gold",
  ghost: "text-olive-700 hover:bg-olive-300/30",
  danger: "bg-cream text-olive-900 ring-2 ring-terracotta hover:bg-terracotta/15",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-extrabold transition focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50";

export const buttonClass = (variant: ButtonVariant = "primary", className = "") =>
  `${BUTTON_BASE} ${VARIANTS[variant]} ${className}`;

export const Button = ({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) => (
  <button type={type} className={buttonClass(variant, className)} {...props} />
);
