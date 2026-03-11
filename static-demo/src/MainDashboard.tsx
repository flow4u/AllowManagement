import { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Divider,
  AppBar,
  Toolbar,
  Chip,
  Stack,
  Tooltip,
  InputAdornment
} from '@mui/material';
import { 
  ArrowForward, 
  ArrowBack, 
  Download, 
  Email, 
  Refresh, 
  Send,
  Add,
  DeleteOutline,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  Edit
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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

interface Props {
  workspaces: Workspace[];
  domainStatus: DomainStatusMap;
  templates: Templates;
  updateStatus: (domain: string, status: string) => void;
  handleRefresh: () => void;
  handleSaveTemplate: (type: 'not_reviewed' | 'not_allowed', content: string) => void;
  emailMonths: number;
  setEmailMonths: (val: number) => void;
}

export default function MainDashboard({ 
  workspaces, 
  domainStatus, 
  templates, 
  updateStatus, 
  handleRefresh, 
  handleSaveTemplate,
  emailMonths,
  setEmailMonths
}: Props) {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<'allowed' | 'not_reviewed' | 'not_allowed' | null>(null);
  const [newDomain, setNewDomain] = useState({ allowed: '', not_allowed: '' });
  const [editingTemplate, setEditingTemplate] = useState('');
  
  const [relevantWorkspaces, setRelevantWorkspaces] = useState<Workspace[]>([]);
  const [mockupIndex, setMockupIndex] = useState(0);
  const [mockupType, setMockupType] = useState<'not_reviewed' | 'not_allowed' | null>(null);

  const handleAddManualDomain = async (status: 'allowed' | 'not_allowed') => {
    const domain = newDomain[status].trim();
    if (!domain) return;
    updateStatus(domain, status);
    setNewDomain(prev => ({ ...prev, [status]: '' }));
  };

  const handlePrepareMockups = (type: 'not_reviewed' | 'not_allowed') => {
    const domainsOfType = Object.entries(domainStatus)
      .filter(([_, status]) => status === type)
      .map(([domain]) => domain);
    
    const filtered = workspaces.filter(ws => ws.domains.some(d => domainsOfType.includes(d)));
    
    if (filtered.length === 0) {
      alert(`No workspaces found with ${type.replace('_', ' ')} domains`);
      return;
    }

    setRelevantWorkspaces(filtered);
    setMockupIndex(0);
    setMockupType(type);
    setOpenDialog('sendNow');
  };

  const generateMockupContent = () => {
    if (!mockupType || relevantWorkspaces.length === 0) return null;
    
    const ws = relevantWorkspaces[mockupIndex];
    const domainsOfType = Object.entries(domainStatus)
      .filter(([_, status]) => status === mockupType)
      .map(([domain]) => domain);
    
    const wsDomainsOfType = ws.domains.filter((d: string) => domainsOfType.includes(d));
    
    const subject = mockupType === 'not_reviewed' 
      ? `Domain review needed for ${ws.workspace}` 
      : `Access DENIED for domains in ${ws.workspace}`;

    const bodyTemplate = templates[mockupType];
    const body = bodyTemplate
      .replace(/\[Workspace\]/g, ws.workspace)
      .replace(/\[Domains\]/g, wsDomainsOfType.join(', '));

    return {
      to: ws.accountable,
      subject,
      body
    };
  };

  const getFilteredWorkspacesByColumn = (status: string) => {
    const domainsInColumn = Object.entries(domainStatus)
      .filter(([_, s]) => s === status)
      .map(([d]) => d);
    
    return workspaces.filter(ws => ws.domains.some(d => domainsInColumn.includes(d)));
  };

  const renderColumn = (title: string, status: 'allowed' | 'not_reviewed' | 'not_allowed') => {
    const domains = Object.entries(domainStatus)
      .filter(([_, s]) => s === status)
      .map(([d]) => d);

    return (
      <Paper elevation={0} sx={{ height: '75vh', display: 'flex', flexDirection: 'column', bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center" borderBottom="1px solid rgba(255,255,255,0.1)">
          <Typography variant="h6" color="primary">{title}</Typography>
          <Tooltip title={`Download workspaces with ${title} domains`}>
            <IconButton size="small" onClick={() => { setSelectedColumn(status); setOpenDialog('download'); }} color="secondary">
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {status !== 'not_reviewed' && (
          <Box p={2} borderBottom="1px solid rgba(255,255,255,0.05)">
            <TextField
              fullWidth
              size="small"
              placeholder="Add domain manually..."
              value={newDomain[status as 'allowed' | 'not_allowed']}
              onChange={(e) => setNewDomain((prev: any) => ({ ...prev, [status]: e.target.value }))}
              onKeyPress={(e: any) => e.key === 'Enter' && handleAddManualDomain(status as 'allowed' | 'not_allowed')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleAddManualDomain(status as 'allowed' | 'not_allowed')}>
                      <Add fontSize="small" color="primary" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'rgba(255,255,255,0.02)' } }}
            />
          </Box>
        )}

        <List sx={{ flexGrow: 1, overflow: 'auto' }}>
          {domains.map(domain => (
            <ListItem 
              key={domain} 
              divider 
              sx={{ 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                transition: 'background-color 0.2s'
              }}
            >
              <ListItemText primary={domain} />
              <Box>
                {status !== 'allowed' && (
                  <IconButton title="Move to Allowed" size="small" onClick={() => updateStatus(domain, 'allowed')}>
                    <ArrowBack fontSize="small" />
                  </IconButton>
                )}
                {status !== 'not_reviewed' && (
                  <IconButton title="Remove status" size="small" onClick={() => updateStatus(domain, 'not_reviewed')}>
                    <DeleteOutline fontSize="small" sx={{ opacity: 0.5 }} />
                  </IconButton>
                )}
                {status !== 'not_allowed' && (
                  <IconButton title="Move to Not Allowed" size="small" onClick={() => updateStatus(domain, 'not_allowed')}>
                    <ArrowForward fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </ListItem>
          ))}
        </List>

        {(status === 'not_reviewed' || status === 'not_allowed') && (
          <Box p={2} borderTop="1px solid rgba(255,255,255,0.1)" display="flex" gap={1}>
            <Button size="small" variant="outlined" startIcon={<Email />} sx={{ flex: 1 }} onClick={() => { setEditingTemplate(templates[status]); setOpenDialog(status === 'not_reviewed' ? 'templateNR' : 'templateNA'); }}>Template</Button>
            <Button size="small" variant="contained" startIcon={<Send />} sx={{ flex: 1 }} onClick={() => handlePrepareMockups(status)}>Send Now</Button>
          </Box>
        )}
      </Paper>
    );
  };

  const activeMockup = generateMockupContent();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h5" color="primary" sx={{ fontWeight: 800 }}>AllowManagement (Static Demo)</Typography>
          <Box display="flex" alignItems="center" gap={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body2" color="textSecondary">Send emails each</Typography>
              <TextField 
                size="small" 
                type="number" 
                value={emailMonths} 
                onChange={(e) => setEmailMonths(Number(e.target.value))}
                sx={{ width: 65, '& .MuiOutlinedInput-input': { py: 0.5 } }}
              />
              <Typography variant="body2" color="textSecondary">months</Typography>
            </Box>
            <Tooltip title="Reset demo (clears local storage)">
              <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} size="small">Reset Demo</Button>
            </Tooltip>
            <Button 
                variant="contained" 
                color="secondary" 
                startIcon={<Edit />} 
                onClick={() => navigate('/edit-domains')}
                size="small"
                sx={{ 
                  borderRadius: 2,
                  px: 2,
                  boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(0,118,255,0.23)',
                  }
                }}
            >
                Edit Domains View
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, flexGrow: 1, pb: 4 }}>
        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            {renderColumn('<domains allowed>', 'allowed')}
          </Box>
          <Box sx={{ flex: 1 }}>
            {renderColumn('<all domains not reviewed>', 'not_reviewed')}
          </Box>
          <Box sx={{ flex: 1 }}>
            {renderColumn('<domains not allowed>', 'not_allowed')}
          </Box>
        </Box>
      </Container>

      {/* Dialogs */}
      <Dialog open={!!openDialog} onClose={() => setOpenDialog(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ bgcolor: 'background.paper', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            {openDialog === 'download' && `Workspaces with <${selectedColumn?.replace('_', ' ')}> domains`}
            {openDialog?.startsWith('template') && 'Email Template Configuration'}
            {openDialog === 'sendNow' && 'Email Mockup Preview'}
          </Box>
          {openDialog === 'sendNow' && relevantWorkspaces.length > 1 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="caption" color="textSecondary">
                {mockupIndex + 1} of {relevantWorkspaces.length}
              </Typography>
              <IconButton size="small" onClick={() => setMockupIndex(prev => (prev > 0 ? prev - 1 : relevantWorkspaces.length - 1))}>
                <KeyboardArrowLeft />
              </IconButton>
              <IconButton size="small" onClick={() => setMockupIndex(prev => (prev < relevantWorkspaces.length - 1 ? prev + 1 : 0))}>
                <KeyboardArrowRight />
              </IconButton>
            </Stack>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: 'background.default' }}>
          {openDialog === 'download' && selectedColumn && (
            <List>
              {getFilteredWorkspacesByColumn(selectedColumn).map(ws => (
                <ListItem key={ws.workspace} sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1 }}>
                  <ListItemText 
                    primary={ws.workspace} 
                    secondary={
                      <Box component="span">
                        <Typography variant="body2" color="secondary" display="block">Owner: {ws.accountable}</Typography>
                        <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                          {ws.domains.filter(d => domainStatus[d] === selectedColumn).map(d => (
                            <Chip key={d} label={d} size="small" variant="outlined" sx={{ mb: 0.5 }} />
                          ))}
                        </Stack>
                      </Box>
                    } 
                  />
                </ListItem>
              ))}
            </List>
          )}
          {openDialog?.startsWith('template') && (
            <Box>
              <Typography variant="subtitle2" color="secondary" gutterBottom>
                Configuring template for: {openDialog === 'templateNR' ? 'NOT REVIEWED' : 'NOT ALLOWED'} domains
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                Variables: [Workspace], [Domains]
              </Typography>
              <TextField 
                fullWidth 
                multiline 
                rows={6} 
                value={editingTemplate}
                onChange={(e) => setEditingTemplate(e.target.value)}
                sx={{ fontFamily: 'monospace' }}
              />
            </Box>
          )}
          {openDialog === 'sendNow' && activeMockup && (
            <Box p={2}>
              <Box display="flex" flexDirection="column" gap={1} mb={3}>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>To:</Typography>
                <Typography variant="body1" color="primary">{activeMockup.to}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.7 }}>Subject:</Typography>
                <Typography variant="body1" color="primary">{activeMockup.subject}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Paper sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.2)', minHeight: 150 }}>
                <Typography sx={{ whiteSpace: 'pre-line', fontFamily: 'monospace' }}>{activeMockup.body}</Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Button onClick={() => setOpenDialog(null)} color="inherit">Close</Button>
          {openDialog?.startsWith('template') && (
            <Button variant="contained" onClick={() => handleSaveTemplate(openDialog === 'templateNR' ? 'not_reviewed' : 'not_allowed', editingTemplate)}>Save Template</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
