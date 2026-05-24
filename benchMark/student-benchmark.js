// student-benchmark.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 50 },
        { duration: '30s', target: 50 },
        { duration: '10s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
    },
};

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEwMDAsImVtYWlsIjoiYWRtaW5AdGVzdC5jb20iLCJyb2xlTmFtZSI6ImFkbWluIiwicm9sZUlkIjoxLCJzdHVkZW50SWQiOm51bGwsImNvbXBhbnlJZCI6bnVsbCwiaWF0IjoxNzc5MTA4OTY4LCJleHAiOjE3Nzk3MTM3Njh9.DBOUl33-MfMxLsbA2FXBhHxXW6Fg9yeHLSJQX3Yc9B0';

export default function () {
    const res = http.get(
        'http://localhost:3000/student',
        {
            headers: {
                'Authorization': `Bearer ${TOKEN}`,
                'Content-Type': 'application/json',
            },
        }
    );

    //console.log(`Status: ${res.status} | Time: ${res.timings.duration}ms`);

    check(res, {
        'status 200': (r) => r.status === 200,
        'có data': (r) => JSON.parse(r.body) !== null,
        'dưới 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}