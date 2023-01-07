import { useRouter } from "next/router";
import Chip from "../components/Chip";
import ContentLayout from "../layouts/ContentLayout";
import SearchBar from "../components/SearchBar";
import { trpc } from "../utils/trpc";
import BillBubble from "../components/BillBubble";
import PoliticianBubble from "../components/PoliticianBubble";

export default function PoliticianPage() {
  const router = useRouter();
  const { query: startQuery } = router.query;

  const { isLoading, isError, error, data } = trpc.search.search.useQuery({
    query: startQuery as string,
  });

  console.log(data);

  const { politicians, bills, committees } = data ?? {
    politicians: [],
    bills: [],
    committees: [],
  };

  return (
    <ContentLayout>
      <SearchBar
        className="mt-3"
        startQuery={startQuery as string}
        onEnter={(query) => {
          router.push({
            query: { query },
          });
        }}
      />

      {/* Tags */}
      <div className="flex flex-row flex-wrap gap-2">
        {committees.map((committee) => (
          <Chip text={committee.name} key={committee.name} />
        ))}
      </div>

      {/* Bills */}
      <div className="mt-5 flex flex-col gap-5">
        {bills.map((bill) => (
          <BillBubble
            bill={bill}
            key={bill.id}
            className="w-12/12 bg-white md:w-8/12"
          />
        ))}
      </div>

      {/* Politicians */}
      <div className="mt-5 flex flex-col gap-5">
        {politicians.map((politician) => (
          <PoliticianBubble
            politician={politician}
            key={politician.id}
            className="w-12/12 bg-white md:w-8/12"
          />
        ))}
      </div>
    </ContentLayout>
  );
}
