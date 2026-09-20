import { Suspense } from "react";
import { DashboardScreen } from "@/components/screens/DashboardScreen";

export default function Page() {
  return (
    <Suspense>
      <DashboardScreen />
    </Suspense>
  );
}
