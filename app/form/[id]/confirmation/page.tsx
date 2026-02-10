import { redirect } from "next/navigation";

import ConfirmationClient from "./ConfirmationClient";
import { getSubmissionRecord } from "@/lib/forms-store";
import { DEFAULT_LOCALE } from "@/lib/i18n";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ConfirmationPage({ params }: PageProps) {
  const resolvedParams = await params;
  const record = getSubmissionRecord(resolvedParams.id);

  if (!record) {
    redirect(`/form/${resolvedParams.id}`);
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <ConfirmationClient
        confirmationNumber={record.confirmationNumber}
        data={record.data}
        locale={DEFAULT_LOCALE}
      />
    </div>
  );
}
