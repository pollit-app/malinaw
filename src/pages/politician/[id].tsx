import { useRouter } from "next/router";
import ContentLayout from "../../components/layouts/ContentLayout";
import { LinkIcon } from "@heroicons/react/24/outline";
import { trpc } from "../../utils/trpc";
import { CongressHouse } from "@prisma/client";
import clsx from "clsx";
import Image from "next/image";
import lodash from "lodash";

export default function PoliticianPage() {
  const router = useRouter();
  const { id } = router.query;

  const { isLoading, isError, error, data } =
    trpc.politician.getPoliticianData.useQuery({
      id: id as string,
    });

  if (isError) {
    console.error(error);
    return error;
  }

  const { politician, topStances } = data ?? {};
  const {
    house,
    name,
    role,
    profileUrl,
    additionalTitle,
    partyList,
    location,
    photoUrl,
    billAuthorships,
    memberCommittees,
  } = politician ?? {};

  const committees =
    memberCommittees?.map((membership) => membership.committee.name) ?? [];
  committees.sort(
    (committeeA, committeeB) => committeeA.length - committeeB.length
  );

  const designation =
    house == null
      ? null
      : house === CongressHouse.HOUSE_OF_REPRESENTATIVES
      ? "House of Representatives"
      : "Senate";

  const tags = topStances?.slice(0, 5) ?? [];
  const bills = billAuthorships?.map((authorship) => authorship.bill) ?? [];
  bills.sort((billA, billB) => billA.billNum.localeCompare(billB.billNum));
  console.log(bills);

  return (
    <ContentLayout>
      <div
        className={clsx(
          "flex flex-col justify-between gap-3 md:flex-row md:gap-5 lg:gap-10",
          isLoading ? "animate-pulse" : null
        )}
      >
        {/* Profile box */}
        <aside className="w-12/12 flex h-fit flex-col rounded-3xl bg-white md:w-3/12">
          {isLoading ? (
            <>
              <div className="w-100 m-3 h-[15rem] rounded-3xl bg-gray-200" />
              <div className="w-100 m-3 h-2 rounded-full bg-gray-200" />
              <div className="w-100 m-3 h-2 rounded-full bg-gray-200" />
              <div className="w-100 m-3 h-2 rounded-full bg-gray-200" />
            </>
          ) : (
            <>
              <Image
                src={photoUrl ?? "/user.png"}
                className="w-100 aspect-square rounded-t-3xl object-cover object-top"
                width={512}
                height={512}
                alt="Politician photo"
              />
            </>
          )}

          <div className="p-5">
            <a
              className="text-2xl font-bold text-sky-500"
              href={profileUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
            >
              {name}
            </a>
            <p>{designation}</p>
            {additionalTitle == null ? null : <p>{additionalTitle}</p>}
            {partyList == null ? (
              <>
                <p className="text-sm">{role}</p>
                <p className="text-sm">{location}</p>
              </>
            ) : (
              <p className="text-sm">{partyList}</p>
            )}
          </div>

          <div className="p-5">
            {committees.length == 0 ? null : (
              <p className="text-xl font-bold">Committees</p>
            )}
            <div className="flex flex-row flex-wrap gap-1">
              {committees.map((committee) => (
                <p
                  className="mt-3 w-fit rounded-full bg-cyan-200 px-3 py-1 text-sm"
                  key={committee}
                >
                  {committee}
                </p>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <section className="w-12/12 flex flex-col gap-5 rounded-3xl bg-white py-5 px-10 md:w-9/12">
          <div className="flex flex-row flex-wrap gap-2">
            {tags.map((tag) => (
              <p
                className="mt-3 w-fit rounded-full bg-emerald-400 px-3 py-1 text-sm"
                key={tag}
              >
                {tag}
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-5">
            {isLoading ? (
              <>
                <div className="w-100 flex flex-row gap-3">
                  <div className="h-10 w-28 rounded-2xl bg-gray-200" />
                  <div className="h-10 w-28 rounded-2xl bg-gray-200" />
                  <div className="h-10 w-28 rounded-2xl bg-gray-200" />
                </div>
                <div className="w-100 m-3 h-28 rounded-3xl bg-gray-200" />
                <div className="w-100 m-3 h-28 rounded-3xl bg-gray-200" />
                <div className="w-100 m-3 h-28 rounded-3xl bg-gray-200" />
              </>
            ) : null}
            {bills.map((bill) => (
              <div
                className="rounded-3xl bg-slate-200 px-5 py-3"
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
                  {bill.shortTitle ??
                    lodash.startCase(bill.title?.toLowerCase() ?? "")}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ContentLayout>
  );
}
