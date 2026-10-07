import { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  RateReview as RateReviewIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  EmojiEvents as TrophyIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as DoneIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { apiGetRankings } from '../api/client';

const TIER_COLORS = {
  top:    { bg: '#e8eaf6', text: '#1a237e', border: '#3949ab' },
  mid:    { bg: '#e0f2f1', text: '#004d40', border: '#00897b' },
  bottom: { bg: '#fbe9e7', text: '#bf360c', border: '#e64a19' },
};

// Gold / Silver / Bronze + grey for the rest
const RANK_COLORS = ['#f9a825', '#78909c', '#6d4c41'];

function RankBadge({ rank }) {
  const color = RANK_COLORS[rank - 1] ?? '#bdbdbd';
  return (
    <Box sx={{
      width: 28, height: 28, borderRadius: '50%', bgcolor: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.7rem', lineHeight: 1 }}>
        {rank}
      </Typography>
    </Box>
  );
}

export default function AdminRankings({ userName, onLogout }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  function fetchData() {
    setLoading(true);
    setError('');
    apiGetRankings()
      .then(setData)
      .catch((err) => setError(err.message || 'Failed to load rankings.'))
      .finally(() => setLoading(false));
  }

  useEffect(fetchData, []);

  return (
    <Box sx={{ minHeight: '100vh', background: '#f4f6f8', display: 'flex', flexDirection: 'column' }}>

      {/* ── AppBar ─────────────────────────────────────────── */}
      <AppBar position="static" elevation={0} sx={{
        background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)', flexShrink: 0,
      }}>
        <Toolbar sx={{ gap: 2, minHeight: '56px !important', px: { xs: 2, sm: 3 } }}>
          <RateReviewIcon sx={{ fontSize: 22 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: '0.9375rem' }}>
              Anonymous Rating Form
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.65, fontSize: '0.68rem' }}>
              Admin Dashboard — Team Rankings
            </Typography>
          </Box>

          <Tooltip title="Refresh rankings">
            <IconButton color="inherit" onClick={fetchData} size="small"
              sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }} disabled={loading}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>

          <Chip
            icon={<AdminIcon sx={{ fontSize: '14px !important' }} />}
            label="Administrator"
            size="small"
            sx={{ bgcolor: 'rgba(255,193,7,0.2)', color: '#ffe082', border: '1px solid rgba(255,224,130,0.4)', fontWeight: 600, fontSize: '0.72rem' }}
          />

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
            <IconButton color="inherit" onClick={onLogout} size="small" sx={{ opacity: 0.8, '&:hover': { opacity: 1 } }}>
              <LogoutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* ── Content ────────────────────────────────────────── */}
      <Box sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 }, maxWidth: 1200, mx: 'auto', width: '100%' }}>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress sx={{ color: '#1a237e' }} />
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Loading rankings...
              </Typography>
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>{error}</Alert>
        )}

        {data && !loading && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {data.teams.map((team) => {
              const voteProgress = team.total_members > 0
                ? Math.round((team.voted_count / team.total_members) * 100)
                : 0;
              const allVoted = team.pending_count === 0;

              return (
                <Paper key={team.team} elevation={0} sx={{ borderRadius: 2.5, border: '1px solid #e0e0e0', overflow: 'hidden' }}>

                  {/* ── Team header ───────────────────────────── */}
                  <Box sx={{
                    px: 3, py: 1.75,
                    background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <TrophyIcon sx={{ color: '#ffe082', fontSize: 20 }} />
                      <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, fontSize: '0.9375rem' }}>
                        Team {team.team}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {allVoted ? (
                        <Chip
                          icon={<DoneIcon sx={{ fontSize: '14px !important' }} />}
                          label="All voted"
                          size="small"
                          sx={{ bgcolor: 'rgba(46,125,50,0.35)', color: '#a5d6a7', border: '1px solid rgba(165,214,167,0.4)', fontWeight: 600, fontSize: '0.72rem' }}
                        />
                      ) : (
                        <Chip
                          icon={<PendingIcon sx={{ fontSize: '14px !important' }} />}
                          label={`${team.voted_count} / ${team.total_members} voted`}
                          size="small"
                          sx={{ bgcolor: 'rgba(255,255,255,0.12)', color: '#fff', fontWeight: 600, fontSize: '0.72rem' }}
                        />
                      )}
                    </Box>
                  </Box>

                  {/* ── Voting progress bar ───────────────────── */}
                  <Box sx={{ px: 3, pt: 1.5, pb: 0.5, background: '#fafbff', borderBottom: '1px solid #eff0f5' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem' }}>
                        Participation
                      </Typography>
                      <Typography variant="caption" sx={{ color: allVoted ? '#2e7d32' : '#3949ab', fontWeight: 700, fontSize: '0.7rem' }}>
                        {voteProgress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={voteProgress}
                      sx={{
                        height: 5, borderRadius: 4, mb: 1.25, bgcolor: '#e8eaf6',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: allVoted
                            ? 'linear-gradient(90deg, #2e7d32, #43a047)'
                            : 'linear-gradient(90deg, #1a237e, #3949ab)',
                        },
                      }}
                    />

                    {/* Non-voters section */}
                    {team.non_voters.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                        <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 700, fontSize: '0.68rem', flexShrink: 0 }}>
                          Not yet voted:
                        </Typography>
                        {team.non_voters.map((name) => (
                          <Chip
                            key={name}
                            label={name}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              bgcolor: '#fff3e0',
                              color: '#e65100',
                              border: '1px solid #ffcc80',
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* ── Rankings table OR locked placeholder ─────── */}
                  {!team.voting_complete ? (
                    /* All members haven't voted yet — hide all vote data */
                    <Box sx={{
                      px: 3, py: 4.5, background: '#fafafa',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5,
                    }}>
                      <Box sx={{
                        width: 48, height: 48, borderRadius: '50%',
                        bgcolor: '#f0f0f0', border: '2px solid #e0e0e0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <PendingIcon sx={{ color: '#bdbdbd', fontSize: 24 }} />
                      </Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}>
                        Results locked
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: 'text.secondary', fontSize: '0.775rem',
                        textAlign: 'center', maxWidth: 360, lineHeight: 1.6,
                      }}>
                        Rankings for <strong>Team {team.team}</strong> will be revealed once all{' '}
                        <strong>{team.total_members}</strong> members have submitted.{' '}
                        Waiting on <strong>{team.pending_count}</strong> more{' '}
                        {team.pending_count === 1 ? 'person' : 'people'}.
                      </Typography>
                    </Box>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ background: '#f8f9ff' }}>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'text.secondary', py: 1.25, width: 48 }}>Rank</TableCell>
                          <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'text.secondary', py: 1.25 }}>Member</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', color: TIER_COLORS.top.text, py: 1.25 }}>Top</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', color: TIER_COLORS.mid.text, py: 1.25 }}>Mid</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.72rem', color: TIER_COLORS.bottom.text, py: 1.25 }}>Bottom</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem', color: 'text.secondary', py: 1.25 }}>Score</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {team.rankings.map((member) => (
                          <TableRow key={member.name} sx={{ '&:hover': { background: '#fafbff' }, '&:last-child td': { border: 0 } }}>
                            <TableCell sx={{ py: 1.1 }}><RankBadge rank={member.rank} /></TableCell>
                            <TableCell sx={{ py: 1.1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8375rem' }}>{member.name}</Typography>
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.1 }}>
                              <Chip label={member.top_votes} size="small" sx={{ bgcolor: TIER_COLORS.top.bg, color: TIER_COLORS.top.text, fontWeight: 700, fontSize: '0.7rem', height: 21, border: `1px solid ${TIER_COLORS.top.border}` }} />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.1 }}>
                              <Chip label={member.mid_votes} size="small" sx={{ bgcolor: TIER_COLORS.mid.bg, color: TIER_COLORS.mid.text, fontWeight: 700, fontSize: '0.7rem', height: 21, border: `1px solid ${TIER_COLORS.mid.border}` }} />
                            </TableCell>
                            <TableCell align="center" sx={{ py: 1.1 }}>
                              <Chip label={member.bottom_votes} size="small" sx={{ bgcolor: TIER_COLORS.bottom.bg, color: TIER_COLORS.bottom.text, fontWeight: 700, fontSize: '0.7rem', height: 21, border: `1px solid ${TIER_COLORS.bottom.border}` }} />
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1.1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 800, color: '#1a237e', fontSize: '0.875rem' }}>{member.score}</Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {/* ── Footer legend ─────────────────────────── */}
                  <Box sx={{ px: 3, py: 0.875, borderTop: '1px solid #f0f0f0', background: '#fafafa' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.67rem' }}>
                      Score: Top = 3 pts · Mid = 2 pts · Bottom = 1 pt &nbsp;·&nbsp; Rankings are fully anonymous — no voter identity is stored
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
