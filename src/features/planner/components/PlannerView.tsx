import { notFound } from "next/navigation";
import { getPlanDetail } from "../api";
import PlannerBody from "./PlannerBody";
import PlannerHeader from "./PlannerHeader";

type PlannerViewProps = {
  params: Promise<{ planId: string }>;
};

export default async function PlannerView({ params }: PlannerViewProps) {
  const { planId } = await params;
  const id = Number(planId);
  const plan = Number.isInteger(id) && id > 0 ? await getPlanDetail(id) : null;

  if (!plan) notFound();

  return (
    <>
      <PlannerHeader plan={plan} />
      <PlannerBody plan={plan} />
    </>
  );
}
