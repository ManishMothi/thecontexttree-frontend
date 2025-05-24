import * as React from "react";

export function Table({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`overflow-x-auto ${className || ""}`}>
      <table className="min-w-full divide-y divide-border bg-card text-card-foreground">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: React.PropsWithChildren) {
  return <thead className="bg-muted">{children}</thead>;
}

export function TBody({ children }: React.PropsWithChildren) {
  return <tbody>{children}</tbody>;
}

export function TRow({ children }: React.PropsWithChildren) {
  return <tr className="border-b last:border-0">{children}</tr>;
}

export function TCell({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <td className={`px-4 py-2 ${className || ""}`}>{children}</td>;
}

export function THeaderCell({ children, className }: React.PropsWithChildren<{ className?: string }>) {
  return <th className={`px-4 py-2 font-semibold text-left ${className || ""}`}>{children}</th>;
}
