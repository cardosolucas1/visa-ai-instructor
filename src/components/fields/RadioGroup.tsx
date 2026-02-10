import FieldError from "@/components/fields/FieldError";

type Option = {
  value: string;
  label: string;
};

type RadioGroupProps = {
  id: string;
  label: string;
  options: Option[];
  helper?: string;
  error?: string;
  register: any;
  required?: boolean;
};

export default function RadioGroup({
  id,
  label,
  options,
  helper,
  error,
  register,
  required,
}: RadioGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-zinc-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <input type="radio" value={option.value} {...register} />
            {option.label}
          </label>
        ))}
      </div>
      {helper ? <p className="text-xs text-zinc-500">{helper}</p> : null}
      <FieldError message={error} />
    </div>
  );
}
