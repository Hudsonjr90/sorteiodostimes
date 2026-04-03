import { type ChangeEvent } from 'react';
import { TextField, Box, Typography, Paper } from '@mui/material';

interface TeamSetupProps {
  teamCount: number;
  setTeamCount: (value: number) => void;
  linePlayers: number;
  setLinePlayers: (value: number) => void;
  estimatedTeams: number;
}

export default function TeamSetup({
  teamCount,
  setTeamCount,
  linePlayers,
  setLinePlayers,
  estimatedTeams,
}: TeamSetupProps) {
  const handleLinePlayersChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setLinePlayers(0);
      return;
    }

    const value = Number(e.target.value);
    if (!Number.isNaN(value) && value >= 0) {
      setLinePlayers(value);
    }
  };

  const handleTeamCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setTeamCount(0);
      return;
    }

    const value = Number(e.target.value);
    if (Number.isNaN(value) || value < 0) {
      return;
    }
    if (estimatedTeams >= 2) {
      setTeamCount(Math.min(value, estimatedTeams));
      return;
    }
    setTeamCount(value);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Configuração da pelada
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
        <TextField
          type="number"
          label="Jogadores na linha"
          inputProps={{ min: 1 }}
          value={linePlayers === 0 ? '' : linePlayers}
          onChange={handleLinePlayersChange}
          onFocus={(e) => e.target.select()}
          variant="outlined"
          size="small"
          sx={{ width: { xs: '100%', sm: 240 } }}
          helperText="Goleiro é contado separadamente"
        />

        <TextField
          type="number"
          label="Quantidade de times"
          inputProps={{ min: 1, max: estimatedTeams >= 2 ? estimatedTeams : undefined }}
          value={teamCount === 0 ? '' : teamCount}
          onChange={handleTeamCountChange}
          onFocus={(e) => e.target.select()}
          variant="outlined"
          size="small"
          sx={{ width: { xs: '100%', sm: 240 } }}
          helperText={
            linePlayers === 0
              ? 'Configure os jogadores na linha primeiro'
              : estimatedTeams >= 2
                ? `Limite estimado: ${estimatedTeams} times`
                : 'Preencha mais jogadores para liberar o sorteio'
          }
        />
      </Box>
    </Paper>
  );
}