import { DexTabs } from "@/components/dex-tabs";
import { getDex } from "@/lib/dex";

export default async function DexLayout({ children, params }: LayoutProps<"/dex/[dexId]">) {
  const { dexId } = await params;
  const { dex, isOwner } = await getDex(dexId);
  return (
    <div className="space-y-8">
      <div className="space-y-4 border-b border-stone-200">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{dex.name}</h1>
          <p className="text-sm text-stone-500">
            par {dex.owner?.display_name ?? "anonyme"}
            {!dex.is_public && " · privé"}
          </p>
          {dex.description && <p className="max-w-2xl pt-1 text-stone-700">{dex.description}</p>}
        </div>
        <DexTabs dexId={dexId} isOwner={isOwner} />
      </div>
      {children}
    </div>
  );
}
