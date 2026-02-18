import MainView from "@/components/PoolView";

interface PoolPageProps {
  params: {
    id: string;
  };
}

const poolPage = ({ params }: PoolPageProps) => {
  const { id } = params;

  return (
    <MainView
      params={{
        id: id,
      }}
    />
  );
};

export default poolPage;
