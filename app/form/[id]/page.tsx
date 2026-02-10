import FormWizardClient from "./FormWizardClient";
import { loadFormSchema } from "@/lib/schema-loader";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FormPage({ params }: PageProps) {
  const resolvedParams = await params;
  const schema = await loadFormSchema();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <FormWizardClient applicationId={resolvedParams.id} schema={schema} />
    </div>
  );
}
