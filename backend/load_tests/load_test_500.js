import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 500 }, // Ramp-up to 500 concurrent Virtual Users
    { duration: '30s', target: 500 }, // Sustain 500 Virtual Users
    { duration: '15s', target: 0 },  // Ramp-down to 0
  ],
  thresholds: {
    // 95% of HTTP requests must complete in under 500ms
    http_req_duration: ['p(95)<500'],
    // Request failure rate must be under 1%
    http_req_failed: ['rate<0.01'],
  },
};

// setup runs once before VUs are spawned, establishing a shared session and sandbox index
export function setup() {
  let res = http.get('http://localhost:8000/auth/guest', {
    redirects: 0,
  });
  
  // Extract access_token from the Set-Cookie header
  const setCookieHeader = res.headers['Set-Cookie'] || res.headers['set-cookie'];
  let token = null;
  if (setCookieHeader) {
    const match = setCookieHeader.match(/access_token=([^;]+)/);
    if (match) {
      token = match[1];
    }
  }

  console.log('Setup completed. Dynamic guest index created. Token acquired.');
  return { token: token };
}

export default function (data) {
  const requestParams = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
    },
  };

  // Simulate fuzzy search queries (95% chance)
  const queries = ['', 'sum', 'tree', 'graph', 'dynamic', 'a', 'search'];
  const q = queries[Math.floor(Math.random() * queries.length)];
  
  let res = http.get(`http://localhost:8000/search?q=${q}&limit=8`, requestParams);
  check(res, {
    'search status is 200': (r) => r.status === 200,
  });

  // Simulate adding a problem (5% chance)
  if (Math.random() < 0.05) {
    const timestamp = Date.now();
    const payload = JSON.stringify({
      link: `https://leetcode.com/problems/two-sum/?t=${timestamp}`,
      platform: 'Leetcode',
      difficulty: 'Easy',
      tags: ['strings'],
      notes: 'Added during 500 VUs concurrency simulation.'
    });
    const addParams = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${data.token}`,
      },
    };
    let addRes = http.post('http://localhost:8000/problems', payload, addParams);
    check(addRes, {
      'add problem is 201': (r) => r.status === 201,
    });
  }

  // Simulate user think-time (between 0.5 and 1.5 seconds)
  sleep(Math.random() + 0.5);
}
