"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function InscricaoPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/inscricao/formulario");
  }, [router]);

  return null;
}