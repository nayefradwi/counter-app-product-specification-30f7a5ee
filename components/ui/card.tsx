import * as React from 'react';

/**
 * shadcn/ui-compatible Card primitives.
 *
 * Provides `Card`, `CardHeader`, `CardTitle`, `CardDescription`,
 * `CardContent`, and `CardFooter` building blocks. Implementation is
 * intentionally dependency-light (no class-variance-authority or `cn`
 * helper) so the file is self-contained and matches the style used by
 * the other primitives in `components/ui/`.
 */

function cx(...classes: Array<string | undefined | false | null>): string {
  return classes.filter(Boolean).join(' ');
}

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  function Card({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cx(
          'rounded-lg border bg-card text-card-foreground shadow-sm',
          className,
        )}
        {...props}
      />
    );
  },
);

export const CardHeader = React.forwardRef<HTMLDivElement, CardProps>(
  function CardHeader({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cx('flex flex-col space-y-1.5 p-6', className)}
        {...props}
      />
    );
  },
);

export type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  function CardTitle({ className, ...props }, ref) {
    return (
      <h3
        ref={ref}
        className={cx(
          'text-2xl font-semibold leading-none tracking-tight',
          className,
        )}
        {...props}
      />
    );
  },
);

export type CardDescriptionProps =
  React.HTMLAttributes<HTMLParagraphElement>;

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  CardDescriptionProps
>(function CardDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      className={cx('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});

export const CardContent = React.forwardRef<HTMLDivElement, CardProps>(
  function CardContent({ className, ...props }, ref) {
    return (
      <div ref={ref} className={cx('p-6 pt-0', className)} {...props} />
    );
  },
);

export const CardFooter = React.forwardRef<HTMLDivElement, CardProps>(
  function CardFooter({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cx('flex items-center p-6 pt-0', className)}
        {...props}
      />
    );
  },
);

export default Card;
