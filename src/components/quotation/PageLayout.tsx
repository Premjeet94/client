import { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageProps = ComponentPropsWithoutRef<"article">;
type SectionProps = ComponentPropsWithoutRef<"div">;

interface PageLayoutProps extends Omit<PageProps, "children"> {
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  frameClassName?: string;
  contentClassName?: string;
}

export function Page({ className, children, ...props }: PageProps) {
  return (
    <article className={cn("page", className)} {...props}>
      {children}
    </article>
  );
}

export function PageHeader({ className, children, ...props }: SectionProps) {
  return (
    <header className={cn("page-header", className)} {...props}>
      {children}
    </header>
  );
}

export function PageContent({ className, children, ...props }: SectionProps) {
  return (
    <section className={cn("page-content", className)} {...props}>
      {children}
    </section>
  );
}

export function PageFooter({ className, children, ...props }: SectionProps) {
  return (
    <footer className={cn("page-footer", className)} {...props}>
      {children}
    </footer>
  );
}

export default function PageLayout({
  header,
  footer,
  children,
  className,
  frameClassName,
  contentClassName,
  ...props
}: PageLayoutProps) {
  return (
    <Page className={className} {...props}>
      <div className={cn("page-frame", frameClassName)}>
        <PageHeader>{header}</PageHeader>
        <PageContent className={contentClassName}>{children}</PageContent>
        <PageFooter>{footer}</PageFooter>
      </div>
    </Page>
  );
}
