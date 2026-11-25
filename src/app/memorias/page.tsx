import { MemoriasListView } from "@/components/memorias-view";
import { getMemorias } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function MemoriasPage() {
  return <MemoriasListView memorias={await getMemorias()} />;
}
