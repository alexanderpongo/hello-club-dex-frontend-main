import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import ToTokenDetails from "./ToTokenDetails";
import FromTokenDetails from "./FromTokenDetails";

function LPWidget() {
  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-full max-w-[500px]">
        <Card className="w-full  border border-[#1A1A1A] ">
          <CardHeader className="space-y-0 p-3 pb-0 sm:p-5 sm:pt-1 sm:pb-1 flex flex-row justify-between items-end">
            <div className="w-full">
              <CardTitle className="text-[1.375rem] font-normal sm:font-medium flex justify-between items-center">
                <div className="title-regular-semi-bold uppercase">
                  Add Liquidity
                  <hr className="title-underline" />
                </div>
                <div>{/* <SlippageSettingDialog /> */}</div>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2 p-3 sm:p-5 sm:pt-2">
            <div className="space-y-4">
              <div className="flex flex-col gap-6 relative">
                <div
                  className="cursor-pointer w-8 h-8 rounded-full bg-primary dark:bg-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 flex justify-center items-center"
                  // onClick={handleSwapTokenDetails}
                >
                  {/* <Image
                src="/icons/swap.svg"
                alt="logo"
                width={0}
                height={0}
                sizes="100vw"
                className="w-6 h-6 text-[#000]"
              /> */}
                  <Plus className="w-4 h-4 text-[#000000]" />
                </div>

                <div>
                  <div className="text-[12px] font-normal text-[#FFFFFF99] ">
                    Token 01
                  </div>
                  <FromTokenDetails />
                </div>

                <div>
                  <div className="text-[12px] font-normal  text-[#FFFFFF99]">
                    Token 02
                  </div>
                  <ToTokenDetails />
                </div>
              </div>
              {/* {fromToken &&
          toToken &&
          parseFloat(fromTokenInputAmount) > 0 &&
          parseFloat(toTokenInputAmount) > 0 && <FeesDetails />}
        <SwapButton /> */}
              <Button className="w-full text-[#000000]">Add Liquidity</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LPWidget;
