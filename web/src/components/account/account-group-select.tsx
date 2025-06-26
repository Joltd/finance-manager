'use client'
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAccountStore } from "@/store/account";
import { Input } from "@/components/ui/input";
import { Reference } from "@/types/common";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AccountGroupNewDialog } from "@/components/account/account-group-new-dialog";

export interface AccountGroupSelectProps {
  value?: Reference
  onChange?: (value?: Reference) => void
}

export function AccountGroupSelect({ value, onChange }: AccountGroupSelectProps) {
  const { groupList, newGroupDialog } = useAccountStore()

  useEffect(() => {
    groupList.fetch()
  }, []);

  const setGroupById = (id: string) => {
    onChange?.(groupList.data?.find((it) => it.id === id))
  }

  const handleSelect = (value: string) => {
    if (value === '0') {
      onChange?.(undefined)
      newGroupDialog.setOpened(true)
    } else {
      setGroupById(value)
    }
  }

  return (
    <>
      {/*<Select value={value?.id || 'empty'} onValueChange={handleSelect}>*/}
      {/*  <SelectTrigger>*/}
      {/*    <SelectValue />*/}
      {/*  </SelectTrigger>*/}
      {/*  <SelectContent>*/}
      {/*    <SelectItem value="new">New</SelectItem>*/}
      {/*    <SelectItem value="empty">Without group</SelectItem>*/}
      {/*    {!!groupList.data?.length && (*/}
      {/*      <SelectSeparator />*/}
      {/*    )}*/}
      {/*    {groupList.data?.map((it) => (*/}
      {/*      <SelectItem key={it.id} value={it.id}>{it.name}</SelectItem>*/}
      {/*    ))}*/}
      {/*  </SelectContent>*/}
      {/*</Select>*/}
      <AccountGroupNewDialog />
    </>
  )
}