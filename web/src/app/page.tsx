'use client'
import { DashboardPage } from "@/components/dashboard/dashboard-page";
import { AccountGroupSelect } from "@/components/account/account-group-select";
import { useAccountStore } from "@/store/account";
import { ReferenceSelect } from "@/components/common/reference-select";
import { useState } from "react";
import { Reference } from "@/types/common";

export default function Home() {

  const { groupList } = useAccountStore()
  const [group, setGroup] = useState<Reference | undefined>()

  return (
    <DashboardPage />
  );
}
