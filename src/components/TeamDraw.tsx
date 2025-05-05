// components/TeamDraw.tsx
import React from 'react';
import {
  Button,
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

interface TeamDrawProps {
  teams: string[][];
  onDraw: () => void;
}

const TeamDraw: React.FC<TeamDrawProps> = ({ teams, onDraw }) => {
  return (
    <Box>
      <Button
        variant="contained"
        color="primary"
        onClick={onDraw}
        sx={{ mb: 4 }}
      >
        Sortear Times
      </Button>

      {teams.length > 0 && (
        <Grid container spacing={4}>
          {teams.map((team, i) => (
            <Grid container key={i}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Time {i + 1}
                </Typography>
                <List dense>
                  {team.map((player, idx) => (
                    <ListItem key={idx} disablePadding>
                      <ListItemText primary={player} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TeamDraw;
