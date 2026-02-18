import React from "react";
import { Lock } from "lucide-react";

function LockDashboardHeader() {
  return (
    <div className="flex w-full justify-between">
      <div className="flex flex-col my-auto w-full mt-5">
        <div className="flex ml-10 md:ml-0 flex-row w-full justify-start mt-4 mb-2">
          <h1 className="title-large-semi-bold uppercase">
            My <span className="">LOCKS</span>
          </h1>
        </div>
        {/* <div className="flex items-center gap-2  cursor-pointer">
          <span className="text-[#9ca3af] text-sm">
            Manage your locked liquidity and team tokens
          </span>
        </div> */}
      </div>
      {/* <div className="flex my-auto justify-center items-end">
        <Link href="/lock" legacyBehavior passHref>
          <Button
            // onClick={swapPoolHandler}
            className="w-[120px] button-primary inline-flex justify-center items-center uppercase !text-sm"
          >
            <Plus className="button-primary" />
            New Lock
          </Button>
        </Link>
      </div> */}
    </div>
  );
}

export default LockDashboardHeader;
