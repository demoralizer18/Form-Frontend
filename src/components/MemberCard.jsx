import {
  Box,
  Typography,
  Avatar,
  Paper,
} from '@mui/material';
import { Draggable } from '@hello-pangea/dnd';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

const AVATAR_COLORS = [
  '#1a237e', '#004d40', '#bf360c', '#4a148c',
  '#006064', '#1b5e20', '#880e4f', '#0d47a1',
  '#e65100', '#3e2723', '#263238', '#37474f',
];

function getAvatarColor(id) {
  const idx = parseInt(id.replace('member-', ''), 10) - 1;
  return AVATAR_COLORS[idx % AVATAR_COLORS.length];
}

export default function MemberCard({ member, index, isInPool }) {
  return (
    <Draggable draggableId={member.id} index={index}>
      {(provided, snapshot) => (
        <Paper
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: isInPool ? '5px' : '6px',
            mb: '5px',
            borderRadius: 1.5,
            border: snapshot.isDragging
              ? '1.5px solid #3949ab'
              : '1px solid #e8eaed',
            background: snapshot.isDragging ? '#f0f4ff' : '#ffffff',
            cursor: snapshot.isDragging ? 'grabbing' : 'grab',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            userSelect: 'none',
            boxShadow: snapshot.isDragging
              ? '0 6px 20px rgba(26,35,126,0.18)'
              : 'none',
            '&:hover': {
              borderColor: '#9fa8da',
              boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
            },
          }}
        >
          {/* Grip icon — visual only, no separate handle */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: snapshot.isDragging ? '#3949ab' : '#cfd8dc',
              flexShrink: 0,
              pointerEvents: 'none',
            }}
          >
            <DragIndicatorIcon sx={{ fontSize: 15 }} />
          </Box>

          <Avatar
            sx={{
              width: isInPool ? 28 : 30,
              height: isInPool ? 28 : 30,
              fontSize: '0.6rem',
              fontWeight: 700,
              bgcolor: getAvatarColor(member.id),
              flexShrink: 0,
            }}
          >
            {member.avatar}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                fontSize: isInPool ? '0.75rem' : '0.775rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: 1.3,
              }}
            >
              {member.name}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.65rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
                lineHeight: 1.2,
              }}
            >
              {member.role}
            </Typography>
          </Box>
        </Paper>
      )}
    </Draggable>
  );
}
