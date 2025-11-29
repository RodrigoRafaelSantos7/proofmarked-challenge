import type { ComponentChildren } from "preact";

interface StepLayoutProps {
  title: string;
  intro: string;
  eyebrow?: string;
  aside?: ComponentChildren;
  children: ComponentChildren;
}

export function StepLayout(
  { title, intro, eyebrow, aside, children }: StepLayoutProps,
) {
  return (
    <div class="flex flex-col lg:flex-row gap-10 items-start justify-between">
      <div class="flex-1 space-y-6">
        <div class="space-y-3">
          {eyebrow && <p class="eyebrow">{eyebrow}</p>}
          <h1 class="text-3xl font-medium text-black">{title}</h1>
          <p class="text-base text-gray-600 max-w-xl">{intro}</p>
        </div>
        <div class="card p-8 space-y-6">{children}</div>
      </div>
      {aside && (
        <aside class="lg:w-80 w-full space-y-4 card p-6">
          {aside}
        </aside>
      )}
    </div>
  );
}
