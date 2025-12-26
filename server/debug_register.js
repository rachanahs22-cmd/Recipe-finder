const http = require('http');

const postData = JSON.stringify({
    name: 'Vinutha',
    email: 'vinusk@gmail.com',
    password: '*****' // I will use a dummy password for safety in logs, but enough to trigger logic
});

const options = {
    hostname: '127.0.0.1', // Force IPv4
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('Sending request to', options.hostname, options.port);

const req = http.request(options, (res) => {
    console.log(`STATUS_CODE: ${res.statusCode}`);
    const chunks = [];
    res.on('data', (chunk) => chunks.push(chunk));
    res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        console.log('RESPONSE_BODY:', body);
    });
});

req.on('error', (e) => {
    console.error(`PROBLEM WITH REQUEST: ${e.message}`);
});

// Write data to request body
req.write(postData);
req.end();
