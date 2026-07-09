import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '20s', target: 20 }, // Ramp-up to 20 concurrent Virtual Users
    { duration: '40s', target: 20 }, // Stay at 20 Virtual Users
    { duration: '15s', target: 0 },  // Ramp-down to 0
  ],
  thresholds: {
    // 95% of HTTP requests must complete in under 500ms
    http_req_duration: ['p(95)<500'],
    // Request failure rate must be under 1%
    http_req_failed: ['rate<0.01'],
  },
};

// Global variables in k6 script are instantiated per Virtual User (VU) context
let isLoggedIn = false;
let authToken = '';

export default function () {
  // Step 1: Initialize session (runs exactly once per VU lifecycle)
  if (!isLoggedIn) {
    let res = http.get('http://localhost:8000/auth/guest', {
      redirects: 0, // Do not follow redirects to frontend page
    });
    
    // Extract access_token from the Set-Cookie header to bypass cookie jar issues
    const setCookieHeader = res.headers['Set-Cookie'] || res.headers['set-cookie'];
    let token = null;
    if (setCookieHeader) {
      const match = setCookieHeader.match(/access_token=([^;]+)/);
      if (match) {
        token = match[1];
      }
    }

    let ok = check(res, {
      'guest login is redirect': (r) => r.status === 307,
      'token extracted successfully': () => token !== null,
    });
    
    if (ok) {
      authToken = token;
      isLoggedIn = true;
    }
    sleep(1); // Give a brief pause after login
    return;
  }

  const requestParams = {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
  };

  // Step 2: Simulate fuzzy search queries (95% chance)
  const queries = ['', 'sum', 'tree', 'graph', 'dynamic', 'a', 'search'];
  const q = queries[Math.floor(Math.random() * queries.length)];
  
  let res = http.get(`http://localhost:8000/search?q=${q}&limit=8`, requestParams);
  check(res, {
    'search status is 200': (r) => r.status === 200,
  });

  // Step 3: Simulate adding a problem (5% chance)
  if (Math.random() < 0.05) {
    // Generate a unique problem URL using dynamic timestamp to avoid collisions
    const timestamp = Date.now();
    const payload = JSON.stringify({
      link: `https://leetcode.com/problems/two-sum/?t=${timestamp}`,
      platform: 'Leetcode',
      difficulty: 'Easy',
      tags: ['strings'],
      notes: 'This problem was added during load test simulation.'
    });
    const addParams = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
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
