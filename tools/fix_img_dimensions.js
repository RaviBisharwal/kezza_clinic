#!/usr/bin/env node
/**
 * Fix missing width & height attributes on all <img> tags
 */
const fs = require('fs');

const DIM = {
  logo:    { w: '160',  h: '60'  },
  hero:    { w: '1200', h: '630' },
  doctor:  { w: '400',  h: '500' },
  clinic:  { w: '800',  h: '600' },
  default: { w: '600',  h: '400' },
};

function getDim(src) {
  if (!src) return DIM.default;
  if (/logo/.test(src))                              return DIM.logo;
  if (/hero\d?\./.test(src))                         return DIM.hero;
  if (/doctor|dr-|amrita|dhiral/.test(src))          return DIM.doctor;
  if (/keeza|kezza|clinic|reception|hall/.test(src)) return DIM.clinic;
  return DIM.default;
}

const files = fs.readdirSync('frontend').filter(f => f.endsWith('.html'));
let total = 0;

files.forEach(file => {
  let html = fs.readFileSync('frontend/' + file, 'utf8');
  let count = 0;

  html = html.replace(/<img(\s[^>]*)>/gi, (match, attrs) => {
    const hasWidth  = /\bwidth\s*=/i.test(attrs);
    const hasHeight = /\bheight\s*=/i.test(attrs);
    if (hasWidth && hasHeight) return match;

    const m = attrs.match(/src=["']([^"']*)["']/i);
    const dim = getDim(m ? m[1] : '');

    let a = attrs;
    if (!hasWidth)  a += ' width="'  + dim.w + '"';
    if (!hasHeight) a += ' height="' + dim.h + '"';
    count++;
    return '<img' + a + '>';
  });

  fs.writeFileSync('frontend/' + file, html, 'utf8');
  total += count;
  if (count > 0) console.log('✅', file, '—', count, 'imgs fixed');
});

console.log('\n✅ Total img tags fixed:', total);
