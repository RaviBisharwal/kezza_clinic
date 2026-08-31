/**
 * Kezza Clinic — Static Frontend Server
 * Serves all files from the /frontend directory on port 3001.
 * 
 * Usage:
 *   node server.js
 *   
 * Then open: http://localhost:3001
 */

const express = require('express');
const path    = require('path');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Serve all frontend assets from ./frontend/ ─────────────────────
app.use(express.static(path.join(__dirname, 'frontend'), {
    extensions: ['html'],   // allows /about instead of /about.html
    maxAge:     '1h',
}));

// ── Fallback: root → frontend/index.html ──────────────────────────
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ── 404 — serve frontend/index.html for SPA-style navigation ──────
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n✅ Kezza Clinic Website is LIVE at: http://localhost:${PORT}`);
    console.log(`📁 Serving from: ./frontend/`);
    console.log(`\nPress Ctrl+C to stop.\n`);
});
