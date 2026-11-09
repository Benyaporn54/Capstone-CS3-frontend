import { notFound } from "next/navigation";
import { getPlanDetail, getPlans } from "../api";
import { auth } from "@/auth";
import { getSavedCourses } from "@/features/saved-courses/api";
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

  const token = (await auth())?.backendToken;
  let savedCourses = null;
  if (token) {
    try {
      savedCourses = await getSavedCourses(token);
    } catch (error) {
      console.error("Failed to load saved courses on planner:", error);
    }
  }
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
      <PlannerBody plan={plan}  savedCourses={savedCourses}/>
    </>
  );
}
