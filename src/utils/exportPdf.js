/**
 * Opens a print-ready journal report. User can "Save as PDF" from the print dialog.
 * No extra npm packages required.
 */
export function exportJournalPdf({ challenge, stats, entries, projects, bookmarks }) {
  const sorted = [...(entries || [])].sort((a, b) => (a.day || 0) - (b.day || 0));
  const name = challenge?.userName || "Learner";
  const challengeName = challenge?.name || "90 Days React Challenge";
  const today = new Date().toLocaleString("en-IN");

  const esc = (s) =>
    String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const section = (title, body) => {
    if (!body || !String(body).trim()) return "";
    return `<div class="sec"><h4>${esc(title)}</h4><p>${esc(body).replace(/\n/g, "<br/>")}</p></div>`;
  };

  const entriesHtml = sorted.length
    ? sorted
        .map((e) => {
          return `
      <article class="entry">
        <header>
          <span class="day">Day ${esc(e.day)}</span>
          <h3>${esc(e.title || "Untitled")}</h3>
          <p class="meta">${esc(e.date)} · ${esc(e.studyTime || 0)}h · ${esc(e.difficulty || "")}${
            e.rating ? ` · ★ ${esc(e.rating)}` : ""
          }</p>
        </header>
        ${section("Goal", e.goal)}
        ${section("Learned", e.learned)}
        ${section("Practiced", e.practiced)}
        ${section("Project / Task", e.project)}
        ${section("Problems", e.problems)}
        ${section("Solution", e.solution)}
        ${section("Takeaways", e.takeaways)}
        ${section("Improvements", e.improvements)}
        ${
          e.tags?.length
            ? `<p class="tags">${e.tags.map((t) => `<span>${esc(t)}</span>`).join("")}</p>`
            : ""
        }
      </article>`;
        })
        .join("")
    : `<p class="empty">No journal entries yet.</p>`;

  const projectsHtml = (projects || [])
    .map(
      (p) => `
    <div class="proj">
      <strong>${esc(p.title)}</strong>
      <span class="badge">${esc(p.status || "")}</span>
      <p>${esc(p.description || "")}</p>
      ${
        p.technologies?.length
          ? `<p class="tech">${p.technologies.map((t) => esc(t)).join(" · ")}</p>`
          : ""
      }
    </div>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${esc(challengeName)} — Journal Report</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      color: #0f172a;
      line-height: 1.5;
      max-width: 800px;
      margin: 0 auto;
      padding: 32px 24px;
    }
    h1 { font-size: 1.6rem; margin: 0 0 4px; }
    h2 { font-size: 1.15rem; margin: 28px 0 12px; border-bottom: 2px solid #6366f1; padding-bottom: 6px; color: #4338ca; }
    h3 { font-size: 1.05rem; margin: 0 0 4px; }
    h4 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin: 10px 0 2px; }
    .sub { color: #64748b; font-size: 0.9rem; margin-bottom: 20px; }
    .stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin: 16px 0 8px;
    }
    .stat {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
    }
    .stat b { display: block; font-size: 1.25rem; color: #4f46e5; }
    .stat span { font-size: 0.75rem; color: #64748b; }
    .entry {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 14px;
      page-break-inside: avoid;
    }
    .day {
      display: inline-block;
      background: #eef2ff;
      color: #4338ca;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 999px;
      margin-bottom: 6px;
    }
    .meta { font-size: 0.8rem; color: #64748b; margin: 0 0 8px; }
    .sec p { margin: 0 0 6px; white-space: pre-wrap; font-size: 0.92rem; }
    .tags span {
      display: inline-block;
      background: #f1f5f9;
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 6px;
      margin: 2px 4px 0 0;
    }
    .proj {
      border-left: 3px solid #6366f1;
      padding: 8px 12px;
      margin-bottom: 10px;
    }
    .badge {
      font-size: 0.7rem;
      background: #ecfdf5;
      color: #047857;
      padding: 1px 6px;
      border-radius: 4px;
      margin-left: 6px;
    }
    .tech { font-size: 0.8rem; color: #64748b; }
    .empty { color: #94a3b8; }
    .footer {
      margin-top: 32px;
      font-size: 0.75rem;
      color: #94a3b8;
      text-align: center;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom:16px;padding:12px;background:#eef2ff;border-radius:10px;font-size:0.9rem">
    <strong>PDF banane ke liye:</strong> Ctrl+P (or Cmd+P) → Destination: <em>Save as PDF</em> → Save.
  </div>

  <h1>${esc(challengeName)}</h1>
  <p class="sub">${esc(name)} · Exported ${esc(today)}</p>

  <div class="stats">
    <div class="stat"><b>${esc(stats?.currentDay || 1)} / ${esc(stats?.totalDays || 90)}</b><span>Current Day</span></div>
    <div class="stat"><b>${esc(stats?.progress || 0)}%</b><span>Progress</span></div>
    <div class="stat"><b>${esc(stats?.streak || 0)}d</b><span>Streak</span></div>
    <div class="stat"><b>${esc(stats?.totalHours || 0)}h</b><span>Study Hours</span></div>
  </div>

  <h2>Journal Entries (${sorted.length})</h2>
  ${entriesHtml}

  ${
    projects?.length
      ? `<h2>Projects (${projects.length})</h2>${projectsHtml}`
      : ""
  }

  ${
    bookmarks?.length
      ? `<h2>Bookmarked Days</h2><p>${bookmarks.map((d) => `Day ${d}`).join(", ")}</p>`
      : ""
  }

  <p class="footer">React Challenge Journal · Generated for personal learning portfolio</p>
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 400);
    };
  </script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) {
    alert("Popup blocked. Please allow popups to export PDF.");
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}
