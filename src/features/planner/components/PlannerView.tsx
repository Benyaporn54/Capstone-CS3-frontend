import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getSavedCourses } from "@/features/saved-courses/api";
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

  const token = (await auth())?.backendToken;
  let savedCourses = null;
  if (token) {
    try {
      savedCourses = await getSavedCourses(token);
    } catch (error) {
      console.error("Failed to load saved courses on planner:", error);
    }
  }

  return (
    <>
      <PlannerHeader plan={plan} />
      <PlannerBody plan={plan} savedCourses={savedCourses} />
    </>
  );
}
