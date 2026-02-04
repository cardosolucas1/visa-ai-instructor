"use client";

type DeleteApplicationButtonProps = {
  action: (formData: FormData) => void;
  applicationId: string;
};

export default function DeleteApplicationButton({
  action,
  applicationId,
}: DeleteApplicationButtonProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!window.confirm("Tem certeza que deseja excluir esta análise?")) {
      event.preventDefault();
    }
  };

  return (
    <form action={action} onSubmit={handleSubmit}>
      <input type="hidden" name="applicationId" value={applicationId} />
      <button
        type="submit"
        className="text-xs font-semibold text-red-600 hover:text-red-700"
      >
        Excluir
      </button>
    </form>
  );
}
