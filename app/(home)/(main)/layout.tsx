import Tabs from "@/components/home-tabs/Tabs";

export default function MainInnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col ">
      <div className="flex justify-center items-center pt-20 pb-5 container">
        <Tabs />
      </div>
      <div className="flex justify-center items-start">{children}</div>
    </div>
  );
}
