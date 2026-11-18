import PositionDetail from "./position-detail";

const POSITION_IDS = ["P01", "P02", "P03", "P04", "P05", "P06", "P07", "P08"];

export function generateStaticParams() {
  return POSITION_IDS.map((id) => ({ id }));
}

export default async function PositionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PositionDetail id={id} />;
}
