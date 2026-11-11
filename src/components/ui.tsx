import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function TypeBadge({ type }: { type: { name: string; color: string } | null }) {
  if (!type) return null;
  return (
    <span
      className="inline-flex h-5 items-center rounded px-1.5 text-[11px] font-semibold uppercase tracking-wide text-white"
      style={{ backgroundColor: type.color, textShadow: "0 1px 0 rgb(0 0 0 / 0.25)" }}
    >
      {type.name}
    </span>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-4 border-b border-stone-200 pb-2">
        <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1 text-xs font-medium text-stone-600 ${className}`}>
      {label}
      {children}
    </label>
  );
}

const control =
  "rounded-md border border-stone-300 bg-white px-2.5 py-1.5 text-base text-stone-900 outline-none focus-visible:border-stone-500 focus-visible:ring-2 focus-visible:ring-stone-200 sm:text-sm";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${control} ${props.className?.match(/(^|\s)w-/) ? "" : "w-full"} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea rows={3} {...props} className={`${control} ${props.className?.match(/(^|\s)w-/) ? "" : "w-full"} ${props.className ?? ""}`} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={`${control} ${props.className?.match(/(^|\s)w-/) ? "" : "w-full"} ${props.className ?? ""}`} />;
}

export function Button({ variant = "primary", ...props }: ComponentProps<"button"> & { variant?: "primary" | "ghost" | "danger" }) {
  const styles = {
    primary: "bg-stone-900 text-white hover:bg-stone-700",
    ghost: "border border-stone-300 bg-white text-stone-800 hover:bg-stone-100",
    danger: "text-red-700 hover:bg-red-50",
  }[variant];
  return (
    <button
      {...props}
      className={`inline-flex h-8 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors active:scale-[0.98] disabled:opacity-50 ${styles} ${props.className ?? ""}`}
    />
  );
}

export function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-8 items-center rounded-md bg-stone-900 px-3 text-sm font-medium text-white transition-colors hover:bg-stone-700"
    >
      {children}
    </Link>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-md border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500">{children}</p>;
}
