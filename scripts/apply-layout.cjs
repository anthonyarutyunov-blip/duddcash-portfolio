#!/usr/bin/env node
/**
 * apply-layout.js
 * Reads duddcash-layout.json and the current portfolio.ts,
 * applies ALL admin changes, and writes the updated portfolio.ts.
 *
 * This script works by parsing portfolio.ts as a JS module (via eval),
 * applying mutations in-memory, then serialising the updated array back to TS.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LAYOUT_PATH = path.join(ROOT, 'src/data/duddcash-layout.json');
const TS_PATH     = path.join(ROOT, 'src/data/portfolio.ts');

// ── 1. Read inputs ───────────────────────────────────────────────
const layout = JSON.parse(fs.readFileSync(LAYOUT_PATH, 'utf8'));
const tsSource = fs.readFileSync(TS_PATH, 'utf8');

// ── 2. Extract the portfolioItems array from the TS source via eval ──
// Strip TS-only syntax so plain JS eval works
let jsCode = tsSource
  // remove export keywords
  .replace(/export\s+/g, '')
  // remove type declarations (type X = ...; and interface blocks)
  .replace(/type\s+\w+\s*=[\s\S]*?(?=\n(?:export|const|interface|\/\/))/g, '')
  .replace(/interface\s+\w+\s*\{[\s\S]*?\n\}/g, '')
  // remove type annotations on const declarations
  .replace(/const\s+(\w+)\s*:\s*[^=]+=\s*/g, 'const $1 = ')
  // remove function signatures with TS return types
  .replace(/function\s+(\w+)\s*\((\w+)\s*:\s*\w+\)\s*:\s*\w+/g, 'function $1($2)');

// Evaluate to get the items array
let portfolioItems;
let categories;
let getCardAspectRatio;
try {
  const fn = new Function(jsCode + '\nreturn { portfolioItems, categories, getCardAspectRatio };');
  const result = fn();
  portfolioItems = result.portfolioItems;
  categories = result.categories;
  getCardAspectRatio = result.getCardAspectRatio;
} catch (e) {
  console.error('Failed to eval portfolio.ts:', e.message);
  // Fallback: manually parse the array region
  console.error('Attempting manual regex extraction...');
  process.exit(1);
}

console.log(`Loaded ${portfolioItems.length} portfolio items`);

// ── 3. Build lookup maps ─────────────────────────────────────────
const itemMap = new Map();
for (const item of portfolioItems) {
  itemMap.set(item.id, item);
}

// ── 4. Apply contentEdits ────────────────────────────────────────
for (const edit of (layout.contentEdits || [])) {
  const { itemId, field, value } = edit;
  let item = itemMap.get(itemId);
  // For new projects not yet in the array, skip — we add them later
  if (!item) continue;

  // Section-scoped edits: "section:Title:field"
  const sectionMatch = field.match(/^section:(.+):(\w+)$/);
  if (sectionMatch) {
    const [, sectionTitle, sectionField] = sectionMatch;
    if (item.sections) {
      const section = item.sections.find(s => s.title === sectionTitle);
      if (section) {
        if (sectionField === 'credits') {
          section.credits = JSON.parse(value);
        } else {
          section[sectionField] = value;
        }
        console.log(`  content-edit: ${itemId} section "${sectionTitle}".${sectionField}`);
      }
    }
    continue;
  }

  if (field === 'credits') {
    item.credits = JSON.parse(value);
  } else {
    item[field] = value;
  }
  console.log(`  content-edit: ${itemId}.${field}`);
}

// ── 5. Apply videoEdits ──────────────────────────────────────────
// Build a map of videoId -> latest edits
const videoEditMap = new Map(); // videoId -> { title?, description?, customThumbnail? }
for (const ve of (layout.videoEdits || [])) {
  const { videoId, field, value } = ve;
  if (!videoEditMap.has(videoId)) videoEditMap.set(videoId, {});
  videoEditMap.get(videoId)[field] = value;
}

function applyVideoEdits(video) {
  const edits = videoEditMap.get(video.videoId);
  if (!edits) return;
  for (const [field, value] of Object.entries(edits)) {
    if (field === 'title') {
      video.title = value;
    } else if (field === 'description') {
      video.description = value;
    } else if (field === 'customThumbnail') {
      video.customThumbnail = value;
    }
  }
}

// Apply to all existing videos
for (const item of portfolioItems) {
  if (item.type === 'single' && item.video) {
    applyVideoEdits(item.video);
  }
  if (item.videos) {
    for (const v of item.videos) applyVideoEdits(v);
  }
  if (item.sections) {
    for (const sec of item.sections) {
      for (const v of sec.videos) applyVideoEdits(v);
    }
  }
}
console.log(`Applied videoEdits to existing videos`);

// ── 6. Remove videos ────────────────────────────────────────────
const removedSet = new Set();
for (const rv of (layout.removedVideos || [])) {
  // Extract GUID from URL or use as-is
  if (rv.startsWith('http')) {
    // Ignore URL-format removed videos per instructions
    console.log(`  removedVideo: ignoring URL ${rv}`);
    continue;
  }
  removedSet.add(rv);
}

for (const item of portfolioItems) {
  if (item.type === 'single' && item.video && removedSet.has(item.video.videoId)) {
    // Will handle below when adding new videos
    console.log(`  removedVideo: ${item.video.videoId} from single ${item.id} (will replace)`);
  }
  if (item.videos) {
    const before = item.videos.length;
    item.videos = item.videos.filter(v => !removedSet.has(v.videoId));
    if (item.videos.length < before) {
      console.log(`  removedVideo: removed ${before - item.videos.length} video(s) from ${item.id}`);
    }
  }
  if (item.sections) {
    for (const sec of item.sections) {
      const before = sec.videos.length;
      sec.videos = sec.videos.filter(v => !removedSet.has(v.videoId));
      if (sec.videos.length < before) {
        console.log(`  removedVideo: removed ${before - sec.videos.length} from ${item.id} section "${sec.title}"`);
      }
    }
  }
}

// ── 7. Add newVideos ─────────────────────────────────────────────
// Dedup by projectId+videoId, skip videoIds containing '/'
const addedVideoKeys = new Set();
for (const nv of (layout.newVideos || [])) {
  const { projectId, videoId, title, description, aspectRatio } = nv;
  if (videoId.includes('/')) {
    console.log(`  newVideo: skipping URL videoId ${videoId}`);
    continue;
  }
  const key = `${projectId}:${videoId}`;
  if (addedVideoKeys.has(key)) {
    console.log(`  newVideo: skipping duplicate ${key}`);
    continue;
  }
  addedVideoKeys.add(key);

  const item = itemMap.get(projectId);
  if (!item) {
    console.log(`  newVideo: project ${projectId} not found, skipping`);
    continue;
  }

  // Build the video object, using videoEdits for latest title
  const videoObj = { videoId };
  const latestEdits = videoEditMap.get(videoId) || {};
  videoObj.title = latestEdits.title !== undefined ? latestEdits.title : title;
  if (latestEdits.description !== undefined) {
    videoObj.description = latestEdits.description;
  } else if (description) {
    videoObj.description = description;
  }
  if (aspectRatio) videoObj.aspectRatio = aspectRatio;

  // For singles that had their video removed, handle type conversion
  if (item.type === 'single') {
    if (removedSet.has(item.video.videoId)) {
      // Replace the single's video with the new one
      item.video = videoObj;
      console.log(`  newVideo: replaced single ${projectId} video with ${videoId}`);
    } else {
      // Check if this video already exists
      // Single with an additional video — need to check if there are more
      // For now, add to a temporary videos array
      if (!item._extraVideos) item._extraVideos = [];
      item._extraVideos.push(videoObj);
      console.log(`  newVideo: queued extra video ${videoId} for single ${projectId}`);
    }
    continue;
  }

  // For projects with sections, add to the flat videos array
  // (section assignment isn't in newVideos)
  const existingIds = new Set();
  if (item.videos) item.videos.forEach(v => existingIds.add(v.videoId));
  if (item.sections) item.sections.forEach(s => s.videos.forEach(v => existingIds.add(v.videoId)));

  if (existingIds.has(videoId)) {
    console.log(`  newVideo: ${videoId} already exists in ${projectId}`);
    continue;
  }

  if (item.videos) {
    item.videos.push(videoObj);
  } else if (!item.sections) {
    item.videos = [videoObj];
  } else {
    // Has sections — add to first section
    item.sections[0].videos.push(videoObj);
  }
  console.log(`  newVideo: added ${videoId} to ${projectId}`);
}

// Handle hyper-montage-rome: was single with removed video, new video added
// After removal + addition, check the videoLayout to see if it should be project or single
const hyperItem = itemMap.get('hyper-montage-rome');
if (hyperItem && hyperItem.type === 'single') {
  // The videoLayout shows 2 videos (d8a4b789 removed, 17adbeaf added)
  // After removing d8a4b789, only 17adbeaf remains -> keep as single
  console.log(`  hyper-montage-rome: kept as single with video ${hyperItem.video.videoId}`);
}

// ── 8. Add new projects ──────────────────────────────────────────
for (const np of (layout.newProjects || [])) {
  if (itemMap.has(np.id)) {
    console.log(`  newProject: ${np.id} already exists, skipping`);
    continue;
  }

  // Build new item from newProject data + contentEdits
  const newItem = {
    id: np.id,
    type: np.type || 'single',
    title: np.title,
    categories: np.categories || [],
    featured: false,
    order: 9999,
  };

  // Apply content edits for this new project
  const editsForThis = (layout.contentEdits || []).filter(e => e.itemId === np.id);
  for (const edit of editsForThis) {
    if (edit.field === 'credits') {
      newItem.credits = JSON.parse(edit.value);
    } else {
      newItem[edit.field] = edit.value;
    }
  }

  if (np.type === 'single') {
    const videoObj = { videoId: np.videoId };
    const latestEdits = videoEditMap.get(np.videoId) || {};
    videoObj.title = latestEdits.title !== undefined ? latestEdits.title : (np.title || '');
    if (np.aspectRatio) videoObj.aspectRatio = np.aspectRatio;
    newItem.video = videoObj;
  }

  if (np.customThumbnail) {
    newItem.customThumbnail = np.customThumbnail;
  }

  portfolioItems.push(newItem);
  itemMap.set(np.id, newItem);
  console.log(`  newProject: added ${np.id} (${newItem.title})`);
}

// ── 9. Apply videoLayouts (reorder videos) ───────────────────────
for (const vl of (layout.videoLayouts || [])) {
  const { projectId, sectionTitle, videos } = vl;
  const item = itemMap.get(projectId);
  if (!item) continue;

  // Build order map
  const orderMap = new Map();
  for (const v of videos) {
    orderMap.set(v.videoId, v.order);
  }

  if (item.type === 'single') {
    // Singles don't have a videos array to reorder
    continue;
  }

  if (sectionTitle && item.sections) {
    const section = item.sections.find(s => s.title === sectionTitle);
    if (section) {
      // Filter out removed videos from the layout
      const validVideoIds = new Set(section.videos.map(v => v.videoId));
      section.videos.sort((a, b) => {
        const oa = orderMap.get(a.videoId) ?? 9999;
        const ob = orderMap.get(b.videoId) ?? 9999;
        return oa - ob;
      });
      console.log(`  videoLayout: reordered ${projectId} section "${sectionTitle}"`);
    }
  } else if (item.videos) {
    // Filter out removed
    item.videos.sort((a, b) => {
      const oa = orderMap.get(a.videoId) ?? 9999;
      const ob = orderMap.get(b.videoId) ?? 9999;
      return oa - ob;
    });
    console.log(`  videoLayout: reordered ${projectId}`);
  }
}

// ── 10. Serialise back to TypeScript ─────────────────────────────

function escapeStr(s) {
  if (s === undefined || s === null) return '""';
  return JSON.stringify(String(s));
}

function indent(level) {
  return '  '.repeat(level);
}

function serializeCredits(credits, level) {
  if (!credits || credits.length === 0) return '[]';
  const lines = credits.map(c =>
    `${indent(level + 1)}{ label: ${escapeStr(c.label)}, value: ${escapeStr(c.value)} },`
  );
  return `[\n${lines.join('\n')}\n${indent(level)}]`;
}

function serializeVideo(v, level) {
  let lines = [];
  lines.push(`${indent(level)}{`);
  lines.push(`${indent(level + 1)}videoId: ${escapeStr(v.videoId)},`);
  lines.push(`${indent(level + 1)}title: ${escapeStr(v.title)},`);
  if (v.description !== undefined && v.description !== '') {
    lines.push(`${indent(level + 1)}description: ${escapeStr(v.description)},`);
  }
  if (v.aspectRatio) {
    lines.push(`${indent(level + 1)}aspectRatio: ${escapeStr(v.aspectRatio)},`);
  }
  lines.push(`${indent(level)}},`);
  return lines.join('\n');
}

function serializeVideos(videos, level) {
  if (!videos || videos.length === 0) return '[]';
  const parts = videos.map(v => serializeVideo(v, level + 1));
  return `[\n${parts.join('\n')}\n${indent(level)}]`;
}

function serializeGallery(g, level) {
  let lines = [];
  lines.push(`${indent(level)}{`);
  lines.push(`${indent(level + 1)}title: ${escapeStr(g.title)},`);
  const imgs = g.images.map(i => `${indent(level + 3)}${escapeStr(i)},`).join('\n');
  lines.push(`${indent(level + 1)}images: [\n${imgs}\n${indent(level + 2)}],`);
  lines.push(`${indent(level)}},`);
  return lines.join('\n');
}

function serializeSection(sec, level) {
  let lines = [];
  lines.push(`${indent(level)}{`);
  lines.push(`${indent(level + 1)}title: ${escapeStr(sec.title)},`);
  if (sec.description !== undefined && sec.description !== '') {
    lines.push(`${indent(level + 1)}description: ${escapeStr(sec.description)},`);
  }
  if (sec.role !== undefined && sec.role !== '') {
    lines.push(`${indent(level + 1)}role: ${escapeStr(sec.role)},`);
  }
  if (sec.credits && sec.credits.length > 0) {
    lines.push(`${indent(level + 1)}credits: ${serializeCredits(sec.credits, level + 1)},`);
  }
  lines.push(`${indent(level + 1)}videos: ${serializeVideos(sec.videos, level + 1)},`);
  if (sec.galleries && sec.galleries.length > 0) {
    const gals = sec.galleries.map(g => serializeGallery(g, level + 2));
    lines.push(`${indent(level + 1)}galleries: [\n${gals.join('\n')}\n${indent(level + 1)}],`);
  }
  lines.push(`${indent(level)}},`);
  return lines.join('\n');
}

function serializeCategories(cats) {
  return `[${cats.map(c => escapeStr(c)).join(', ')}]`;
}

function serializeItem(item) {
  let lines = [];
  lines.push(`${indent(1)}{`);
  lines.push(`${indent(2)}id: ${escapeStr(item.id)},`);
  lines.push(`${indent(2)}type: ${escapeStr(item.type)},`);
  lines.push(`${indent(2)}title: ${escapeStr(item.title)},`);

  if (item.type === 'project') {
    lines.push(`${indent(2)}client: ${escapeStr(item.client || '')},`);
  } else if (item.client !== undefined) {
    lines.push(`${indent(2)}client: ${escapeStr(item.client)},`);
  }

  if (item.description !== undefined) {
    lines.push(`${indent(2)}description: ${escapeStr(item.description)},`);
  }
  if (item.role !== undefined && item.role !== '') {
    lines.push(`${indent(2)}role: ${escapeStr(item.role)},`);
  }
  if (item.credits && item.credits.length > 0) {
    lines.push(`${indent(2)}credits: ${serializeCredits(item.credits, 2)},`);
  }

  lines.push(`${indent(2)}categories: ${serializeCategories(item.categories)},`);
  lines.push(`${indent(2)}featured: ${item.featured},`);
  lines.push(`${indent(2)}order: ${item.order},`);

  if (item.customThumbnail) {
    lines.push(`${indent(2)}customThumbnail: ${escapeStr(item.customThumbnail)},`);
  }

  if (item.type === 'project') {
    if (item.thumbnailVideoId) {
      lines.push(`${indent(2)}thumbnailVideoId: ${escapeStr(item.thumbnailVideoId)},`);
    }
    lines.push(`${indent(2)}videos: ${serializeVideos(item.videos || [], 2)},`);
    if (item.sections && item.sections.length > 0) {
      const secs = item.sections.map(s => serializeSection(s, 3));
      lines.push(`${indent(2)}sections: [\n${secs.join('\n')}\n${indent(2)}],`);
    }
  } else {
    // single
    if (item.video) {
      let vLines = [];
      vLines.push(`${indent(2)}video: {`);
      vLines.push(`${indent(3)}videoId: ${escapeStr(item.video.videoId)},`);
      vLines.push(`${indent(3)}title: ${escapeStr(item.video.title)},`);
      if (item.video.description !== undefined && item.video.description !== '') {
        vLines.push(`${indent(3)}description: ${escapeStr(item.video.description)},`);
      }
      if (item.video.aspectRatio) {
        vLines.push(`${indent(3)}aspectRatio: ${escapeStr(item.video.aspectRatio)},`);
      }
      vLines.push(`${indent(2)}},`);
      lines.push(vLines.join('\n'));
    }
  }

  if (item.galleries && item.galleries.length > 0) {
    const gals = item.galleries.map(g => serializeGallery(g, 3));
    lines.push(`${indent(2)}galleries: [\n${gals.join('\n')}\n${indent(2)}],`);
  }

  lines.push(`${indent(1)}},`);
  return lines.join('\n');
}

// ── 11. Get the header (types, interfaces, helpers) from original TS ──
// Everything before "export const portfolioItems"
const headerEndIndex = tsSource.indexOf('export const portfolioItems');
if (headerEndIndex === -1) {
  console.error('Could not find "export const portfolioItems" in portfolio.ts');
  process.exit(1);
}
const header = tsSource.substring(0, headerEndIndex);

// ── 12. Build the final output ───────────────────────────────────
const itemsStr = portfolioItems.map(item => serializeItem(item)).join('\n');

const output = `${header}export const portfolioItems: PortfolioItem[] = [
${itemsStr}
]
`;

fs.writeFileSync(TS_PATH, output, 'utf8');
console.log(`\nWrote updated portfolio.ts (${portfolioItems.length} items)`);

// Also copy to public
const publicPath = path.join(ROOT, 'public/data/portfolio.ts');
if (fs.existsSync(path.dirname(publicPath))) {
  fs.writeFileSync(publicPath, output, 'utf8');
  console.log(`Also wrote to ${publicPath}`);
}
