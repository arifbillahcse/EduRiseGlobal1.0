/* Export the content collections from public_html/js/data.js to
   database/seed/content.json, for bin/import-data.php.
   Run on your own PC (needs Node): node bin/export-data.js */
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'public_html/js/data.js'), 'utf8');
const names = ['SITE', 'DESTINATIONS', 'DEST_PHOTOS', 'UNIVERSITIES', 'INTAKES', 'SCHOLARSHIP_OFFERS', 'GOV_SCHOLARSHIPS',
  'TEAM', 'OFFICES', 'NEWS', 'TESTIMONIALS', 'POLICIES', 'PROGRAMS', 'RATES', 'RATES_UPDATED', 'LIVING_COSTS'];
const ctx = { window: {} };                       // no EDURISE_DB here, so data.js uses its built-in data
vm.createContext(ctx);
vm.runInContext(src + '\n;globalThis.__out = {' + names.map(n => `${n}: ${n}`).join(',') + '};', ctx);
const out = path.join(root, 'database/seed/content.json');
fs.writeFileSync(out, JSON.stringify(ctx.__out, null, 1) + '\n');
console.log('Wrote ' + path.relative(root, out) + ': ' + names.map(n => n + '=' + (Array.isArray(ctx.__out[n]) ? ctx.__out[n].length : typeof ctx.__out[n])).join(' '));
