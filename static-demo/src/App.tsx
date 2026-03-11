import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import MainDashboard from './MainDashboard';
import EditDomainsView from './EditDomainsView';
import Papa from 'papaparse';

interface Workspace {
  workspace: string;
  accountable: string;
  privilegedMembers: string[];
  domains: string[];
}

interface DomainStatusMap {
  [domain: string]: 'allowed' | 'not_reviewed' | 'not_allowed';
}

interface Templates {
  not_reviewed: string;
  not_allowed: string;
}

const STORAGE_KEYS = {
  DOMAIN_STATUS: 'allow_mgmt_domain_status',
  TEMPLATES: 'allow_mgmt_templates',
};

function App() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [domainStatus, setDomainStatus] = useState<DomainStatusMap>({});
  const [templates, setTemplates] = useState<Templates>({ not_reviewed: '', not_allowed: '' });
  const [emailMonths, setEmailMonths] = useState(6);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 1. Load CSV
        const baseUrl = import.meta.env.BASE_URL.endsWith('/') 
          ? import.meta.env.BASE_URL 
          : `${import.meta.env.BASE_URL}/`;
        const csvResponse = await fetch(`${baseUrl}workspaces.csv`);
        const csvText = await csvResponse.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsedWorkspaces: Workspace[] = (results.data as any[]).map((row: any) => ({
              workspace: row.workspace || '',
              accountable: row.accountable || '',
              privilegedMembers: row['privileged members']?.split(';').map((s: string) => s.trim()) || [],
              domains: row.domains?.split(';').map((s: string) => s.trim()) || [],
            }));
            setWorkspaces(parsedWorkspaces);

            // 2. Load/Init Domain Status
            const savedStatus = localStorage.getItem(STORAGE_KEYS.DOMAIN_STATUS);
            if (savedStatus) {
              setDomainStatus(JSON.parse(savedStatus));
            } else {
              // Initialize with all unique domains as 'not_reviewed'
              const allDomains = new Set<string>();
              parsedWorkspaces.forEach(ws => ws.domains.forEach(d => allDomains.add(d)));
              const initialStatus: DomainStatusMap = {};
              allDomains.forEach(d => initialStatus[d] = 'not_reviewed');
              setDomainStatus(initialStatus);
              localStorage.setItem(STORAGE_KEYS.DOMAIN_STATUS, JSON.stringify(initialStatus));
            }
          }
        });

        // 3. Load Templates
        const savedTemplates = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
        if (savedTemplates) {
          setTemplates(JSON.parse(savedTemplates));
        } else {
          // Fetch defaults if not in localStorage
          const templateResponse = await fetch(`${baseUrl}template-defaults.json`);
          const defaultTemplates = await templateResponse.json();
          setTemplates(defaultTemplates);
          localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(defaultTemplates));
        }

      } catch (err) {
        console.error('Error initializing app:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const updateStatus = (domain: string, status: string) => {
    const newStatus = { ...domainStatus, [domain]: status as any };
    setDomainStatus(newStatus);
    localStorage.setItem(STORAGE_KEYS.DOMAIN_STATUS, JSON.stringify(newStatus));
  };

  const handleRefresh = async () => {
    // For static demo, refresh just clears localStorage and re-parses CSV
    localStorage.removeItem(STORAGE_KEYS.DOMAIN_STATUS);
    window.location.reload();
  };

  const handleSaveTemplate = (type: 'not_reviewed' | 'not_allowed', content: string) => {
    const updated = { ...templates, [type]: content };
    setTemplates(updated);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(updated));
  };

  if (isLoading) return null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route 
            path="/" 
            element={
              <MainDashboard 
                workspaces={workspaces}
                domainStatus={domainStatus}
                templates={templates}
                updateStatus={updateStatus}
                handleRefresh={handleRefresh}
                handleSaveTemplate={handleSaveTemplate}
                emailMonths={emailMonths}
                setEmailMonths={setEmailMonths}
              />
            } 
          />
          <Route 
            path="/edit-domains" 
            element={
              <EditDomainsView 
                workspaces={workspaces}
                domainStatus={domainStatus}
              />
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
