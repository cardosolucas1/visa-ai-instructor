type StepperProps = {
  steps: Array<{ id: string; title: string }>;
  currentStep: number;
};

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`rounded-full px-3 py-1 ${
              index === currentStep
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {index + 1}. {step.title}
          </div>
        ))}
      </div>
    </div>
  );
}
