import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Alert,
  Stack,
} from '@mui/material';
import {
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

const AVATAR_COLORS = [
  '#1a237e', '#004d40', '#bf360c', '#4a148c',
  '#006064', '#1b5e20', '#880e4f', '#0d47a1',
  '#e65100', '#3e2723', '#263238', '#37474f',
];

function getAvatarColor(id) {
  const idx = parseInt(id.replace('member-', ''), 10) - 1;
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

export default function SubmitDialog({ open, onClose, onConfirm, placementData, columnDefs }) {
  const tierColumns = (columnDefs ?? []).filter((c) => c.id !== 'pool');

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          pt: 3,
          pb: 0,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: '#fff3e0',
            border: '1px solid #ffcc80',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            mt: 0.25,
          }}
        >
          <WarningIcon sx={{ color: '#f57c00', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            Confirm Submission
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            Review your assignments before finalizing
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2.5, pb: 1 }}>
        <Alert
          severity="warning"
          icon={false}
          sx={{
            mb: 3,
            borderRadius: 2,
            bgcolor: '#fff8e1',
            border: '1px solid #ffe082',
            '& .MuiAlert-message': { width: '100%' },
          }}
        >
          <Typography variant="body2" sx={{ color: '#e65100', fontWeight: 600 }}>
            This action cannot be undone.
          </Typography>
          <Typography variant="body2" sx={{ color: '#bf360c', fontSize: '0.8125rem', mt: 0.25 }}>
            Once submitted, tier placements will be locked and cannot be modified.
          </Typography>
        </Alert>

        <Typography
          variant="overline"
          sx={{
            color: 'text.secondary',
            fontWeight: 600,
            letterSpacing: '1px',
            fontSize: '0.7rem',
            display: 'block',
            mb: 1.5,
          }}
        >
          Placement Summary
        </Typography>

        <Stack spacing={2}>
          {tierColumns.map((col) => {
            const members = placementData?.[col.id] ?? [];
            return (
              <Box
                key={col.id}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${col.borderColor}`,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    background: col.lightColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: col.color }}
                  >
                    {col.label}
                  </Typography>
                  <Chip
                    label={`${members.length} member${members.length !== 1 ? 's' : ''}`}
                    size="small"
                    sx={{
                      bgcolor: col.color,
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      height: 20,
                    }}
                  />
                </Box>
                {members.length > 0 ? (
                  <List dense disablePadding sx={{ px: 1 }}>
                    {members.map((m, i) => (
                      <ListItem
                        key={m.id}
                        disablePadding
                        sx={{
                          py: 0.5,
                          borderBottom:
                            i < members.length - 1 ? '1px solid #f0f0f0' : 'none',
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              fontSize: '0.65rem',
                              fontWeight: 700,
                              bgcolor: getAvatarColor(m.id),
                            }}
                          >
                            {m.avatar}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={m.name}
                          secondary={m.role}
                          primaryTypographyProps={{
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                          }}
                          secondaryTypographyProps={{
                            fontSize: '0.7rem',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      No members assigned
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      </DialogContent>

      <Divider sx={{ mx: 3, mt: 2.5 }} />

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          color="secondary"
          startIcon={<CancelIcon />}
          sx={{ flex: 1 }}
        >
          Go Back
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="primary"
          startIcon={<CheckCircleIcon />}
          sx={{ flex: 1 }}
        >
          Confirm &amp; Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
