/**
 * Stress testing the classic links read/write.
 * 
 * Example usage:
 *  node src/classic-rw.mjs --url http://localhost:2080 --connections 5 --sessions 500 --duration 10 --rate 50 write-ratio 20 --output codes.txt
 * 
 */

import autocannon from 'autocannon';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { randomBytes } from 'crypto';

const DOMAINS = [
  'github.com', 'stackoverflow.com', 'en.wikipedia.org',
  'docs.python.org', 'developer.mozilla.org', 'medium.com',
  'reddit.com', 'linkedin.com', 'news.ycombinator.com',
  'npmjs.com', 'pypi.org', 'go.dev', 'learn.microsoft.com',
  'aws.amazon.com', 'vercel.com', 'netlify.com', 'digitalocean.com',
  'dev.to', 'freecodecamp.org', 'css-tricks.com', 'smashingmagazine.com',
  'web.dev', 'docs.rs', 'crates.io', 'pkg.go.dev',
];

const SLUGS = [
  'getting-started', 'installation', 'configuration', 'api-reference',
  'introduction', 'tutorial', 'examples', 'quickstart', 'overview',
  'best-practices', 'troubleshooting', 'faq', 'changelog', 'releases',
  'documentation', 'guides', 'concepts', 'advanced', 'deployment',
  'security', 'performance', 'testing', 'debugging', 'migration',
  'authentication', 'authorization', 'routing', 'middleware', 'hooks',
];

function randomSlug() {
  const r = Math.random();
  if (r < 0.45) return SLUGS[Math.floor(Math.random() * SLUGS.length)];
  if (r < 0.75) return String(Math.floor(Math.random() * 9_000_000) + 1_000_000);
  return randomBytes(4).toString('hex');
}

function generateUrl() {
  const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
  const depth = Math.floor(Math.random() * 3) + 1;
  const path = Array.from({ length: depth }, randomSlug).join('/');
  let url = `https://${domain}/${path}`;

  if (Math.random() < 0.3) {
    const params = new URLSearchParams();
    if (Math.random() < 0.6) params.set('ref', ['share', 'docs', 'nav', 'search'][Math.floor(Math.random() * 4)]);
    if (Math.random() < 0.4) params.set('tab', ['readme', 'code', 'issues', 'wiki'][Math.floor(Math.random() * 4)]);
    url += `?${params.toString()}`;
  }

  return url;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    url: null,
    connections: 10,
    duration: 30,
    pipelining: 1,
    pool: 500,
    sessions: 100,
    writeRatio: 20,
    rate: null,
    output: 'codes.txt',
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]?.replace(/^--/, '');
    const val = args[i + 1];
    if (key === 'url') opts.url = val;
    else if (key === 'connections') opts.connections = parseInt(val, 10);
    else if (key === 'duration') opts.duration = parseInt(val, 10);
    else if (key === 'pipelining') opts.pipelining = parseInt(val, 10);
    else if (key === 'pool') opts.pool = parseInt(val, 10);
    else if (key === 'sessions') opts.sessions = parseInt(val, 10);
    else if (key === 'write-ratio') opts.writeRatio = parseInt(val, 10);
    else if (key === 'rate') opts.rate = parseInt(val, 10);
    else if (key === 'output') opts.output = val;
  }

  return opts;
}

async function getSessionCookie(baseUrl) {
  const res = await fetch(`${baseUrl}/auth/status`);

  let headers;
  if (typeof res.headers.getSetCookie === 'function') {
    headers = res.headers.getSetCookie();
  } else {
    const raw = res.headers.get('set-cookie') || '';
    headers = raw ? [raw] : [];
  }

  return headers.map(h => h.split(';')[0].trim()).join('; ');
}

async function main() {
  const opts = parseArgs();

  if (!opts.url) {
    console.error('Usage: node scripts/stress.mjs --url <base-url> [--connections 10] [--duration 30] [--pipelining 1] [--pool 500] [--sessions 100] [--write-ratio 20] [--output codes.txt]');
    process.exit(1);
  }

  const baseUrl = opts.url.replace(/\/$/, '');
  const readRatio = 100 - opts.writeRatio;

  // Establish sessions (skipped for pure read runs — reads carry no cookie)
  let sessionCookies = [];
  if (opts.writeRatio > 0) {
    console.log(`Establishing ${opts.sessions} sessions...`);
    sessionCookies = await Promise.all(
      Array.from({ length: opts.sessions }, () => getSessionCookie(baseUrl))
    );
    if (sessionCookies.some(c => !c)) {
      console.error('Failed to obtain one or more session cookies from /auth/status');
      process.exit(1);
    }
    console.log(`${opts.sessions} sessions established.\n`);
  }

  // Warmup. Pre-seed the code pool so reads can start immediately
  const codePool = [];
  const collectedCodes = [];

  // Seed the code pool from the output file (populated by a prior write run)
  if (existsSync(opts.output)) {
    const lines = readFileSync(opts.output, 'utf8').split('\n').filter(Boolean);
    codePool.push(...lines);
    console.log(`Loaded ${codePool.length} codes from ${opts.output}.\n`);
  } else if (opts.writeRatio < 100) {
    console.warn(`Warning: ${opts.output} not found — read requests will have no codes until writes produce some.\n`);
  }

  // Step 3: Build the interleaved requests array
  const writeCount = Math.round(opts.pool * opts.writeRatio / 100);
  const readCount = opts.pool - writeCount;
  const readsPerWrite = readCount / writeCount;

  const writeRequests = Array.from({ length: writeCount }, (_, i) => ({
    method: 'POST',
    path: '/url',
    headers: {
      'content-type': 'application/json',
      cookie: sessionCookies[i % sessionCookies.length],
    },
    body: JSON.stringify({ url: generateUrl(), type: 'classic' }),
    onResponse: (status, body) => {
      if (status === 200) {
        try {
          const { code } = JSON.parse(body);
          if (code) { codePool.push(code); collectedCodes.push(code); }
        } catch { }
      }
    },
  }));

  const readRequests = Array.from({ length: readCount }, () => ({
    method: 'GET',
    path: '/',
    headers: {},
    setupRequest: (req) => {
      req.path = `/${codePool[Math.floor(Math.random() * codePool.length)]}`;
      return req;
    },
  }));

  // Build the final requests array, handling pure-read and pure-write edge cases
  let requests;
  if (writeCount === 0) {
    requests = readRequests;
  } else if (readCount === 0) {
    requests = writeRequests;
  } else {
    requests = [];
    for (let i = 0; i < writeCount; i++) {
      requests.push(writeRequests[i]);
      const start = Math.round(i * readsPerWrite);
      const end = Math.round((i + 1) * readsPerWrite);
      for (let j = start; j < end; j++) requests.push(readRequests[j]);
    }
  }

  // Running autocannon
  console.log(`Running: ${opts.connections} connections · ${opts.duration}s · ${opts.writeRatio}% writes / ${readRatio}% reads · ${opts.sessions} sessions\n`);

  const instance = autocannon(
    {
      url: baseUrl,
      connections: opts.connections,
      duration: opts.duration,
      pipelining: opts.pipelining,
      ...(opts.rate && { overallRate: opts.rate }),
      requests,
    },
    (err, result) => {
      if (err) { console.error('Autocannon error:', err); process.exit(1); }
      console.log('\nStatus codes:', result.statusCodeStats);
      if (collectedCodes.length > 0) {
        writeFileSync(opts.output, collectedCodes.join('\n'), 'utf8');
        console.log(`${collectedCodes.length} codes written to ${opts.output}`);
      }
    },
  );

  autocannon.track(instance);
}

main().catch(err => { console.error(err); process.exit(1); });