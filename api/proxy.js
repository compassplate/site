const https = require('https');
const http = require('http');

const blockedDomains = [
  'facebook.com', 'instagram.com', 'tiktok.com',
  'twitter.com', 'x.com', 'reddit.com'
];

function fetchURL(targetURL) {
  return new Promise((resolve, reject) => {
    const protocol = targetURL.startsWith('https') ? https : http;
    
    protocol.get(targetURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      let redirectCount = 0;

      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectCount < 5) {
        redirectCount++;
        const redirectURL = res.headers.location.startsWith('http') 
          ? res.headers.location 
          : new URL(res.headers.location, targetURL).toString();
        fetchURL(redirectURL).then(resolve).catch(reject);
        return;
      }

      res.on('data', (chunk) => {
        data += chunk.toString();
        if (data.length > 10 * 1024 * 1024) {
          res.destroy();
          reject(new Error('Response too large'));
        }
      });

      res.on('end', () => {
        const contentType = res.headers['content-type'] || 'text/plain';
        resolve({
          body: data,
          contentType: contentType,
          headers: res.headers,
          statusCode: res.statusCode
        });
      });
    }).on('error', reject).on('timeout', () => {
      reject(new Error('Request timeout'));
    });
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  if (!url || !url.match(/^https?:\/\//)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  const urlHostname = new URL(url).hostname;
  if (blockedDomains.some(domain => urlHostname.includes(domain))) {
    return res.status(403).json({ error: 'Domain blocked for privacy' });
  }

  try {
    const result = await fetchURL(url);
    const isHTML = result.contentType.includes('text/html');

    return res.status(200).json({
      type: isHTML ? 'html' : 'text',
      content: result.body,
      status: 'success'
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Proxy error' });
  }
}
