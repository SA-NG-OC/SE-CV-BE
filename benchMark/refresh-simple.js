// login-benchmark.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 10 },  // ramp up
        { duration: '30s', target: 10 },  // giữ
        { duration: '10s', target: 0 },   // ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.01'],
    },
};

export default function () {
    const res = http.post(
        'http://localhost:3000/auth/login',
        JSON.stringify({
            email: 'company@test.com',
            password: '123456',
        }),
        {
            headers: { 'Content-Type': 'application/json' },
        }
    );

    check(res, {
        'status 200': (r) => r.status === 200,
        'có access_token': (r) => JSON.parse(r.body).access_token !== undefined,
        'dưới 500ms': (r) => r.timings.duration < 500,
    });

    sleep(1);
}