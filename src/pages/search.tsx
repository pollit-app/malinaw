import { useRouter } from "next/router";
import ContentLayout from "../components/layouts/ContentLayout";

export default function PoliticianPage() {
  const router = useRouter();
  const { query } = router.query;

  return <ContentLayout></ContentLayout>;
}
