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

    subscribe<Patch>(eventName, (patch: Patch) => {
      fetchStore.applyPatch(patch.path, patch.value)
    })

    return () => {
      unsubscribe(eventName)
    }
  }, []);

  return null
}