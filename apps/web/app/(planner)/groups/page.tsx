import Link from "next/link";
import { Pill, members } from "@/components/ui";
import { currentActor } from "@/lib/current";
import { listGroups } from "@/lib/services";

export const metadata = { title: "Groups" };

export default async function GroupsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const actor = await currentActor();
  const result = listGroups(actor, query);
  const chip = query.chip || "all";
  return (
    <div>
      <p className="eyebrow">Facebook groups</p>
      <h1 className="display" style={{ fontSize: "clamp(40px, 6vw, 64px)" }}>Find a local Facebook group.</h1>
      <p className="lede">These are fixture groups around Greater Magnolia. Open one to see the promo rules and the Facebook link.</p>
      {!result.entitled ? <p className="notice info">The directory below is the fixture preview. The downloadable files still unlock at checkout. <Link href="/library">Library</Link></p> : null}
      <div className="chips" style={{ marginTop: 16 }}>
        {[
          ["all", "All groups"],
          ["business_ads", "Business ads"],
          ["local", "Local only"],
          ["favorites", "Favorites"],
        ].map(([value, label]) => (
          <Link key={value} href={hrefWith(query, { chip: value === "all" ? undefined : value })} aria-current={chip === value ? "page" : undefined}>{label}</Link>
        ))}
      </div>
      <form className="filters" action="/groups">
        <label className="field"><span>Search</span><input name="q" defaultValue={query.q} placeholder="Name, city or keyword" /></label>
        <label className="field"><span>Status</span>
          <select name="status" defaultValue={query.status || ""}>
            <option value="">Any status</option>
            <option value="confirmed_allowed">Confirmed allowed</option>
            <option value="restricted">Restricted</option>
            <option value="not_allowed">Not allowed</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label className="field"><span>Posting day</span>
          <select name="day" defaultValue={query.day || ""}>
            <option value="">Any day</option>
            {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, index) => <option key={day} value={index}>{day}</option>)}
          </select>
        </label>
        <label className="field"><span>Privacy</span>
          <select name="privacy" defaultValue={query.privacy || ""}>
            <option value="">Any privacy</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="unknown">Unknown</option>
          </select>
        </label>
        <label className="field"><span>Members</span>
          <select name="membership" defaultValue={query.membership || ""}>
            <option value="">Any size</option>
            <option value="under-5000">Under 5,000</option>
            <option value="5000-15000">5,000–15,000</option>
            <option value="15000-plus">15,000+</option>
          </select>
        </label>
        {query.chip ? <input type="hidden" name="chip" value={query.chip} /> : null}
        <button className="btn primary">Apply</button>
      </form>
      <p className="meta">{result.total} {result.total === 1 ? "group" : "groups"}</p>
      <div className="stack">
        {result.items.length === 0 ? <div className="empty"><h2>No groups match</h2><p>Clear a filter or search a town in the edition.</p></div> : null}
        {result.items.map((group) => (
          <article key={group.id} className="card flat">
            <div className="split-line">
              <div>
                <h2 style={{ fontSize: 28 }}><Link href={`/groups/${group.id}`}>{group.name}</Link></h2>
                <p className="meta">{group.city} · {group.distanceLabel} · {members(group.memberCount)}{group.countCheckedOn ? ` · checked ${group.countCheckedOn}` : ""}</p>
              </div>
              <Pill status={group.promotionStatus}>{group.statusLabel}</Pill>
            </div>
            <p>{group.ruleSummary}</p>
            <p className="meta">{group.windows.map((window) => window.timeLabel).join(" · ") || "No verified window"}{group.favorite ? " · Favorited" : ""}</p>
            {group.url ? <p><a href={group.url}>Open on Facebook</a></p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function hrefWith(query: Record<string, string | undefined>, patch: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  const next = { ...query, ...patch };
  for (const [key, value] of Object.entries(next)) if (value) params.set(key, value);
  const text = params.toString();
  return text ? `/groups?${text}` : "/groups";
}
