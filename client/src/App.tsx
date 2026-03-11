import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import axios from 'axios';
import MainDashboard from './MainDashboard';
import EditDomainsView from './EditDomainsView';

const API_BASE = 'http://localhost:5000/api';

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

function App() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [domainStatus, setDomainStatus] = useState<DomainStatusMap>({});
  const [templates, setTemplates] = useState<Templates>({ not_reviewed: '', not_allowed: '' });
  const [emailMonths, setEmailMonths] = useState(6);

  useEffect(() => {
    fetchState();
  }, []);

  const fetchState = async () => {
    try {
      const res = await axios.get(`${API_BASE}/state`);
      setWorkspaces(res.data.workspaces);
      setDomainStatus(res.data.domainStatus);
      setTemplates(res.data.templates);
    } catch (err) {
      console.error('Error fetching state:', err);
    }
  };

  const updateStatus = async (domain: string, status: string) => {
    try {
      await axios.post(`${API_BASE}/domains/status`, { domain, status });
      setDomainStatus(prev => ({ ...prev, [domain]: status as any }));
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleRefresh = async () => {
    await axios.post(`${API_BASE}/refresh`);
    fetchState();
  };

  const handleSaveTemplate = async (type: 'not_reviewed' | 'not_allowed', content: string) => {
    try {
      const updated = { ...templates, [type]: content };
      await axios.post(`${API_BASE}/templates`, updated);
      setTemplates(updated);
    } catch (err) {
      console.error('Failed to save template:', err);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={
              <MainDashboard 
                workspaces={workspaces}
                domainStatus={domainStatus}
                templates={templates}
                fetchState={fetchState}
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
