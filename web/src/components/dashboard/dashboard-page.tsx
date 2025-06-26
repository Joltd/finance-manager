'use client'

import { PatchListener } from "@/components/common/patch-listener";
import { useFetchStore } from "@/store/common";
import { DashboardRecord } from "@/types/dashboard";
import { useEffect } from "react";
import { useAccountStore } from "@/store/account";
import { GalleryGroup, GroupedContent } from "@/components/common/grouped-content";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AmountLabel } from "@/components/common/amount-label";
import { accountEvents } from "@/api/account";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AccountSheet } from "@/components/account/account-sheet";

export function DashboardPage() {
  const { accountList, accountSheet } = useAccountStore()

  useEffect(() => {
    accountList.fetch()
  }, []);

  const handleAddAccount = () => {
    accountSheet.setOpened(true)
  }

  return (
    <>
      <PatchListener fetchStore={accountList} eventName={accountEvents.root} />
      <AccountSheet />
      <GroupedContent
        items={accountList.data || []}
        getGroup={(it) => it.group?.id || 'Other'}
        renderGroup={(group, items, index) => (
          <GalleryGroup
            group={group}
            items={items.sort((left, right) => right.balances.length - left.balances.length)}
            renderItem={(item) =>
              (
                <Card className="min-w-48">
                  <CardHeader className="w-full">
                    <CardTitle className="truncate">{item.name}</CardTitle>
                  </CardHeader>
                  {!!item.balances.length && (
                    <CardContent>
                      {item.balances.map((it) => <AmountLabel key={it.currency} amount={it}/>)}
                    </CardContent>
                  )}
                </Card>
              )}
            renderGroup={(it) => (
              <div className="flex">
                <div className="grow">{it}</div>
                {index === 0 && (
                  <Button onClick={handleAddAccount}>Add account</Button>
                )}
              </div>
            )}
          />
        )}
      />
    </>
  );
}
