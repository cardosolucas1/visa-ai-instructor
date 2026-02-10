import FieldError from "@/components/fields/FieldError";

type FileUploadProps = {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
  value?: string;
};

export default function FileUpload({
  id,
  label,
  helper,
  error,
  required,
  onUpload,
  uploading,
  value,
}: FileUploadProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </label>
      <input
        id={id}
        type="file"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) {
            await onUpload(file);
          }
        }}
        className="text-sm"
      />
      {value ? (
        <p className="text-xs text-emerald-700">Arquivo enviado.</p>
      ) : null}
      {uploading ? (
        <p className="text-xs text-zinc-500">Enviando...</p>
      ) : null}
      {helper ? <p className="text-xs text-zinc-500">{helper}</p> : null}
      <FieldError message={error} />
    </div>
  );
}
