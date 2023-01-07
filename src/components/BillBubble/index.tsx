import { LinkIcon } from "@heroicons/react/24/outline";
import type { Bill, BillCommitteeReferral, Committee } from "@prisma/client";
import clsx from "clsx";
import lodash from "lodash";
import type { ReactElement } from "react";

type PopulatedBill = Bill & {
  committeeReferrals: BillCommitteeReferral &
    {
      committee: Committee;
    }[];
};

export interface BillBubbleProps {
  bill: Bill;
  populated?: false;
  className?: string;
}

export interface BillBubblePopulatedProps {
  bill: PopulatedBill;
  populated: true;
  className?: string;
}

/**
 * A small preview bubble for a Bill
 */
export default function BillBubble({
  bill,
  populated,
  className,
}: BillBubbleProps | BillBubblePopulatedProps): ReactElement {
  const committeeReferrals = populated ? bill.committeeReferrals : [];

  return (
    <div
      className={clsx(
        className,
        "rounded-3xl px-5 py-3",
        className?.includes("bg-") ? null : "bg-slate-200"
      )}
      key={`bill-${bill.billNum}`}
    >
      <a
        href={`/bill/${bill.id}`}
        target="_blank"
        rel="noreferrer"
        className="flex flex-row items-center gap-2 font-bold text-sky-500 transition-transform hover:translate-y-[-2px]"
      >
        {bill.billNum}
        <LinkIcon className="h-4 w-4" />
      </a>
      <p className="w-100 line-clamp-3 lg:line-clamp-2">
        {bill.shortTitle ?? lodash.startCase(bill.title?.toLowerCase() ?? "")}
      </p>
      <div className="mt-3 flex flex-row gap-2">
        {committeeReferrals.map((referral) => (
          <p
            key={referral.committee.name}
            className="w-fit rounded-full bg-cyan-200 px-3 py-1 text-sm"
          >
            {referral.committee.name}
          </p>
        ))}
      </div>
    </div>
  );
}
