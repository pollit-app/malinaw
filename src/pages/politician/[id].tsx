import { useRouter } from "next/router";
import ContentLayout from "../../components/layouts/ContentLayout";

export default function PoliticianPage() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <ContentLayout>
      <></>
    </ContentLayout>
  );
}
