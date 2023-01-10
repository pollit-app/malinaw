import { CongressHouse, Politician } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import type { ReactElement } from "react";

export interface PoliticianBubbleProps {
  politician: Politician;
  className?: string;
}

/**
 * A small preview bubble for a Politician
 */
export default function PoliticianBubble({
  politician,
  className,
}: PoliticianBubbleProps): ReactElement {
  const designation =
    politician.house == null
      ? null
      : politician.house === CongressHouse.HOUSE_OF_REPRESENTATIVES
      ? "House of Representatives"
      : "Senate";

  return (
    <div
      className={clsx(
        className,
        "flex flex-row gap-5 rounded-3xl",
        className?.includes("bg-") ? null : "bg-slate-200"
      )}
    >
      <Image
        src={politician.photoUrl ?? "/user.png"}
        height={80}
        width={80}
        alt={politician.name}
        className="aspect-square rounded-l-3xl object-cover object-top"
      />
      <div className="flex flex-col py-3">
        <a
          className="text-lg font-bold text-sky-500 transition-transform hover:translate-y-[-2px]"
          href={`/politician/${politician.id}`}
          target="_blank"
          rel="noreferrer"
        >
          {politician.name}
        </a>
        <p className="text-sm">{designation}</p>
        {politician.additionalTitle == null ? null : (
          <p className="text-sm">{politician.additionalTitle}</p>
        )}
        {politician.partyList == null ? (
          <>
            <p className="text-sm">{politician.role}</p>
            <p className="text-sm">{politician.location}</p>
          </>
        ) : (
          <p className="text-sm">{politician.partyList}</p>
        )}
      </div>
    </div>
  );
}
