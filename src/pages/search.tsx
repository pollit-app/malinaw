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
      <div className="mt-5 flex flex-row flex-wrap gap-2">
        {/* Loading spinner */}
        {isLoading ? (
          <div className="w-100 flex animate-pulse flex-row gap-3">
            <div className="h-10 w-28 rounded-2xl bg-gray-200" />
            <div className="h-10 w-28 rounded-2xl bg-gray-200" />
            <div className="h-10 w-28 rounded-2xl bg-gray-200" />
          </div>
        ) : (
          committees.map((committee) => (
            <Chip text={committee.name} key={committee.name} />
          ))
        )}
      </div>

      {/* Bills */}
      <div className="mt-5 flex flex-col gap-5">
        {/* Loading spinner */}
        {isLoading ? (
          <div className="flex animate-pulse flex-col gap-5">
            <div className="w-100 m-3 h-28 rounded-3xl bg-gray-200" />
          </div>
        ) : (
          bills.map((bill) => (
            <BillBubble
              bill={bill}
              key={bill.id}
              className="w-12/12 bg-white md:w-8/12"
            />
          ))
        )}
      </div>

      {/* Politicians */}
      <div className="mt-5 flex flex-col gap-5">
        {/* Loading spinner */}
        {isLoading ? (
          <div className="flex animate-pulse flex-col gap-5">
            <div className="w-100 m-3 h-28 rounded-3xl bg-gray-200" />
          </div>
        ) : (
          politicians.map((politician) => (
            <PoliticianBubble
              politician={politician}
              key={politician.id}
              className="w-12/12 bg-white md:w-8/12"
            />
          ))
        )}
      </div>
    </ContentLayout>
  );
}
