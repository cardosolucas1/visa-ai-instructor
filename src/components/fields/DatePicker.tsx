import FieldError from "@/components/fields/FieldError";

type DatePickerProps = {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  register: any;
  required?: boolean;
};

export default function DatePicker({
  id,
  label,
  helper,
  error,
  register,
  required,
}: DatePickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input
        id={id}
        type="date"
        {...register}
        className="h-11 rounded-lg border border-zinc-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
      />
      {helper ? <p className="text-xs text-zinc-500">{helper}</p> : null}
      <FieldError message={error} />
    </div>
  );
}
