"use client";

import { useState } from "react";
import { MEAL_TYPE_LABELS, type DayMeals, type MealType } from "@/lib/types";

const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

function MealSlot({ type, options }: { type: MealType; options: DayMeals["breakfast"] }) {
  const [selected, setSelected] = useState(0);
  const meal = options[selected];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-bold text-primary">{MEAL_TYPE_LABELS[type]}</h4>
        <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          {meal.calories} سعرة
        </span>
      </div>

      <div className="mb-3 flex gap-2">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSelected(i)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              selected === i
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-surface2 text-gray-400 hover:border-gray-600"
            }`}
          >
            خيار {i + 1}
          </button>
        ))}
      </div>

      <p className="font-semibold">{meal.name}</p>
      <p className="mt-1 text-sm leading-relaxed text-gray-300">{meal.items}</p>
      <ol className="mt-3 space-y-1.5">
        {meal.steps.map((step, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-400">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function MealDayCard({
  dayMeals,
  defaultOpen,
}: {
  dayMeals: DayMeals;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);

  return (
    <div className="glass-card rounded-2xl p-6">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-right"
      >
        <h3 className="text-xl font-bold">{dayMeals.day}</h3>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-4 space-y-3">
          {MEAL_TYPES.map((type) => (
            <MealSlot key={type} type={type} options={dayMeals[type]} />
          ))}
        </div>
      )}
    </div>
  );
}
