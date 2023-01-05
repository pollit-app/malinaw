import { useRouter } from "next/router";
import ContentLayout from "../../components/layouts/ContentLayout";
import { LinkIcon } from "@heroicons/react/24/outline";

export default function PoliticianPage() {
  const router = useRouter();
  const { id } = router.query;

  // const { isLoading, isError, isSuccess, error, data } =
  //   trpc.politician.getPoliticianData.useQuery({
  //     id: id as string,
  //   });

  // if (isLoading) {
  //   return "Loading";
  // } else if (isError) {
  //   console.log(error.message);
  //   return error.message;
  // }

  // const { politician, billsAuthored } = data;

  const name = "Abalos, JC";
  const designation = "House of Representatives";
  const party = "Party List, 4PS";

  const committees = ["Agriculture and Food", "Economic Affairs"];
  const tags = ["Health", "Ecology"];

  const bills = [
    {
      billNum: "HB00024",
      url: "#",
      tags: ["Health", "Ecology"],
      shortTitle: "Leyte Ecological Industrial Zone Act",
    },
    {
      billNum: "HB00025",
      url: "#",
      tags: ["Health", "Welfare", "Charity"],
      title:
        "An Act Providing a Free Childcare Center in Barangay Kaligayahan, Quezon City An Act Providing a Free Childcare Center in Barangay Kaligayahan, Quezon City...",
    },
  ];

  return (
    <ContentLayout>
      <div className="flex flex-row justify-between gap-10">
        <aside className="flex w-3/12 flex-col rounded-3xl bg-white">
          <img
            src="/user.png"
            className="w-100 aspect-square rounded-t-3xl object-cover object-top"
          />
          <div className="p-5">
            <p className="text-3xl font-bold">{name}</p>
            <p>{designation}</p>
            <p>{party}</p>
          </div>

          <div className="p-5">
            <p className="text-xl font-bold">Committees</p>
            {committees.map((committee) => (
              <p className="mt-3 w-fit rounded-full bg-cyan-200 px-3 py-1 text-sm">
                {committee}
              </p>
            ))}
          </div>
        </aside>

        <section className="flex w-9/12 flex-col gap-5 rounded-3xl bg-white py-5 px-10">
          <div className="flex flex-row gap-3">
            {tags.map((tag) => (
              <p className="mt-3 w-fit rounded-full bg-gray-300 px-3 py-1 text-sm">
                {tag}
              </p>
            ))}
          </div>
          <div className="flex flex-col gap-5">
            {bills.map((bill) => (
              <div className="rounded-3xl bg-slate-300 px-5 py-3">
                <a
                  href={bill.url}
                  className="flex flex-row items-center gap-2 font-bold transition-colors hover:text-sky-400"
                >
                  {bill.billNum}
                  <LinkIcon className="h-4 w-4" />
                </a>
                <p className="w-100 truncate">
                  {bill.shortTitle ?? bill.title}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ContentLayout>
  );
}
