import { createFileRoute } from "@tanstack/react-router";
import { DeskView } from "@/components/desk-view";
import { GateView } from "@/components/gate-view";
import { getDeskState } from "@/lib/desk-fns";

export const Route = createFileRoute("/")({
  loader: () => getDeskState(),
  component: Home,
});

function Home() {
  const state = Route.useLoaderData();
  if (!state.unlocked) return <GateView blocked={state.blocked} />;
  return <DeskView report={state.report} />;
}
