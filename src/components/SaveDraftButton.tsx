type SaveDraftButtonProps = {
  onSave: () => Promise<void>;
  saving: boolean;
  label: string;
  savingLabel: string;
};

export default function SaveDraftButton({
  onSave,
  saving,
  label,
  savingLabel,
}: SaveDraftButtonProps) {
  return (
    <button
      type="button"
      onClick={onSave}
      disabled={saving}
      className="rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {saving ? savingLabel : label}
    </button>
  );
}
