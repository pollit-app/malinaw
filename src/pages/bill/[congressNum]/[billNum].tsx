import { BillAuthorshipType } from "@prisma/client";
import clsx from "clsx";
import lodash from "lodash";
import { useRouter } from "next/router";
import Chip from "../../../components/Chip";
import ContentLayout from "../../../layouts/ContentLayout";
import { trpc } from "../../../utils/trpc";

export default function BillPage() {
  const router = useRouter();
  const { congressNum, billNum } = router.query;

  const { isLoading, isError, error, data } = trpc.bill.getBill.useQuery({
    congressNum: parseInt((congressNum as string) ?? "0"),
    billNum: billNum as string,
  });

  if (!isLoading && isError) {
    console.error(error);
    return error.toString();
  }

  const {
    house,
    title,
    shortTitle,
    abstract,
    dateFiled,
    significance,
    committeeReferrals,
    sourceUrl,
    billAuthorships,
  } = data ?? {};

  const principalAuthors =
    billAuthorships
      ?.filter(
        (authorship) =>
          authorship.authorshipType === BillAuthorshipType.PRINCIPAL
      )
      ?.map((authorship) => authorship.author) ?? [];
  const coAuthors =
    billAuthorships
      ?.filter(
        (authorship) =>
          authorship.authorshipType === BillAuthorshipType.COAUTHOR
      )
      ?.map((authorship) => authorship.author) ?? [];

  const tags =
    committeeReferrals?.map((referral) => referral.committee.name) ?? [];

  return (
    <ContentLayout>
      <div
        className={clsx(
          "flex flex-col justify-center gap-3 md:flex-row md:gap-5 lg:gap-10",
          isLoading ? "animate-pulse" : null
        )}
      >
        {/* Main content */}
        <div className="w-12/12 flex flex-col gap-5 rounded-3xl bg-white py-5 px-10 md:w-9/12">
          {/* Bill information */}
          <section>
            {/* Bill header */}
            <header className="w-12/12 flex flex-row justify-end">
              <p className="text-xs">{congressNum}th Congress</p>
            </header>
            <h1
              className={clsx(
                shortTitle == null ? "text-2xl font-bold" : "text-lg"
              )}
            >
              {billNum}
            </h1>
            {shortTitle != null ? (
              <h1 className="text-2xl font-bold">{shortTitle}</h1>
            ) : null}
            <h3 className="text-sm">
              {lodash.startCase(title?.toLowerCase() ?? "")}
            </h3>
            <div className="flex flex-row flex-wrap gap-2">
              {tags.map((tag) => (
                <Chip text={tag} key={tag} className="bg-emerald-400" />
              ))}
            </div>
          </section>

          {/* Abstract */}
          <section>
            <h1 className="text-xl font-bold">Abstract</h1>
            <p>{abstract}</p>
          </section>

          {/* Principal Authors */}
          <section>
            <h1 className="text-xl font-bold">Principal Authors</h1>
            {principalAuthors.map((author) => (
              <p key={author.id}>{author.name}</p>
            ))}
          </section>

          {/* Co-authors */}
          <section>
            <h1 className="text-xl font-bold">Co-authors</h1>
            {coAuthors.map((author) => (
              <p key={author.id}>{author.name}</p>
            ))}
          </section>
        </div>
      </div>
    </ContentLayout>
  );
}
