import clsx from "clsx";
import type { ReactElement } from "react";

export interface ChipProps {
  text: string;
  className?: string;
}

/**
 * A rounded chip containing text
 */
export default function Chip({ text, className }: ChipProps): ReactElement {
  return (
    <p
      className={clsx(
        className,
        "mt-3 w-fit rounded-full bg-cyan-200 px-3 py-1 text-sm"
      )}
    >
      {text}
    </p>
  );
}
