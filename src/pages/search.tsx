import { useRouter } from "next/router";
import ContentLayout from "../components/layouts/ContentLayout";
import SearchBar from "../components/SearchBar";

export default function PoliticianPage() {
  const router = useRouter();
  const { query: startQuery } = router.query;

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
    </ContentLayout>
  );
}
