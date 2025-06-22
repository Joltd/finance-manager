'use client'
import { FetchStoreState } from "@/store/common";
import { useNotificationStore } from "@/store/notification";
import { useEffect } from "react";
import { Patch } from "@/lib/patch";

export interface PatchListenerProps {
  fetchStore: FetchStoreState<any>
  eventName: string
}

export function PatchListener({ fetchStore, eventName }: PatchListenerProps) {
  const { subscribe, unsubscribe } = useNotificationStore()

  useEffect(() => {
    subscribe<Patch[]>(eventName, (patches: Patch[]) => fetchStore.applyPatch(patches))
    return () => {
      unsubscribe(eventName)
    }
  }, []);

  return null
}