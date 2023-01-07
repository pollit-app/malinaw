import { useRouter } from "next/router";
import Chip from "../components/Chip";
import ContentLayout from "../components/layouts/ContentLayout";
import SearchBar from "../components/SearchBar";
import { trpc } from "../utils/trpc";

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
          <Chip
            text={committee.name}
            key={committee.name}
            className="bg-red-100"
          />
        ))}
      </div>
    </ContentLayout>
  );
}
