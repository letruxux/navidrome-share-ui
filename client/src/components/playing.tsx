export const Playing = ({
  animated = true,
  ...props
}: React.HTMLProps<HTMLDivElement> & { animated?: boolean }) => {
  return (
    <div
      {...props}
      className={
        "size-4 text-white flex items-center justify-center gap-1 " +
        (props.className ?? "")
      }
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={"w-1 rounded-full bg-current " + (animated ? "animate-wave" : "")}
          style={{
            animationDelay: animated ? `${i * 150}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
};
