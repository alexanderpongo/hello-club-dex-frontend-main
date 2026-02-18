"use client";
import RemoveLpDialog from "./RemoveLpDialog";
import CollectRewardDialog from "./CollectRewardDialog";


function UserPosition({ data }: { data: any }) {
  return (
    <div className="flex my-auto gap-4 py-4">
      <RemoveLpDialog />
      <CollectRewardDialog />
    </div>
  );
}

export default UserPosition;
