const fetch = require('undici').fetch;

async function runTest() {
    const baseUrl = 'http://localhost:3001';

    console.log('1. Logging in...');
    try {
        const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });

        if (!loginRes.ok) {
            console.error('Login failed:', await loginRes.text());
            return;
        }

        const data = await loginRes.json();
        const token = data.token;
        console.log('Login successful. Token obtained.');

        console.log('2. Creating a test report...');
        const reportData = {
            customerName: 'Debug Customer',
            serviceDate: '2024-01-01',
            deviceType: 'Debug Device',
            brand: 'Debug Brand',
            model: 'Debug Model',
            serialNumber: '12345',
            faultDescription: 'Debug Fault',
            actionTaken: 'Debug Action',
            status: 'pending',
            technicianName: 'Admin'
        };

        const createRes = await fetch(`${baseUrl}/api/reports`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reportData)
        });

        if (!createRes.ok) {
            console.error('Create report failed:', await createRes.text());
            return;
        }

        const report = await createRes.json();
        console.log('Report created with ID:', report.id);

        console.log('3. Generating signature link...');
        const linkRes = await fetch(`${baseUrl}/api/reports/${report.id}/sign-link`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!linkRes.ok) {
            console.error('Generate link failed!');
            console.error('Status:', linkRes.status);
            const text = await linkRes.text();
            console.error('Body:', text);
        } else {
            const data = await linkRes.json();
            console.log('Success! Link generated:', data);
        }
    } catch (e) {
        console.error('Connection error:', e.message);
    }
}

runTest().catch(console.error);
