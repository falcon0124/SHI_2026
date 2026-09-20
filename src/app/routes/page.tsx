import { Suspense } from "react";
import { RoutesScreen } from "@/components/screens/RoutesScreen";

export default function Page() {
  return (
    <Suspense>
      <RoutesScreen />
    </Suspense>
  );
}
