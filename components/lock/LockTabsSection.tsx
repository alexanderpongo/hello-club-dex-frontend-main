import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
// import SwapWidget from "../evm/SwapWidget";
import MyLocksWidget from "./MyLocksWidget";

function LockTabsSection({ setTabValue }: { setTabValue?: (value: string) => void }) {
  return (
    <div className=" w-full py-5 rounded-xl ">
      <Tabs defaultValue="my-locks" className="bg-transparent space-y-5">
        <TabsList className="hidden md:flex p-1 items-center bg-black/10 dark:bg-white/5 w-full md:w-[181px] rounded-xl h-[48px] border-0">
          <TabsTrigger
            value="my-locks"
            className="w-full font-formula h-[40px] text-[18px] uppercase flex justify-center items-center transition-all data-[state=active]:bg-[#C2FE0C26] data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-[#C2FE0C2E] data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-white/10 data-[state=inactive]:bg-transparent data-[state=inactive]:text-[#ffffff99]"
          >
            My Locks
          </TabsTrigger>
          {/* <TabsTrigger
            value="lp"
            className=" font-barlow data-[state=active]:bg-gray-800/60 data-[state=active]:text-cyan-400 h-fit text-sm  uppercase flex justify-center items-center "
          >
            team locks
          </TabsTrigger> */}
          {/* <TabsTrigger
            value="pool"
            className=" font-barlow data-[state=active]:bg-gray-800/60 data-[state=active]:text-cyan-400 h-fit text-sm  uppercase flex justify-center items-center"
          >
            History
          </TabsTrigger> */}
        </TabsList>
        <div className="flex w-full mt-4 ">
          <TabsContent
            value="my-locks"
            className="justify-center w-full"
          >
            <MyLocksWidget setTabValue={setTabValue} />
          </TabsContent>
          {/* <TabsContent value="lp" className="">
            <div className="flex w-full justify-center text-center py-5  text-gray-400">
              <p>No team locks found</p>
            </div>
          </TabsContent> */}
          {/* <TabsContent value="pool" className="">
            <div className="flex w-full justify-center text-center py-5  text-gray-400">
              <p>No history found</p>
            </div>
          </TabsContent> */}
        </div>
      </Tabs>
    </div>
  );
}

export default LockTabsSection;
