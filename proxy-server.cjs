const express = require('express');
const cors = require('cors');
const { fetch, ProxyAgent } = require('undici');

const app = express();
const PORT = 3001;

// Cache for proxies
let proxyList = [];
let workingProxy = null;
let lastProxyUpdate = 0;

// Enable CORS for all origins
app.use(cors());

async function getTurkishProxies() {
    if (proxyList.length > 0 && Date.now() - lastProxyUpdate < 60 * 60 * 1000) {
        return proxyList;
    }

    console.log('🔄 Fetching new Turkish proxy list...');
    const strictSources = [
        'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=5000&country=TR&ssl=all&anonymity=all',
        'https://www.proxy-list.download/api/v1/get?type=http&country=TR',
        'https://raw.githubusercontent.com/roosterkid/openproxylist/master/HTTPS_raw.txt',
        'https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/http.txt'
    ];

    let proxies = [];
    for (const source of strictSources) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(source, { signal: controller.signal });
            clearTimeout(timeout);

            if (response.ok) {
                const text = await response.text();
                const lines = text.split('\n');
                lines.forEach(line => {
                    const clean = line.trim();
                    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(clean)) {
                        proxies.push(`http://${clean}`);
                    }
                });
            }
        } catch (e) {
            console.error(`Failed to fetch proxies from ${source}:`, e.message);
        }
    }

    proxyList = [...new Set(proxies)].sort(() => Math.random() - 0.5);
    lastProxyUpdate = Date.now();
    console.log(`✅ Found ${proxyList.length} potential proxies.`);
    return proxyList;
}

// Proxy endpoint to fetch data from Health Ministry
app.get('/api/device/:kno', async (req, res) => {
    const { kno } = req.params;
    const url = `https://sbu2.saglik.gov.tr/QR/QR.aspx?kno=${kno}`;

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
    };

    async function attemptFetch(proxyUrl = null) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), proxyUrl ? 5000 : 8000);

        try {
            const options = { headers, signal: controller.signal };
            if (proxyUrl) {
                options.dispatcher = new ProxyAgent(proxyUrl);
                console.log(`📡 Attempting fetch via proxy: ${proxyUrl}`);
            } else {
                console.log(`🌐 Attempting direct fetch: ${url}`);
            }

            const response = await fetch(url, options);
            clearTimeout(timeout);

            if (response.ok) {
                const html = await response.text();
                if (html.includes('KİMLİK NO') || html.includes('TÜR')) {
                    const data = parseHtmlTable(html);
                    if (data.serialNumber || data.brand || data.model) {
                        return { success: true, data };
                    }
                }
            }
            return { success: false };
        } catch (e) {
            clearTimeout(timeout);
            console.error(`❌ Fetch failed (${proxyUrl ? 'Proxy' : 'Direct'}):`, e.message);
            return { success: false };
        }
    }

    try {
        if (workingProxy) {
            const result = await attemptFetch(workingProxy);
            if (result.success) return res.json({ success: true, data: result.data, kno, usedProxy: workingProxy });
            workingProxy = null;
        }

        const directResult = await attemptFetch();
        if (directResult.success) return res.json({ success: true, data: directResult.data, kno });

        console.log("🔄 Fallback to automatic proxy...");
        const proxies = await getTurkishProxies();
        for (let i = 0; i < Math.min(proxies.length, 10); i++) {
            const result = await attemptFetch(proxies[i]);
            if (result.success) {
                workingProxy = proxies[i];
                return res.json({ success: true, data: result.data, kno, usedProxy: workingProxy });
            }
        }

        throw new Error('All methods failed.');
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Parse HTML table from Health Ministry page
function parseHtmlTable(html) {
    const data = {};

    // Match all table rows with two cells
    const rowRegex = /<tr>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<\/tr>/gi;
    let match;

    while ((match = rowRegex.exec(html)) !== null) {
        let key = match[1].trim();
        let value = match[2].trim();

        // Decode HTML entities
        key = decodeHtmlEntities(key);
        value = decodeHtmlEntities(value);

        if (key && value) {
            data[key] = value;
        }
    }

    // Map to standardized field names
    return {
        kimlikNo: data['KİMLİK NO'] || '',
        budgetType: data['BÜTÇE TÜRÜ'] || '',
        acquisitionYear: data['EDİNME YILI'] || '',
        inventoryNo: data['DEMİRBAŞ NO'] || '',
        registrationNo: data['SİCİL NO'] || '',
        materialDescription: data['MALZEME TANIMI'] || '',
        deviceType: data['TÜR'] || '',
        description: data['TANIM'] || '',
        location: data['YER'] || '',
        branch: data['BRANS'] || '',
        brand: data['MARKA'] || '',
        model: data['MODEL'] || '',
        lot: data['LOT'] || '',
        serialNumber: data['S/N'] || '',
        materialNote: data['MALZEME AÇIKLAMA'] || '',
        tagNote: data['KÜNYE AÇIKLAMA'] || '',
        barcode: data['BARKOD'] || '',
        institutionCode: data['KURUM KODU'] || '',
        institutionName: data['KURUM ADI'] || '',
        assignee: data['ZİMMET SAHİBİ'] || '',
        assigneeLocation: data['ZİMMET YERİ'] || '',
        assignmentDate: data['ZİMMET TARİHİ'] || '',
        productionYear: data['ÜRETİM TARİHİ'] || '',
        deviceStatus: data['CİHAZIN DURUMU'] || '',
        supplyType: data['TEDARİK TÜRÜ'] || '',
        supplierCompany: data['TEDARİKÇİ FİRMA'] || '',
    };
}

// Decode HTML entities
function decodeHtmlEntities(text) {
    const entities = {
        '&#220;': 'Ü',
        '&#214;': 'Ö',
        '&#199;': 'Ç',
        '&#350;': 'Ş',
        '&#304;': 'İ',
        '&#286;': 'Ğ',
        '&amp;': '&',
        '&gt;': '>',
        '&lt;': '<',
        '&quot;': '"',
    };

    let result = text;
    for (const [entity, char] of Object.entries(entities)) {
        result = result.replace(new RegExp(entity, 'g'), char);
    }

    return result;
}

app.listen(PORT, () => {
    console.log(`✅ Proxy server running at http://localhost:${PORT}`);
    console.log(`📡 Use: http://localhost:${PORT}/api/device/{kno}`);
    console.log(`Example: http://localhost:${PORT}/api/device/1013400105`);
});
