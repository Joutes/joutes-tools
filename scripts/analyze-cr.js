const cr = require('../data/riftbound/cr.json');

// Show the depth hierarchy of IDs
const levels = {};
cr.forEach(e => {
  const parts = e.id.split('.');
  const depth = parts.length;
  levels[depth] = (levels[depth] || 0) + 1;
});
console.log('Depths:', levels);

// Find titles - entries where the pure 3-digit id has short content
const titles = cr.filter(e => /^\d{3}$/.test(e.id) && e.content.length <= 60);
console.log('\nSection titles count:', titles.length);

// Check how "See rule XXX. Title" references look
const seeRuleRefs = cr.filter(e => /See rule \d+\./.test(e.content));
console.log('\nEntries with "See rule N." pattern:', seeRuleRefs.length);
console.log('Sample:');
seeRuleRefs.slice(0, 5).forEach(e => {
  const match = e.content.match(/See rule (\d+\.\s+[\w\s]+)/);
  if (match) console.log(' ', match[0]);
});

// Check unique sections (hundreds)
const hundreds = [...new Set(cr.map(e => Math.floor(parseInt(e.id.split('.')[0]) / 100) * 100))];
hundreds.sort((a,b) => a-b);
console.log('\nMajor sections (hundreds):', hundreds);

// Find section headers for each hundred
hundreds.forEach(h => {
  const entry = cr.find(e => parseInt(e.id) === h && /^\d{3}$/.test(e.id));
  if (entry) console.log(h + ': ' + entry.content);
});

