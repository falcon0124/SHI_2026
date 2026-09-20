import { Suspense } from "react";
import { ApiDocsScreen } from "@/components/screens/ApiDocsScreen";

export default function Page() {
  return (
    <Suspense>
      <ApiDocsScreen />
    </Suspense>
  );
}
