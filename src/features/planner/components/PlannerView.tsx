import { notFound } from "next/navigation";
import { getPlanDetail, getPlans } from "../api";
import PlannerBody from "./PlannerBody";
import PlannerHeader from "./PlannerHeader";

type PlannerViewProps = {
  params: Promise<{ planId: string }>;
};

export default async function PlannerView({ params }: PlannerViewProps) {
  const { planId } = await params;
  const id = Number(planId);
  const [plan, planList] =
    Number.isInteger(id) && id > 0
      ? await Promise.all([getPlanDetail(id), getPlans()])
      : [null, null];

  if (!plan) notFound();

  const isOnlyDefaultPlan =
    plan.isDefault &&
    planList?.plans.length === 1 &&
    planList.plans[0].studyPlanId === plan.studyPlanId;

  return (
    <>
      <PlannerHeader
        key={plan.studyPlanId}
        plan={plan}
        isOnlyDefaultPlan={isOnlyDefaultPlan}
      />
      <PlannerBody plan={plan} />
    </>
  );
}
