import { type ChangeEvent } from 'react';
import { TextField, Box, Typography, Paper } from '@mui/material';

interface TeamSetupProps {
  teamCount: number;
  setTeamCount: (value: number) => void;
  linePlayers: number;
  setLinePlayers: (value: number) => void;
}

export default function TeamSetup({
  teamCount,
  setTeamCount,
  linePlayers,
  setLinePlayers,
}: TeamSetupProps) {
  const handleLinePlayersChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setLinePlayers(0);
      return;
    }
    const value = Number(e.target.value);
    if (Number.isInteger(value) && value > 0) {
      setLinePlayers(value);
    }
  };

  const handleTeamCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setTeamCount(0);
      return;
    }
    const value = Number(e.target.value);
    if (Number.isInteger(value) && value >= 2) {
      setTeamCount(value);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Configuração da pelada
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
        <TextField
          type="number"
          label="Jogadores na linha por time"
          inputProps={{ min: 1 }}
          value={linePlayers === 0 ? '' : linePlayers}
          onChange={handleLinePlayersChange}
          onFocus={(e) => e.target.select()}
          variant="outlined"
          size="small"
          sx={{ width: { xs: '100%', sm: 240 } }}
          helperText={
            linePlayers === 0
              ? 'Quantidade de jogadores de linha em cada time'
              : `Até ${linePlayers} jogadores por time; goleiros ficam fora do sorteio`
          }
        />

        <TextField
          type="number"
          label="Quantidade de times"
          inputProps={{ min: 2 }}
          value={teamCount === 0 ? '' : teamCount}
          onChange={handleTeamCountChange}
          onFocus={(e) => e.target.select()}
          variant="outlined"
          size="small"
          sx={{ width: { xs: '100%', sm: 240 } }}
          helperText="Escolha quantos times serão sorteados"
        />
      </Box>
    </Paper>
  );
}
