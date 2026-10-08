import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  Tooltip,
  Paper,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  RateReview as RateReviewIcon,
  Logout as LogoutIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Send as SendIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import DropColumn from '../components/DropColumn';
import SubmitDialog from '../components/SubmitDialog';
import AdminRankings from '../components/AdminRankings';
import { apiGetMyTeam, apiGetMe, apiSubmit } from '../api/client';

const COLUMN_DEFS = [
  {
    id: 'pool',
    label: 'Unrated',
    description: 'Drag members to a tier to rate them',
    color: '#546e7a',
    lightColor: '#eceff1',
    borderColor: '#90a4ae',
  },
  {
    id: 'top',
    label: 'Top',
    description: 'No limit',
    color: '#1a237e',
    lightColor: '#e8eaf6',
    borderColor: '#3949ab',
  },
  {
    id: 'mid',
    label: 'Mid',
    description: 'No limit',
    color: '#004d40',
    lightColor: '#e0f2f1',
    borderColor: '#00897b',
  },
  {
    id: 'bottom',
    label: 'Bottom',
    description: 'No limit',
    color: '#bf360c',
    lightColor: '#fbe9e7',
    borderColor: '#e64a19',
  },
];

export default function PlacementPage() {
  const navigate = useNavigate();
  const [columns, setColumns] = useState({ pool: [], top: [], mid: [], bottom: [] });
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [teamName, setTeamName] = useState('');

  const userName      = sessionStorage.getItem('user_name') || 'User';
  const storedAdmin   = sessionStorage.getItem('is_admin') === '1';
  const storedSubmit  = sessionStorage.getItem('has_submitted') === '1';

  // Load team members on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const me = await apiGetMe();
        setIsAdmin(me.is_admin);
        setSubmitted(me.has_submitted);
        if (!me.is_admin && !me.has_submitted) {
          const teamData = await apiGetMyTeam();
          setTeamName(teamData.team ?? '');
          // Build initial columns: all members in pool
          const members = teamData.members.map((m) => ({
            id:     `member-${m.id}`,
            dbId:   m.id,
            name:   m.name,
            avatar: m.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
            role:   teamData.team,
          }));
          setColumns({ pool: members, top: [], mid: [], bottom: [] });
        }
      } catch (err) {
        setApiError(err.message || 'Failed to load team data.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalMembers  = columns.pool.length + columns.top.length + columns.mid.length + columns.bottom.length;
  const assignedCount = columns.top.length + columns.mid.length + columns.bottom.length;
  const allAssigned   = totalMembers > 0 && assignedCount === totalMembers;
  const progress      = totalMembers > 0 ? Math.round((assignedCount / totalMembers) * 100) : 0;

  const onDragEnd = useCallback(
    (result) => {
      if (submitted) return;
      const { source, destination } = result;
      if (!destination) return;
      if (source.droppableId === destination.droppableId && source.index === destination.index) return;

      const destId = destination.droppableId;
      const srcId  = source.droppableId;

      setColumns((prev) => {
        const next = { pool: [...prev.pool], top: [...prev.top], mid: [...prev.mid], bottom: [...prev.bottom] };
        const [moved] = next[srcId].splice(source.index, 1);
        next[destId].splice(destination.index, 0, moved);
        return next;
      });
    },
    [submitted]
  );

  const handleLogout = () => {
    sessionStorage.clear();
    navigate('/');
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    try {
      const placements = [
        ...columns.top.map((m)    => ({ member_id: m.dbId, tier: 'top'    })),
        ...columns.mid.map((m)    => ({ member_id: m.dbId, tier: 'mid'    })),
        ...columns.bottom.map((m) => ({ member_id: m.dbId, tier: 'bottom' })),
      ];
      await apiSubmit(placements);
      sessionStorage.setItem('has_submitted', '1');
      setSubmitted(true);
      setSubmitOpen(false);
    } catch (err) {
      setApiError(err.message || 'Submission failed. Please try again.');
      setSubmitOpen(false);
    } finally {
      setSubmitLoading(false);
    }
  };

  // ── Admin view ────────────────────────────────────────────────────────────
  if (!loading && (isAdmin || storedAdmin)) {
    return <AdminRankings userName={userName} onLogout={handleLogout} />;
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f8' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#1a237e' }} />
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Loading your team...
          </Typography>
        </Box>
      </Box>
    );
  }

  // ── Already submitted — show blank white screen ───────────────────────────
  if (submitted) {
    return <Box sx={{ height: '100vh', background: '#fff' }} />;
  }

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', background: '#f4f6f8', display: 'flex', flexDirection: 'column' }}>
      {/* ── AppBar ─────────────────────────────────────────────── */}
      <AppBar position="static" elevation={0} sx={{ background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
        <Toolbar sx={{ gap: 2, minHeight: '56px !important', px: { xs: 2, sm: 3 } }}>
          <RateReviewIcon sx={{ fontSize: 22 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '0.9375rem' }}>
              Anonymous Rating Form
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.65, fontSize: '0.68rem' }}>
              {teamName ? `Team: ${teamName}` : 'Rate each member by assigning them to a tier'}
            </Typography>
          </Box>

          {allAssigned ? (
            <Chip icon={<CheckCircleIcon sx={{ fontSize: '15px !important' }} />} label="All Rated" size="small"
              sx={{ bgcolor: 'rgba(46,125,50,0.3)', color: '#a5d6a7', border: '1px solid rgba(165,214,167,0.4)', fontWeight: 600, fontSize: '0.72rem' }} />
          ) : (
            <Chip label={`${assignedCount}/${totalMembers} rated`} size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: '0.72rem' }} />
          )}

          <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.15)', my: 0.75 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 30, height: 30, fontSize: '0.72rem', bgcolor: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>
              {userName.charAt(0)}
            </Avatar>
            <Typography variant="body2" sx={{ opacity: 0.85, display: { xs: 'none', sm: 'block' }, fontSize: '0.8rem' }}>
              {userName}
            </Typography>
          </Box>

          <Tooltip title="Sign out">
            <IconButton color="inherit" onClick={handleLogout} size="small" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
              <LogoutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Progress bar */}
      <LinearProgress variant="determinate" value={progress} sx={{ height: 3, flexShrink: 0, bgcolor: '#e8eaf6',
        '& .MuiLinearProgress-bar': { background: allAssigned ? 'linear-gradient(90deg, #2e7d32, #43a047)' : 'linear-gradient(90deg, #1a237e, #3949ab)', transition: 'all 0.4s ease' } }} />

      {/* Main content */}
      <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', px: { xs: 1.5, sm: 2.5 }, pt: 1.5, pb: 1.5, gap: 1.5 }}>

        {/* API error */}
        {apiError && (
          <Alert severity="error" onClose={() => setApiError('')} sx={{ borderRadius: 2, flexShrink: 0, py: 0.5 }}>
            {apiError}
          </Alert>
        )}

        {/* Info / success banner */}
        {!submitted ? (
          <Paper elevation={0} sx={{ px: 2, py: 1, borderRadius: 2, background: '#e8eaf6', border: '1px solid #c5cae9', display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
            <InfoIcon sx={{ color: '#3949ab', fontSize: 16, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: '#1a237e', fontWeight: 500, fontSize: '0.775rem', lineHeight: 1.4 }}>
              Drag members from <strong>Unrated</strong> into <strong>Top</strong>, <strong>Mid</strong>, or <strong>Bottom</strong>. Rate all {totalMembers} members to unlock submission.
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={0} sx={{ px: 2, py: 1, borderRadius: 2, background: '#e8f5e9', border: '1px solid #a5d6a7', display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
            <CheckCircleIcon sx={{ color: '#2e7d32', fontSize: 18, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ color: '#1b5e20', fontWeight: 600, fontSize: '0.8rem' }}>
              Rating successfully submitted. All assignments are now locked.
            </Typography>
          </Paper>
        )}

        {/* Drag & Drop */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Box sx={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.15fr 1fr 1fr 1fr', gap: 2, alignItems: 'stretch' }}>
            {COLUMN_DEFS.map((col) => (
              <Paper key={col.id} elevation={0} sx={{
                borderRadius: 2, border: '1px solid #e0e0e0', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                opacity: submitted && col.id === 'pool' ? 0.5 : 1,
                pointerEvents: submitted ? 'none' : 'auto',
                transition: 'box-shadow 0.2s ease',
                '&:hover': { boxShadow: submitted ? 'none' : '0 4px 16px rgba(0,0,0,0.08)' },
              }}>
                <DropColumn columnDef={col} members={columns[col.id]} />
              </Paper>
            ))}
          </Box>
        </DragDropContext>

        {/* Submit footer */}
        <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 2.5, py: 1.25, borderRadius: 2, background: '#fff', border: '1px solid #e0e0e0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.8375rem' }}>
              {submitted ? 'Rating Complete' : allAssigned ? 'Ready to Submit' : `${totalMembers - assignedCount} member${totalMembers - assignedCount === 1 ? '' : 's'} not yet rated`}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
              {submitted ? 'Ratings have been finalized and saved.' : allAssigned ? 'All members rated. Review and confirm to submit.' : 'Rate all team members to enable submission.'}
            </Typography>
          </Box>

          <Tooltip title={submitted ? 'Already submitted — locked' : !allAssigned ? `${totalMembers - assignedCount} member(s) still unrated` : 'Submit ratings'} placement="top">
            <span>
              <Button variant="contained" size="medium" disabled={!allAssigned || submitted || submitLoading}
                startIcon={submitted ? <CheckCircleIcon /> : submitLoading ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
                onClick={() => setSubmitOpen(true)}
                sx={{ minWidth: 160, py: 1, fontSize: '0.875rem', bgcolor: submitted ? '#2e7d32 !important' : undefined, '&.Mui-disabled': { background: '#e0e0e0 !important', color: '#9e9e9e !important' } }}>
                {submitted ? 'Submitted' : 'Submit Rating'}
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      <SubmitDialog open={submitOpen} onClose={() => setSubmitOpen(false)} onConfirm={handleSubmit} placementData={columns} columnDefs={COLUMN_DEFS} />
    </Box>
  );
}
