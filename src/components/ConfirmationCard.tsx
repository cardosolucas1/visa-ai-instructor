"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

type ConfirmationCardProps = {
  confirmationNumber: string;
  title: string;
  subtitle: string;
  copyLabel: string;
  copiedLabel: string;
};

export default function ConfirmationCard({
  confirmationNumber,
  title,
  subtitle,
  copyLabel,
  copiedLabel,
}: ConfirmationCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6">
      <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
      <p className="mt-2 text-sm text-zinc-600">{subtitle}</p>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="rounded-lg border border-zinc-200 p-4">
          <QRCodeCanvas value={confirmationNumber} size={160} />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-zinc-500">Confirmation number</p>
          <p className="text-lg font-semibold text-zinc-900">
            {confirmationNumber}
          </p>
          <CopyButton
            value={confirmationNumber}
            label={copyLabel}
            copiedLabel={copiedLabel}
          />
        </div>
      </div>
    </div>
  );
}

type CopyButtonProps = {
  value: string;
  label: string;
  copiedLabel: string;
};

function CopyButton({ value, label, copiedLabel }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
