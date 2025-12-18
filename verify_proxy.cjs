const { fetch } = require('undici');

async function testProxyEndpoint() {
    const kno = '1013400105'; // Example KNO
    const url = `http://localhost:3001/api/device/${kno}`;

    console.log(`🧪 Testing endpoint: ${url}`);

    try {
        const start = Date.now();
        const response = await fetch(url);
        const duration = Date.now() - start;

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success!');
            console.log('⏱️ Duration:', duration, 'ms');
            console.log('📦 Data Received:', JSON.stringify(data.data).substring(0, 100) + '...');
            if (data.usedProxy) {
                console.log('📡 Used Proxy:', data.usedProxy);
            } else {
                console.log('🌐 Used Direct Connection');
            }
        } else {
            console.error('❌ Failed with status:', response.status);
            const error = await response.json();
            console.error('📝 Error details:', error);
        }
    } catch (e) {
        console.error('💥 Connection Error:', e.message);
    }
}

console.log('--- Proxy Fallback Verification ---');
testProxyEndpoint();
