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
// the Bangla dictionary (everything in i18n.js before the I18n engine) and the promo bar messages
const i18n = fs.readFileSync(path.join(root, 'public_html/js/i18n.js'), 'utf8').split('const I18n')[0];
vm.runInContext(i18n + '\n;globalThis.__out.BN = BN;', ctx);
const layout = fs.readFileSync(path.join(root, 'public_html/js/layout.js'), 'utf8');
const ribbon = layout.match(/const RIBBON_MSGS = (?:FROM_DB\.promo \|\| )?(\[[\s\S]*?\]);/);
ctx.__out.RIBBON_MSGS = ribbon ? vm.runInNewContext(ribbon[1]) : [];
names.push('BN', 'RIBBON_MSGS');
const out = path.join(root, 'database/seed/content.json');
fs.writeFileSync(out, JSON.stringify(ctx.__out, null, 1) + '\n');
console.log('Wrote ' + path.relative(root, out) + ': ' + names.map(n => n + '=' + (Array.isArray(ctx.__out[n]) ? ctx.__out[n].length : typeof ctx.__out[n])).join(' '));
