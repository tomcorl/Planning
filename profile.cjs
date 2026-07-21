const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = '/Users/tom/Desktop/TEST/Noree/dist';
const PORT = 8889;
const TRACE_FILE = '/tmp/planning-trace.json';

function startServer() {
  const mime = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png' };
  const server = http.createServer((req, res) => {
    let filePath = path.join(DIST, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        fs.readFile(path.join(DIST, 'index.html'), (e2, d2) => {
          if (e2) { res.writeHead(404); res.end('Not found'); return; }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(d2);
        });
        return;
      }
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
  server.listen(PORT);
  return server;
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  console.log('Starting server...');
  const server = startServer();
  await sleep(500);

  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: false,
    args: ['--start-maximized', '--no-sandbox', '--disable-gpu-sandbox'],
    defaultViewport: null,
  });

  const pages = await browser.pages();
  const page = pages[0];

  console.log('Navigating...');
  await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle0', timeout: 30000 });
  await sleep(2000);

  // Take screenshot before login
  await page.screenshot({ path: '/tmp/login-page.png' });

  // Try login - find form elements
  console.log('Attempting login...');
  const allButtons = await page.$$('button');
  console.log(`Found ${allButtons.length} buttons`);

  // Try to find email input
  const inputs = await page.$$('input');
  console.log(`Found ${inputs.length} inputs`);
  for (const inp of inputs) {
    const type = await inp.evaluate(el => el.type);
    console.log(`  Input type=${type} name=${await inp.evaluate(el=>el.name)} placeholder=${await inp.evaluate(el=>el.placeholder)}`);
  }

  // Look for email/password inputs
  let emailInput = null, passInput = null, submitBtn = null;
  for (const inp of inputs) {
    const type = await inp.evaluate(el => el.type);
    if (type === 'email') emailInput = inp;
    if (type === 'password') passInput = inp;
  }

  if (emailInput && passInput) {
    await emailInput.click({ clickCount: 3 });
    await emailInput.type('admin@demo.fr');
    await passInput.type('1234');
    
    // Find submit button
    for (const btn of allButtons) {
      const text = await btn.evaluate(el => el.textContent.trim().toLowerCase());
      if (text.includes('connexion') || text.includes('connecter') || text.includes('se connecter') || text.includes('login') || text.includes('sign in')) {
        submitBtn = btn;
        break;
      }
    }
    if (submitBtn) {
      console.log('Clicking submit...');
      await submitBtn.click();
    } else {
      console.log('No submit button found, pressing Enter');
      await passInput.press('Enter');
    }
  } else {
    console.log('Could not find email/password inputs');
    if (emailInput) console.log('emailInput found');
    // Maybe already logged in?
  }

  await sleep(3000);
  await page.screenshot({ path: '/tmp/after-login.png' });

  // Wait for planning grid
  console.log('Looking for planning grid...');
  try {
    await page.waitForSelector('.planning-scroll', { timeout: 10000 });
    console.log('Planning grid found!');
  } catch(e) {
    console.log('No planning-scroll found, checking page content...');
    const bodyText = await page.evaluate(() => document.body.textContent.substring(0, 500));
    console.log('Body text:', bodyText);
    await browser.close();
    server.close();
    return;
  }

  await sleep(2000);

  // Get scroll dimensions
  const dims = await page.evaluate(() => {
    const el = document.querySelector('.planning-scroll');
    return el ? {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    } : null;
  });
  console.log('Grid dimensions:', JSON.stringify(dims));

  if (!dims || dims.scrollWidth <= dims.clientWidth) {
    console.log('Grid not wide enough for horizontal scroll, exiting');
    await browser.close();
    server.close();
    return;
  }

  // Start tracing
  console.log('Starting trace (scroll phase)...');
  await page.tracing.start({
    path: TRACE_FILE,
    screenshots: false,
    categories: [
      'devtools.timeline',
      'disabled-by-default-devtools.timeline',
      'disabled-by-default-devtools.timeline.frame',
      'blink.console',
      'blink.user_timing',
      'loading',
      'toplevel',
      'disabled-by-default-v8.cpu_profile',
      'disabled-by-default-v8.cpu_profiler',
    ]
  });

  // Rapid back-and-forth scrolling
  console.log('Scrolling rapidly...');
  const scrollMax = Math.min(dims.scrollWidth - dims.clientWidth, 5000);
  const steps = 30;

  for (let pass = 0; pass < 4; pass++) {
    for (let s = 0; s <= steps; s++) {
      await page.evaluate((p) => {
        document.querySelector('.planning-scroll').scrollLeft = p;
      }, Math.round((s / steps) * scrollMax));
    }
    await sleep(16);
    for (let s = steps; s >= 0; s--) {
      await page.evaluate((p) => {
        document.querySelector('.planning-scroll').scrollLeft = p;
      }, Math.round((s / steps) * scrollMax));
    }
    await sleep(16);
  }

  await sleep(500);
  
  console.log('Stopping trace...');
  await page.tracing.stop();

  await browser.close();
  server.close();

  // Analyze
  console.log('Analyzing trace...');
  const raw = fs.readFileSync(TRACE_FILE, 'utf8');
  const traceData = JSON.parse(raw);
  const events = traceData.traceEvents || traceData;

  let scripting = 0, rendering = 0, painting = 0;
  let updateLayer = 0, composite = 0;
  let totalFrames = 0, droppedFrames = 0;
  let frameEvents = [], beginFrames = [];
  let minTs = Infinity, maxTs = 0;

  for (const ev of events) {
    if (!ev.ts || !ev.cat) continue;
    if (ev.ts < minTs) minTs = ev.ts;
    if (ev.ts > maxTs) maxTs = ev.ts;
    
    const cats = ev.cat.split(',');
    const dur = ev.dur || 0;
    const name = ev.name || '';

    // Frames
    if (name === 'BeginFrame') {
      beginFrames.push(ev);
    }
    if (name === 'FrameViewer::frameDropped') droppedFrames++;

    // Scripting: V8 execution
    if (name === 'FunctionCall' || name === 'EvaluateScript' || name === 'v8.run' || 
        name === 'V8.Execute' || name === 'RunMicrotasks' || name === 'TimerFire' ||
        name === 'EventDispatch' || name === 'FireAnimationFrame') {
      if (dur > 0) scripting += dur;
    }

    // Rendering: style + layout
    if (name === 'Layout' || name === 'UpdateLayoutTree' || name === 'PrePaint' ||
        name === 'ScheduleStyleRecalculation' || name === 'UpdateLayerTree' ||
        name.includes('StyleRecalc')) {
      if (dur > 0) rendering += dur;
    }

    // Paint
    if (name === 'Paint' || name === 'RecordContinuation' || name === 'RasterTask' ||
        name === 'CompositeLayers' || name === 'DrawLazyPixelRef' || name === 'DecodeImage') {
      if (dur > 0) painting += dur;
    }

    // UpdateLayer (compositing updates)
    if (name.includes('UpdateLayer') || name === 'Layerize') {
      if (dur > 0) updateLayer += dur;
    }
  }

  const durationMs = (maxTs - minTs) / 1000;
  totalFrames = beginFrames.length;
  const avgFps = durationMs > 0 ? (totalFrames / (durationMs / 1000)) : 0;

  console.log('\n══════════════════════════════════════');
  console.log('  CURRENT PERFORMANCE PROFILE');
  console.log('  (rapid horizontal scroll)');
  console.log('══════════════════════════════════════');
  console.log(`  Duration:         ${durationMs.toFixed(0)}ms`);
  console.log(`  BeginFrames:      ${totalFrames}`);
  console.log(`  Dropped frames:   ${droppedFrames}`);
  console.log(`  Avg FPS:          ${avgFps.toFixed(1)}`);
  console.log('');
  console.log(`  Scripting:        ${(scripting/1000).toFixed(1)}ms (${((scripting/durationMs/10)).toFixed(1)}%)`);
  console.log(`  Rendering:        ${(rendering/1000).toFixed(1)}ms (${((rendering/durationMs/10)).toFixed(1)}%)`);  
  console.log(`  Painting:         ${(painting/1000).toFixed(1)}ms (${((painting/durationMs/10)).toFixed(1)}%)`);
  console.log(`  UpdateLayer:      ${(updateLayer/1000).toFixed(1)}ms (${((updateLayer/durationMs/10)).toFixed(1)}%)`);
  console.log('══════════════════════════════════════\n');

  // Previous profile (approximate from user report: 5808ms scripting)
  console.log('══════════════════════════════════════');
  console.log('  COMPARISON WITH PREVIOUS PROFILE');
  console.log('══════════════════════════════════════');
  console.log('  Previous had ~5808ms scripting from viewportDayRange');
  console.log('  Current scripting:', (scripting/1000).toFixed(1) + 'ms');
  console.log(`  Change: ${scripting > 0 ? 'REDUCED by ' + (100 - ((scripting/1000)/5808*100)).toFixed(1) + '%' : 'N/A (0ms scripting)'}`);
  console.log('');
  
  // Analysis summary
  const analysis = { 
    durationMs: Math.round(durationMs), totalFrames, droppedFrames, 
    avgFps: Math.round(avgFps*10)/10,
    scriptingMs: Math.round(scripting/1000),
    renderingMs: Math.round(rendering/1000),
    paintingMs: Math.round(painting/1000),
    updateLayerMs: Math.round(updateLayer/1000),
  };
  fs.writeFileSync('/tmp/planning-analysis.json', JSON.stringify(analysis, null, 2));
  console.log('Detailed analysis saved to /tmp/planning-analysis.json');
}

run().catch(e => { 
  console.error('ERROR:', e.message); 
  process.exit(1); 
});
