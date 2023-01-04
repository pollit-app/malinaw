import { useRouter } from "next/router";
import ContentLayout from "../../components/layouts/ContentLayout";

export default function PoliticianPage() {
  const router = useRouter();
  const { id } = router.query;

  const name = "Abalos, JC";
  const designation = "House of Representatives";
  const party = "Party List, 4PS";

  const committees = ["Agriculture and Food", "Economic Affairs"];

  return (
    <ContentLayout>
      <div className="space-between flex flex-col gap-8">
        <aside className="flex w-3/12 flex-col rounded-3xl bg-white">
          <img
            src="https://hrep-website.s3.ap-southeast-1.amazonaws.com/members/19th/abalos.jpg"
            className="w-100 aspect-square rounded-3xl object-cover object-top"
          />
          <div className="p-5">
            <p className="text-3xl font-bold">{name}</p>
            <p>{designation}</p>
            <p>{party}</p>
          </div>

          <div className="p-5">
            <p className="text-xl font-bold">Committees</p>
            {committees.map((committee) => (
              <p className="mt-3 w-fit rounded-full bg-gray-300 px-3 py-1">
                {committee}
              </p>
            ))}
          </div>
        </aside>

        <section className="bg-white"></section>
      </div>
    </ContentLayout>
  );
}
