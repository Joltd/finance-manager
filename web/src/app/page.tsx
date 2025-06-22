'use client'
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import { ReferenceFilter } from "@/components/common/filter/reference-filter";
import { cashAccount, cryptoAccount, debitCardAccount } from "@/types/stub";
import { Reference } from "@/types/common";
import { Filter } from "@/components/common/filter/filter";
import { FilterExpression } from "@/types/entity";
import { RangeFilter } from "@/components/common/filter/range-filter";
import { DateFilter } from "@/components/common/filter/date-filter";
import { AmountInput } from "@/components/common/amount-input";
import { useState } from "react";
import { Amount } from "@/types/amount";

export default function Home() {
  const [amount, setAmount] = useState<Amount | undefined>()
  const stub = [
    cashAccount as Reference,
    debitCardAccount as Reference,
    cryptoAccount as Reference,
  ]

  const handle = (expressions: FilterExpression[]) => {
    console.log('handle',expressions)
  }

  return (
    <div>
      <AmountInput amount={amount} onChange={setAmount} />
      {/*<Filter onFilterChange={handle}>*/}
      {/*  <ReferenceFilter field="account" label="Account" references={stub} />*/}
      {/*  <RangeFilter field="position" label="Position" />*/}
      {/*  <DateFilter field="date" label="Date" />*/}
      {/*</Filter>*/}
    </div>
    // <div className="grid grid-cols-[1fr_min-content] grid-rows-[min-content_1fr] min-w-lg w-full h-full">
    //   <div className="h-10 bg-red-500" />
    //   <div className="w-32 bg-green-500 row-span-2" />
    //   <div className="flex flex-col overflow-y-auto">
    //     <p>
    //       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    //     </p>
    //     <p>
    //       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    //     </p>
    //     <p>
    //       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    //     </p>
    //     <p>
    //       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    //     </p>
    //     <p>
    //       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    //     </p>
    //     <p>
    //       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    //     </p>
    //     <p>
    //       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    //     </p>
    //     <p>
    //       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    //     </p>
    //     <p>
    //       Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    //     </p>
    //   </div>
    // </div>
  );
}
