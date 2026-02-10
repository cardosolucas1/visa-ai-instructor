import FieldError from "@/components/fields/FieldError";

type Option = {
  value: string;
  label: string;
};

type SelectProps = {
  id: string;
  label: string;
  options: Option[];
  placeholder?: string;
  helper?: string;
  error?: string;
  register: any;
  required?: boolean;
};

export default function Select({
  id,
  label,
  options,
  placeholder,
  helper,
  error,
  register,
  required,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <select
        id={id}
        {...register}
        className="h-11 rounded-lg border border-zinc-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
      >
        <option value="">{placeholder ?? "Selecione"}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helper ? <p className="text-xs text-zinc-500">{helper}</p> : null}
      <FieldError message={error} />
    </div>
  );
}
