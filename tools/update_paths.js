const fs = require('fs');

const cssFiles = [
  'about-styles.css', 'branches-styles.css', 'chatbot.css', 'contact-styles.css',
  'doctors-landscape.css', 'face-scanner-styles.css', 'hair-services-styles.css',
  'permanent-makeup-styles.css', 'quick-actions.css', 'services-navigation.css',
  'skin-services-styles.css', 'styles.css', 'terms-styles.css'
];

const jsFiles = [
  'about-script.js', 'branches-script.js', 'chatbot.js', 'contact-script.js',
  'face-scanner-script.js', 'hair-services-script.js', 'mobile-menu.js',
  'permanent-makeup-script.js', 'quick-actions.js', 'script.js',
  'services-navigation.js', 'skin-services-script.js', 'terms-script.js', 'whatsapp-form.js'
];

const htmlFiles = fs.readdirSync('.').filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  cssFiles.forEach(css => {
    const escaped = css.replace(/\./g, '\\.');
    const regex = new RegExp('href=(["\'])(?!css\\/)' + escaped + '(\\?[^"\']*)?\\1', 'g');
    content = content.replace(regex, (match, quote, query) => {
      return `href=${quote}css/${css}${query || ''}${quote}`;
    });
  });

  jsFiles.forEach(js => {
    const escaped = js.replace(/\./g, '\\.');
    const regex = new RegExp('src=(["\'])(?!js\\/)' + escaped + '(\\?[^"\']*)?\\1', 'g');
    content = content.replace(regex, (match, quote, query) => {
      return `src=${quote}js/${js}${query || ''}${quote}`;
    });
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated references in:', file);
  }
});
