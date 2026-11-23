import { civilToday, themeForDate } from "@marketmap/domain";
import { Studio } from "@/components/studio";
import { currentActor } from "@/lib/current";
import { latestDraft, listGroups } from "@/lib/services";

export const metadata = { title: "Post studio" };

export default async function StudioPage({ searchParams }: { searchParams: Promise<{ date?: string; group?: string; plan?: string }> }) {
  const params = await searchParams;
  const actor = await currentActor();
  const zone = actor?.business?.timeZone ?? "America/Chicago";
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : civilToday(zone);
  const theme = themeForDate(date);
  const groups = actor?.entitled ? listGroups(actor, {}).items.map((group) => ({ id: group.id, name: group.name })) : [];
  const initial = latestDraft(actor, date);
  return (
    <div className="stack" style={{ gap: 18 }}>
      <header>
        <p className="eyebrow">AI post studio</p>
        <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>A draft with the brakes on.</h1>
        <p className="lede">The writer uses your business profile, the theme, and any notes you type. It will not invent a discount or a customer quote.</p>
      </header>
      {actor?.business ? (
        <Studio
          date={date}
          themeName={theme.name}
          themePrompt={theme.prompt}
          tone={actor.business.tone}
          groups={groups}
          initialGroupId={params.group}
          planItemId={params.plan}
          initial={initial}
        />
      ) : (
        <div className="empty"><p>Add a business profile before drafting.</p></div>
      )}
    </div>
  );
}
