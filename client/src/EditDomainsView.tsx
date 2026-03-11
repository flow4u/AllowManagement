import { useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Paper, 
  Checkbox, 
  FormControlLabel, 
  Button, 
  Stack,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  Close, 
  InfoOutlined, 
  WarningAmber, 
  KeyboardArrowLeft, 
  KeyboardArrowRight 
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

interface Props {
  workspaces: Workspace[];
  domainStatus: DomainStatusMap;
}

export default function EditDomainsView({ workspaces, domainStatus }: Props) {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [agreed, setAgreed] = useState(false);

  const currentWS = workspaces[index];

  const handleNext = () => setIndex(prev => (prev < workspaces.length - 1 ? prev + 1 : 0));
  const handlePrev = () => setIndex(prev => (prev > 0 ? prev - 1 : workspaces.length - 1));

  const getDomainColor = (domain: string) => {
    const status = domainStatus[domain];
    if (status === 'allowed') return '#4caf50'; // Green
    if (status === 'not_allowed') return '#f44336'; // Red
    return '#ff9800'; // Orange (not reviewed)
  };

  if (!currentWS) return null;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: '#0a101f', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      p: 4
    }}>
      <Paper elevation={24} sx={{ 
        width: '100%', 
        maxWidth: 600, 
        bgcolor: '#161d31', 
        color: '#fff',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Header */}
        <Box px={3} py={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>Edit Domain(s)</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
                Record {index + 1} of {workspaces.length}
            </Typography>
            <IconButton size="small" onClick={handlePrev} sx={{ color: '#fff' }}>
                <KeyboardArrowLeft fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={handleNext} sx={{ color: '#fff' }}>
                <KeyboardArrowRight fontSize="small" />
            </IconButton>
            <IconButton onClick={() => navigate('/')} sx={{ color: '#fff', ml: 1 }}>
                <Close />
            </IconButton>
          </Box>
        </Box>

        <Box p={3} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Info Box */}
          <Box sx={{ 
            bgcolor: 'rgba(40, 48, 70, 0.6)', 
            p: 2, 
            borderRadius: 2, 
            border: '1px solid rgba(255,255,255,0.05)' 
          }}>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: '0.85rem', color: '#b4b7bd' }}>
              <li>Mandatory domain(s), as listed on the main screen are not open to user updates.</li>
              <li>Please enter the domain(s) to be allowlisted below. Click <span style={{ color: '#7367f0', cursor: 'pointer' }}>here</span> for instructions and the list of known applications including required configuration for specific software.</li>
            </ul>
          </Box>

          {/* Workspace Info */}
          <Box>
            <Typography variant="caption" sx={{ color: '#b4b7bd', mb: 1, display: 'block' }}>Workspace</Typography>
            <Typography variant="body1" fontWeight={600} color="primary">{currentWS.workspace}</Typography>
          </Box>

          {/* Website(s) Section */}
          <Box>
            <Typography variant="caption" sx={{ color: '#b4b7bd', mb: 1, display: 'block' }}>Website(s)</Typography>
            <Box sx={{ 
              bgcolor: '#161d31', 
              border: '1px solid rgba(255,255,255,0.3)', 
              borderRadius: 1,
              p: 2,
              minHeight: 200,
              fontFamily: 'monospace',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5
            }}>
              {currentWS.domains.map(domain => (
                <Typography 
                   key={domain} 
                   sx={{ 
                     color: getDomainColor(domain),
                     fontSize: '0.95rem'
                   }}
                >
                  {domain}
                </Typography>
              ))}
            </Box>
          </Box>

          {/* Warning Box */}
          <Box sx={{ 
            bgcolor: 'rgba(255, 159, 67, 0.12)', 
            p: 2, 
            borderRadius: 1, 
            display: 'flex', 
            gap: 2,
            alignItems: 'flex-start'
          }}>
             <Box sx={{ bgcolor: 'rgba(255, 159, 67, 0.2)', p: 0.5, borderRadius: '50%', color: '#ff9f43' }}>
                <WarningAmber fontSize="small" />
             </Box>
             <Typography variant="body2" sx={{ color: '#ff9f43', fontSize: '0.85rem', lineHeight: 1.5 }}>
                By submitting, you acknowledge the risk of unauthorized data transfer to and from the workspace when virtual machines with web access are active, including the potential absence of an audit trail. Mitigation actions and training for all workspace members are advised.
             </Typography>
          </Box>

          {/* Checkbox */}
          <FormControlLabel 
            control={<Checkbox checked={agreed} onChange={(e) => setAgreed(e.target.checked)} sx={{ color: 'rgba(255,255,255,0.3)' }} />}
            label={<Typography variant="body2" sx={{ color: '#b4b7bd' }}>Yes, I agree to these conditions</Typography>}
          />

          {/* Footer Buttons */}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={1}>
            <Button 
                variant="outlined" 
                onClick={() => navigate('/')}
                sx={{ 
                    color: '#fff', 
                    borderColor: 'rgba(255,255,255,0.3)',
                    px: 3
                }}
            >
                Cancel
            </Button>
            <Button 
                variant="contained" 
                disabled={!agreed}
                sx={{ 
                    bgcolor: '#7367f0', 
                    '&:hover': { bgcolor: '#5e50ee' },
                    px: 3
                }}
            >
                Submit
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
