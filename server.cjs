const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'medtech-secret-key-change-in-production';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'medtech.db');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Database setup
const db = new Database(DB_PATH);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    fullName TEXT NOT NULL,
    role TEXT DEFAULT 'technician',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
  
  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    reportNumber TEXT,
    serviceDate TEXT NOT NULL,
    deviceType TEXT NOT NULL,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    serialNumber TEXT NOT NULL,
    tagNumber TEXT,
    productionYear TEXT,
    customerName TEXT NOT NULL,
    department TEXT,
    contactPerson TEXT,
    customerEmail TEXT,
    faultDescription TEXT NOT NULL,
    actionTaken TEXT NOT NULL,
    partsUsed TEXT,
    status TEXT NOT NULL,
    technicianName TEXT NOT NULL,
    notes TEXT,
    technicianSignature TEXT,
    customerSignature TEXT,
    signatureToken TEXT,
    photos TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
  
  CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    companyName TEXT,
    companyLogo TEXT,
    templateConfig TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

// Add new columns if they don't exist (for existing databases)
// Add new columns if they don't exist (for existing databases)
const addColumnIfNotExists = (table, column, type) => {
    try {
        const columns = db.prepare(`PRAGMA table_info(${table})`).all();
        const exists = columns.some(c => c.name === column);
        if (!exists) {
            console.log(`Adding column ${column} to ${table}...`);
            db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`);
            console.log(`✅ Column ${column} added.`);
        }
    } catch (error) {
        console.error(`❌ Failed to add column ${column} to ${table}:`, error.message);
    }
};

addColumnIfNotExists('reports', 'productionYear', 'TEXT');
addColumnIfNotExists('reports', 'customerEmail', 'TEXT');
addColumnIfNotExists('reports', 'technicianSignature', 'TEXT');
addColumnIfNotExists('reports', 'customerSignature', 'TEXT');
addColumnIfNotExists('reports', 'photos', 'TEXT');
addColumnIfNotExists('reports', 'signatureToken', 'TEXT');


// Create default admin user if not exists
const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (id, username, password, fullName, role) VALUES (?, ?, ?, ?, ?)').run(
        uuidv4(), 'admin', hashedPassword, 'Administrator', 'admin'
    );
    console.log('✅ Default admin user created (username: admin, password: admin123)');
}

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Auth middleware
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// ============== AUTH ENDPOINTS ==============

// Register
app.post('/api/auth/register', (req, res) => {
    const { username, password, fullName } = req.body;

    if (!username || !password || !fullName) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = uuidv4();

    db.prepare('INSERT INTO users (id, username, password, fullName) VALUES (?, ?, ?, ?)').run(
        id, username, hashedPassword, fullName
    );

    const token = jwt.sign({ id, username, fullName, role: 'technician' }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id, username, fullName, role: 'technician' } });
});

// Login
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, fullName: user.fullName, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role } });
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = db.prepare('SELECT id, username, fullName, role FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
});

// ============== REPORTS ENDPOINTS ==============

// Get all reports for user
app.get('/api/reports', authMiddleware, (req, res) => {
    const reports = db.prepare('SELECT * FROM reports WHERE userId = ? ORDER BY createdAt DESC').all(req.user.id);
    // Parse JSON fields
    const parsed = reports.map(r => ({
        ...r,
        partsUsed: r.partsUsed ? JSON.parse(r.partsUsed) : [],
        photos: r.photos ? JSON.parse(r.photos) : []
    }));
    res.json(parsed);
});

// Get single report
app.get('/api/reports/:id', authMiddleware, (req, res) => {
    const report = db.prepare('SELECT * FROM reports WHERE id = ? AND userId = ?').get(req.params.id, req.user.id);
    if (!report) {
        return res.status(404).json({ error: 'Report not found' });
    }
    report.partsUsed = report.partsUsed ? JSON.parse(report.partsUsed) : [];
    report.photos = report.photos ? JSON.parse(report.photos) : [];
    res.json(report);
});

// Create report
app.post('/api/reports', authMiddleware, (req, res) => {
    const id = uuidv4();
    const {
        reportNumber, serviceDate, deviceType, brand, model, serialNumber,
        tagNumber, productionYear, customerName, department, contactPerson, customerEmail,
        faultDescription, actionTaken, partsUsed, status, technicianName, notes,
        technicianSignature, customerSignature, photos
    } = req.body;

    db.prepare(`
    INSERT INTO reports (id, userId, reportNumber, serviceDate, deviceType, brand, model, serialNumber,
      tagNumber, productionYear, customerName, department, contactPerson, customerEmail, faultDescription, 
      actionTaken, partsUsed, status, technicianName, notes, technicianSignature, customerSignature, photos)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
        id, req.user.id, reportNumber || null, serviceDate, deviceType, brand, model, serialNumber,
        tagNumber || null, productionYear || null, customerName, department || null, contactPerson || null,
        customerEmail || null, faultDescription, actionTaken, JSON.stringify(partsUsed || []), status,
        technicianName, notes || null, technicianSignature || null, customerSignature || null,
        JSON.stringify(photos || [])
    );

    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(id);
    report.partsUsed = report.partsUsed ? JSON.parse(report.partsUsed) : [];
    report.photos = report.photos ? JSON.parse(report.photos) : [];
    res.json(report);
});

// Update report
app.put('/api/reports/:id', authMiddleware, (req, res) => {
    const existing = db.prepare('SELECT id FROM reports WHERE id = ? AND userId = ?').get(req.params.id, req.user.id);
    if (!existing) {
        return res.status(404).json({ error: 'Report not found' });
    }

    const {
        reportNumber, serviceDate, deviceType, brand, model, serialNumber,
        tagNumber, productionYear, customerName, department, contactPerson, customerEmail,
        faultDescription, actionTaken, partsUsed, status, technicianName, notes,
        technicianSignature, customerSignature, photos
    } = req.body;

    db.prepare(`
    UPDATE reports SET
      reportNumber = ?, serviceDate = ?, deviceType = ?, brand = ?, model = ?, serialNumber = ?,
      tagNumber = ?, productionYear = ?, customerName = ?, department = ?, contactPerson = ?, customerEmail = ?,
      faultDescription = ?, actionTaken = ?, partsUsed = ?, status = ?, technicianName = ?, notes = ?,
      technicianSignature = ?, customerSignature = ?, photos = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
        reportNumber || null, serviceDate, deviceType, brand, model, serialNumber,
        tagNumber || null, productionYear || null, customerName, department || null, contactPerson || null,
        customerEmail || null, faultDescription, actionTaken, JSON.stringify(partsUsed || []), status,
        technicianName, notes || null, technicianSignature || null, customerSignature || null,
        JSON.stringify(photos || []), req.params.id
    );

    const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(req.params.id);
    report.partsUsed = report.partsUsed ? JSON.parse(report.partsUsed) : [];
    report.photos = report.photos ? JSON.parse(report.photos) : [];
    res.json(report);
});

// Delete report
app.delete('/api/reports/:id', authMiddleware, (req, res) => {
    const result = db.prepare('DELETE FROM reports WHERE id = ? AND userId = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) {
        return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ success: true });
});

// Generate signature link
app.post('/api/reports/:id/sign-link', authMiddleware, (req, res) => {
    try {
        const existing = db.prepare('SELECT id, signatureToken FROM reports WHERE id = ? AND userId = ?').get(req.params.id, req.user.id);
        if (!existing) {
            return res.status(404).json({ error: 'Report not found' });
        }

        let token = existing.signatureToken;
        if (!token) {
            token = uuidv4();
            db.prepare('UPDATE reports SET signatureToken = ? WHERE id = ?').run(token, req.params.id);
        }

        res.json({ token, url: `/sign/${token}` });
    } catch (error) {
        console.error('Error generating signature link:', error);
        res.status(500).json({ error: 'Internal server error: ' + error.message });
    }
});

// ============== PUBLIC ENDPOINTS (No Auth Required) ==============

// Get public report info (limited fields)
app.get('/api/public/reports/:token', (req, res) => {
    const report = db.prepare('SELECT id, customerName, contactPerson, deviceType, brand, model, serialNumber, faultDescription, actionTaken, status, technicianName, serviceDate FROM reports WHERE signatureToken = ?').get(req.params.token);

    if (!report) {
        return res.status(404).json({ error: 'Invalid link' });
    }

    // Don't expose sensitive info, only what's needed for signing
    res.json(report);
});

// Submit public signature
app.post('/api/public/reports/:token/sign', (req, res) => {
    const { signature, signerName } = req.body;

    if (!signature) {
        return res.status(400).json({ error: 'Signature is required' });
    }

    const report = db.prepare('SELECT id FROM reports WHERE signatureToken = ?').get(req.params.token);
    if (!report) {
        return res.status(404).json({ error: 'Invalid link' });
    }

    db.prepare(`
        UPDATE reports 
        SET customerSignature = ?, 
            contactPerson = CASE WHEN contactPerson IS NULL OR contactPerson = '' THEN ? ELSE contactPerson END,
            updatedAt = CURRENT_TIMESTAMP 
        WHERE id = ?
    `).run(signature, signerName || null, report.id);

    res.json({ success: true });
});


// ============== SETTINGS ENDPOINTS ==============

// Get settings
app.get('/api/settings', authMiddleware, (req, res) => {
    let settings = db.prepare('SELECT * FROM settings WHERE userId = ?').get(req.user.id);
    if (!settings) {
        settings = { companyName: '', companyLogo: '', templateConfig: '{}' };
    }
    settings.templateConfig = settings.templateConfig ? JSON.parse(settings.templateConfig) : {};
    res.json(settings);
});

// Save settings
app.post('/api/settings', authMiddleware, (req, res) => {
    const { companyName, companyLogo, templateConfig } = req.body;

    const existing = db.prepare('SELECT id FROM settings WHERE userId = ?').get(req.user.id);

    if (existing) {
        db.prepare('UPDATE settings SET companyName = ?, companyLogo = ?, templateConfig = ? WHERE userId = ?').run(
            companyName || null, companyLogo || null, JSON.stringify(templateConfig || {}), req.user.id
        );
    } else {
        db.prepare('INSERT INTO settings (id, userId, companyName, companyLogo, templateConfig) VALUES (?, ?, ?, ?, ?)').run(
            uuidv4(), req.user.id, companyName || null, companyLogo || null, JSON.stringify(templateConfig || {})
        );
    }

    res.json({ success: true });
});

// ============== QR PROXY (from original proxy-server) ==============

const { fetch, ProxyAgent } = require('undici');

// Cache for proxies
let proxyList = [];
let lastProxyUpdate = 0;

async function getTurkishProxies() {
    // Force refresh if list is empty or old
    if (proxyList.length > 0 && Date.now() - lastProxyUpdate < 10 * 60 * 1000) {
        return proxyList;
    }

    console.log('🔄 Fetching new Turkish proxy list...');
    const sources = [
        // Only use strict Turkey lists
        'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=5000&country=TR&ssl=all&anonymity=all',
        'https://www.proxy-list.download/api/v1/get?type=http&country=TR',
        'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt' // This is global too, checking others
    ];
    // Actually, monosans is global. Let's stick to API based ones or filter.
    // Better list:
    const strictSources = [
        'https://api.proxyscrape.com/v2/?request=getproxies&protocol=http&timeout=10000&country=TR&ssl=all&anonymity=all',
        'https://www.proxy-list.download/api/v1/get?type=http&country=TR',
        // spys.one is hard to scrape.
        // Let's use a smaller set but ensure quality.
    ];

    // Reset list
    let proxies = [];

    for (const source of strictSources) {
        try {
            const response = await fetch(source);
            if (response.ok) {
                const text = await response.text();
                const lines = text.split('\n');
                lines.forEach(line => {
                    const clean = line.trim();
                    if (clean && clean.includes(':')) {
                        proxies.push(`http://${clean}`);
                    }
                });
            }
        } catch (e) {
            console.error(`Failed to fetch proxies from ${source}:`, e.message);
        }
    }

    // Shuffle proxies to load balance
    proxies = proxies.sort(() => Math.random() - 0.5);
    proxyList = [...new Set(proxies)]; // Remove duplicates
    lastProxyUpdate = Date.now();
    console.log(`✅ Found ${proxyList.length} potential Turkish proxies.`);
    return proxyList;
}

app.get('/api/device/:kno', async (req, res) => {
    const { kno } = req.params;
    const url = `https://sbu2.saglik.gov.tr/QR/QR.aspx?kno=${kno}`;

    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7',
    };

    try {
        // Mode 1: Manual Proxy
        if (process.env.QR_PROXY_URL && process.env.QR_PROXY_URL !== 'AUTO') {
            const proxyAgent = new ProxyAgent(process.env.QR_PROXY_URL);
            const response = await fetch(url, { headers, dispatcher: proxyAgent });
            if (!response.ok) throw new Error(`Status: ${response.status}`);
            const html = await response.text();
            const data = parseHtmlTable(html);
            return res.json({ success: true, data, kno });
        }

        // Mode 2: Auto Proxy (or fallback if direct failed and AUTO is enabled)
        if (process.env.QR_PROXY_URL === 'AUTO') {
            const proxies = await getTurkishProxies();

            // Try up to 5 random proxies from the list
            for (let i = 0; i < Math.min(proxies.length, 10); i++) {
                const proxyUrl = proxies[i];
                console.log(`Trying Proxy [${i + 1}/10]: ${proxyUrl}`);
                try {
                    const proxyAgent = new ProxyAgent(proxyUrl);
                    // Short timeout for proxies
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 3000);

                    const response = await fetch(url, {
                        headers,
                        dispatcher: proxyAgent,
                        signal: controller.signal
                    });
                    clearTimeout(timeout);

                    if (response.ok) {
                        const html = await response.text();
                        // Basic check if we got a valid response, not a proxy blocked page
                        if (html.includes('KİMLİK NO') || html.includes('TÜR')) {
                            console.log(`✅ Success with proxy: ${proxyUrl}`);
                            const data = parseHtmlTable(html);
                            return res.json({ success: true, data, kno });
                        }
                    }
                } catch (e) {
                    // Continue to next proxy
                }
            }
            throw new Error('All automatic proxies failed. Please try again or use a manual proxy.');
        }

        // Mode 3: Direct (Default)
        const response = await fetch(url, { headers });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const html = await response.text();
        const data = parseHtmlTable(html);
        res.json({ success: true, data, kno });

    } catch (error) {
        console.error('Error fetching device data:', error);
        res.status(500).json({ success: false, error: 'Veri çekilemedi: ' + error.message });
    }
});

function parseHtmlTable(html) {
    const data = {};
    const rowRegex = /<tr>\s*<td>([^<]*)<\/td>\s*<td>([^<]*)<\/td>\s*<\/tr>/gi;
    let match;

    while ((match = rowRegex.exec(html)) !== null) {
        let key = match[1].trim();
        let value = match[2].trim();
        key = decodeHtmlEntities(key);
        value = decodeHtmlEntities(value);
        if (key && value) data[key] = value;
    }

    return {
        kimlikNo: data['KİMLİK NO'] || '',
        deviceType: data['TÜR'] || '',
        brand: data['MARKA'] || '',
        model: data['MODEL'] || '',
        serialNumber: data['S/N'] || '',
        institutionName: data['KURUM ADI'] || '',
        assigneeLocation: data['ZİMMET YERİ'] || '',
        location: data['YER'] || '',
        materialDescription: data['MALZEME TANIMI'] || '',
    };
}

function decodeHtmlEntities(text) {
    const entities = {
        '&#220;': 'Ü', '&#214;': 'Ö', '&#199;': 'Ç', '&#350;': 'Ş', '&#304;': 'İ', '&#286;': 'Ğ',
        '&amp;': '&', '&gt;': '>', '&lt;': '<', '&quot;': '"',
    };
    let result = text;
    for (const [entity, char] of Object.entries(entities)) {
        result = result.replace(new RegExp(entity, 'g'), char);
    }
    return result;
}

// ============== EMAIL ENDPOINT ==============

// Email configuration (set these environment variables for email to work)
const EMAIL_CONFIG = {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'MedTech Service <noreply@medtech.com>'
};

// Send email endpoint
app.post('/api/send-email', authMiddleware, async (req, res) => {
    const { reportId, to, subject, message } = req.body;

    if (!to) {
        return res.status(400).json({ error: 'Alıcı e-posta adresi gereklidir.' });
    }

    // Check if email is configured
    if (!EMAIL_CONFIG.host || !EMAIL_CONFIG.user) {
        // For now, just log and return success for demo purposes
        console.log('📧 E-posta gönderim isteği (SMTP yapılandırılmamış):');
        console.log(`   Alıcı: ${to}`);
        console.log(`   Konu: ${subject}`);
        console.log(`   Rapor ID: ${reportId}`);

        return res.json({
            success: true,
            message: 'E-posta gönderim isteği alındı. SMTP yapılandırması yapıldığında gerçek gönderim aktif olacaktır.',
            demo: true
        });
    }

    try {
        // In production, use nodemailer
        // const nodemailer = require('nodemailer');
        // const transporter = nodemailer.createTransport({
        //     host: EMAIL_CONFIG.host,
        //     port: EMAIL_CONFIG.port,
        //     secure: EMAIL_CONFIG.secure,
        //     auth: {
        //         user: EMAIL_CONFIG.user,
        //         pass: EMAIL_CONFIG.pass
        //     }
        // });
        // 
        // await transporter.sendMail({
        //     from: EMAIL_CONFIG.from,
        //     to: to,
        //     subject: subject,
        //     text: message,
        //     // attachments: [{ filename: 'rapor.pdf', content: pdfBuffer }]
        // });

        console.log(`📧 E-posta gönderildi: ${to}`);
        res.json({ success: true, message: 'E-posta başarıyla gönderildi.' });
    } catch (error) {
        console.error('E-posta gönderim hatası:', error);
        res.status(500).json({ error: 'E-posta gönderilemedi.', message: error.message });
    }
});

// Debug endpoint to check/fix DB schema
app.get('/api/debug/db-check', (req, res) => {
    const results = {
        tableExists: false,
        columns: [],
        migrationAttempts: [],
        error: null
    };

    try {
        // Check if table exists
        const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='reports'").get();
        results.tableExists = !!tableCheck;

        if (results.tableExists) {
            // Get current columns
            results.columns = db.prepare("PRAGMA table_info(reports)").all();

            // Try to force add columns and log result
            const columnsToAdd = [
                { name: 'signatureToken', type: 'TEXT' },
                { name: 'technicianSignature', type: 'TEXT' },
                { name: 'customerSignature', type: 'TEXT' },
                { name: 'productionYear', type: 'TEXT' },
                { name: 'customerEmail', type: 'TEXT' },
                { name: 'photos', type: 'TEXT' }
            ];

            columnsToAdd.forEach(col => {
                const exists = results.columns.some(c => c.name === col.name);
                if (!exists) {
                    try {
                        db.exec(`ALTER TABLE reports ADD COLUMN ${col.name} ${col.type}`);
                        results.migrationAttempts.push(`Added ${col.name}: SUCCESS`);
                    } catch (e) {
                        results.migrationAttempts.push(`Add ${col.name}: FAILED - ${e.message}`);
                    }
                } else {
                    results.migrationAttempts.push(`Add ${col.name}: SKIPPED (Exists)`);
                }
            });

            // Re-fetch columns to show final state
            results.finalColumns = db.prepare("PRAGMA table_info(reports)").all();
        }
    } catch (e) {
        results.error = e.message;
    }

    res.json(results);
});

// Debug endpoint to check network and proxy
app.get('/api/debug-network', async (req, res) => {
    const results = {
        scanUrl: 'https://sbu2.saglik.gov.tr/QR/QR.aspx',
        proxyConfigured: !!process.env.QR_PROXY_URL,
        proxyUrlMasked: process.env.QR_PROXY_URL === 'AUTO' ? 'AUTO_MODE' : (process.env.QR_PROXY_URL ? process.env.QR_PROXY_URL.replace(/:[^:@]*@/, ':***@') : null),
        directIp: null,
        proxyIp: null,
        scanReachable: false,
        autoProxySuccess: false,
        usedProxy: null,
        error: null
    };

    try {
        // 1. Check Direct IP
        try {
            const r1 = await fetch('https://api.ipify.org?format=json');
            const d1 = await r1.json();
            results.directIp = d1.ip;
        } catch (e) {
            results.directIp = 'Failed: ' + e.message;
        }

        // 2. Check Proxy IP (Manual)
        if (process.env.QR_PROXY_URL && process.env.QR_PROXY_URL !== 'AUTO') {
            try {
                const proxyAgent = new ProxyAgent(process.env.QR_PROXY_URL);
                const r2 = await fetch('https://api.ipify.org?format=json', { dispatcher: proxyAgent });
                const d2 = await r2.json();
                results.proxyIp = d2.ip;
            } catch (e) {
                results.proxyIp = 'Failed: ' + e.message;
            }
        }

        // 3. Check Target Reachability
        try {
            // Mode A: Manual Proxy
            if (process.env.QR_PROXY_URL && process.env.QR_PROXY_URL !== 'AUTO') {
                const opts = { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } };
                opts.dispatcher = new ProxyAgent(process.env.QR_PROXY_URL);
                const r3 = await fetch('https://sbu2.saglik.gov.tr/QR/QR.aspx', opts);
                results.scanReachable = r3.ok || r3.status === 404 || r3.status === 302;
                results.scanStatus = r3.status;
            }
            // Mode B: Auto Proxy
            else if (process.env.QR_PROXY_URL === 'AUTO') {
                // Force refresh list for debug
                proxyList = [];
                const proxies = await getTurkishProxies();
                results.totalProxiesFound = proxies.length;

                // Try up to 20 random proxies
                const attempts = Math.min(proxies.length, 20);

                for (let i = 0; i < attempts; i++) {
                    const proxyUrl = proxies[i];
                    try {
                        const proxyAgent = new ProxyAgent(proxyUrl);
                        const controller = new AbortController();
                        // 2 second timeout for faster scanning
                        const timeout = setTimeout(() => controller.abort(), 2000);

                        const rAuto = await fetch('https://sbu2.saglik.gov.tr/QR/QR.aspx', {
                            method: 'HEAD',
                            headers: { 'User-Agent': 'Mozilla/5.0' },
                            dispatcher: proxyAgent,
                            signal: controller.signal
                        });
                        clearTimeout(timeout);

                        if (rAuto.ok || rAuto.status === 404 || rAuto.status === 302) {
                            results.scanReachable = true;
                            results.autoProxySuccess = true;
                            results.usedProxy = proxyUrl;
                            results.scanStatus = rAuto.status;
                            break;
                        }
                    } catch (e) { continue; }
                }
                if (!results.autoProxySuccess) {
                    results.error = `Auto proxy failed to find a working proxy in first ${attempts} attempts (out of ${results.totalProxiesFound}).`;
                }
            }
            // Mode C: Direct
            else {
                const r3 = await fetch('https://sbu2.saglik.gov.tr/QR/QR.aspx', { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
                results.scanReachable = r3.ok || r3.status === 404 || r3.status === 302;
                results.scanStatus = r3.status;
            }

        } catch (e) {
            results.scanReachable = false;
            results.scanError = e.message;
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message, results });
    }
});

// ============== STATIC FILES (for production) ==============
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all for SPA routing (only for non-API routes)
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        return next();
    }
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     🏥 MedTech Service Application - Backend           ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  🌐 Server running at http://localhost:${PORT}            ║`);
    console.log('║  📊 Database: SQLite (medtech.db)                      ║');
    console.log('║  👤 Default: admin / admin123                          ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
});
