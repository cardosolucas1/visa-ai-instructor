"use client";

import { useEffect } from "react";

type AutoCreateFormProps = {
  action: () => void;
};

export default function AutoCreateForm({ action }: AutoCreateFormProps) {
  useEffect(() => {
    action();
  }, [action]);

  return null;
}
