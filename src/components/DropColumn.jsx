import {
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { Droppable } from '@hello-pangea/dnd';
import MemberCard from './MemberCard';
import PeopleIcon from '@mui/icons-material/People';
import LockIcon from '@mui/icons-material/Lock';

export default function DropColumn({ columnDef, members, cap }) {
  const isPool = columnDef.id === 'pool';
  const count = members.length;
  const isFull = cap !== null && count >= cap;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Column header */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          background: columnDef.lightColor,
          borderBottom: `2px solid ${columnDef.borderColor}`,
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              color: columnDef.color,
              fontSize: '0.875rem',
              lineHeight: 1.2,
            }}
          >
            {columnDef.label}
          </Typography>
          {cap !== null && (
            <Typography
              variant="caption"
              sx={{
                color: columnDef.color,
                opacity: 0.65,
                fontSize: '0.66rem',
                fontWeight: 500,
              }}
            >
              {isFull ? `Full (${cap}/${cap})` : `${count}/${cap} — ${cap - count} slot${cap - count === 1 ? '' : 's'} left`}
            </Typography>
          )}
          {cap === null && (
            <Typography
              variant="caption"
              sx={{
                color: columnDef.color,
                opacity: 0.65,
                fontSize: '0.66rem',
                fontWeight: 500,
              }}
            >
              {columnDef.description}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
          {isFull && (
            <LockIcon
              sx={{ fontSize: 13, color: columnDef.color, opacity: 0.6 }}
            />
          )}
          <Chip
            label={count}
            size="small"
            sx={{
              bgcolor: isFull ? columnDef.color : columnDef.color,
              color: '#fff',
              fontWeight: 700,
              minWidth: 26,
              height: 22,
              fontSize: '0.7rem',
            }}
          />
        </Box>
      </Box>

      {/* Drop zone — fills remaining column height */}
      <Droppable droppableId={columnDef.id}>
        {(provided, snapshot) => (
          <Box
            ref={provided.innerRef}
            {...provided.droppableProps}
            sx={{
              flex: 1,
              p: 1.25,
              overflowY: 'auto',
              background: snapshot.isDraggingOver
                ? columnDef.lightColor
                : '#fafafa',
              outline: snapshot.isDraggingOver
                ? `2px dashed ${columnDef.borderColor}`
                : '2px dashed transparent',
              outlineOffset: '-2px',
              borderRadius: '0 0 8px 8px',
              transition: 'background 0.15s ease, outline 0.15s ease',
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': {
                borderRadius: 2,
                background: '#e0e0e0',
              },
            }}
          >
            {members.length === 0 && !snapshot.isDraggingOver && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  minHeight: 60,
                  gap: 0.75,
                  opacity: 0.35,
                }}
              >
                <PeopleIcon sx={{ fontSize: 22, color: columnDef.color }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: columnDef.color,
                    fontWeight: 500,
                    textAlign: 'center',
                    fontSize: '0.7rem',
                  }}
                >
                  {isPool ? 'All members rated!' : 'Drop members here'}
                </Typography>
              </Box>
            )}

            {members.map((member, index) => (
              <MemberCard
                key={member.id}
                member={member}
                index={index}
                isInPool={isPool}
              />
            ))}
            {provided.placeholder}
          </Box>
        )}
      </Droppable>
    </Box>
  );
}
