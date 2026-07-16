/**
 * New-work announcement — a small dismissible pill shown on the homepage.
 *
 * To announce a new piece: update the fields below and change `id` to a NEW
 * unique string (the pill stays hidden for anyone who dismissed the previous
 * id). Set `enabled: false` to turn it off entirely.
 */
export const announcement = {
  enabled: true,
  /** Change this every time you announce something new */
  id: "wynn-world-cup-2026",
  /** Small uppercase kicker */
  label: "New Work",
  /** Main line */
  title: "Wynn World Cup Campaign 2026",
  /** Where clicking the pill goes (deep link into the project) */
  href: "/?project=new-project-1784221303582",
  /** Optional thumbnail shown in the pill (path under /public) */
  image: "/gallery/wynn-world-cup-campaign-2026-164a234a.jpg",
}
