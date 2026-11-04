import { connection } from "next/server";
import { getPlans, getTrackOptions } from "../api";
import CreatePlanTrigger from "./CreatePlanTrigger";
import PlanCard from "./PlanCard";
import PlanListHeader from "./PlanListHeader";

export default async function PlanList() {
  // แผนเป็นข้อมูลของแต่ละ user และ "แก้ไขล่าสุด" ขึ้นกับเวลาปัจจุบัน → render ตอน request
  await connection();
  const [{ plans, maxPlans }, trackOptions] = await Promise.all([
    getPlans(),
    getTrackOptions(),
  ]);
  const isFull = plans.length >= maxPlans;

  return (
    <>
      <PlanListHeader
        actions={
          <div className="flex flex-col gap-1 sm:items-end">
            <div className="flex items-center justify-between gap-4 sm:justify-end">
              <span
                className={`text-body ${isFull ? "text-fg" : "text-fg-muted"}`}
              >
                {plans.length} / {maxPlans} แผน
              </span>
              <CreatePlanTrigger
                variant="button"
                planCount={plans.length}
                maxPlans={maxPlans}
                trackOptions={trackOptions}
              />
            </div>
            {isFull && (
              <p className="text-caption text-fg-muted text-right">
                สร้างได้สูงสุด {maxPlans} แผน
              </p>
            )}
          </div>
        }
      />

      <div className="flex flex-col gap-4">
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <li key={plan.studyPlanId}>
              <PlanCard plan={plan} />
            </li>
          ))}
        </ul>

        <CreatePlanTrigger
          variant="bar"
          planCount={plans.length}
          maxPlans={maxPlans}
          trackOptions={trackOptions}
        />
      </div>
    </>
  );
}
