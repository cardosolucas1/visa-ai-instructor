import { createSupabaseServerClient } from "@/lib/supabase/server";

type LogoutFormProps = {
  className?: string;
  label?: string;
};

export default function LogoutForm({
  className,
  label = "Sair",
}: LogoutFormProps) {
  const logout = async () => {
    "use server";
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  };

  return (
    <form action={logout}>
      <button
        type="submit"
        className={className ?? "text-sm font-semibold text-zinc-700"}
      >
        {label}
      </button>
    </form>
  );
}
