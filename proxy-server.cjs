const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors());

// Proxy endpoint to fetch data from Health Ministry
app.get('/api/device/:kno', async (req, res) => {
    const { kno } = req.params;

    try {
        const url = `https://sbu2.saglik.gov.tr/QR/QR.aspx?kno=${kno}`;

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();

        // Parse the HTML table and extract data
        const data = parseHtmlTable(html);

        res.json({
            success: true,
            data: data,
            kno: kno
        });

    } catch (error) {
        console.error('Error fetching device data:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
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
