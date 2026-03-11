const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

let workspaces = [];
let domainStatus = {}; // { domain: 'allowed' | 'not_reviewed' | 'not_allowed' }
const TEMPLATES_PATH = path.join(__dirname, 'templates.json');

// Load templates from disk or use defaults
const loadTemplates = () => {
    try {
        if (fs.existsSync(TEMPLATES_PATH)) {
            const data = fs.readFileSync(TEMPLATES_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error reading templates.json:', err);
    }
    return {
        not_reviewed: "Dear User,\n\nPlease review these new domains for [Workspace]: [Domains].",
        not_allowed: "Dear User,\n\nThe following domains in your workspace ([Workspace]) are NOT ALLOWED: [Domains]."
    };
};

// Initial templates
let templates = loadTemplates();

// Load CSV data
const loadCSV = () => {
    const results = [];
    fs.createReadStream(path.join(__dirname, '../workspaces.csv'))
        .pipe(csv())
        .on('data', (data) => {
            const domains = data.domains ? data.domains.split(';').filter(d => d.trim() !== '') : [];
            results.push({
                workspace: data.workspace,
                accountable: data.accountable,
                privilegedMembers: data['privileged members'] ? data['privileged members'].split(';') : [],
                domains: domains
            });

            // Initialize domains to 'not_reviewed' if not already set
            domains.forEach(domain => {
                if (!domainStatus[domain]) {
                    domainStatus[domain] = 'not_reviewed';
                }
            });
        })
        .on('end', () => {
            workspaces = results;
            console.log('CSV data loaded successfully');
        });
};

loadCSV();

// Get current state
app.get('/api/state', (req, res) => {
    res.json({
        domainStatus,
        workspaces,
        templates
    });
});

// Update domain status
app.post('/api/domains/status', (req, res) => {
    const { domain, status } = req.body;
    if (domain && ['allowed', 'not_reviewed', 'not_allowed'].includes(status)) {
        domainStatus[domain] = status;
        res.json({ success: true, domain, status });
    } else {
        res.status(400).json({ error: 'Invalid domain or status' });
    }
});

// Update templates
app.post('/api/templates', (req, res) => {
    const { not_reviewed, not_allowed } = req.body;
    if (not_reviewed) templates.not_reviewed = not_reviewed;
    if (not_allowed) templates.not_allowed = not_allowed;
    
    try {
        fs.writeFileSync(TEMPLATES_PATH, JSON.stringify(templates, null, 2));
        res.json({ success: true, templates });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save templates' });
    }
});

// Refresh now - repopulates not_reviewed
app.post('/api/refresh', (req, res) => {
    loadCSV();
    res.json({ success: true, message: 'Data refreshed' });
});

// Get email mockup
app.get('/api/email-mockup', (req, res) => {
    const { type } = req.query; // 'not_reviewed' or 'not_allowed'
    if (workspaces.length === 0) return res.status(404).json({ error: 'No workspaces loaded' });
    
    const relevantDomains = Object.entries(domainStatus)
        .filter(([_, status]) => status === type)
        .map(([domain]) => domain);
    
    const filteredWorkspaces = workspaces.filter(ws => ws.domains.some(d => relevantDomains.includes(d)));
    
    if (filteredWorkspaces.length === 0) {
        return res.status(404).json({ error: `No workspaces found with ${type.replace('_', ' ')} domains` });
    }

    const randomWS = filteredWorkspaces[Math.floor(Math.random() * filteredWorkspaces.length)];
    const wsDomainsOfType = randomWS.domains.filter(d => relevantDomains.includes(d));

    const subject = type === 'not_reviewed' 
        ? `Domain review needed for ${randomWS.workspace}` 
        : `Access DENIED for domains in ${randomWS.workspace}`;

    // Use persistent templates
    let bodyTemplate = templates[type] || templates.not_reviewed;
    const body = bodyTemplate
        .replace(/\[Workspace\]/g, randomWS.workspace)
        .replace(/\[Domains\]/g, wsDomainsOfType.join(', '));

    res.json({
        to: randomWS.accountable,
        subject: subject,
        body: body
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
