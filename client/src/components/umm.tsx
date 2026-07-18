import { Loader } from "./loader";

export function Centered({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={"flex items-center justify-center min-h-dvh flex-col " + className}>
      {children}
    </div>
  );
}

export function Loading() {
  return (
    <Centered>
      <Loader />
    </Centered>
  );
}

export function Error({ error }: { error: Error }) {
  return (
    <Centered>
      <div className="text-red-500">Error: {error.message}</div>
    </Centered>
  );
}
