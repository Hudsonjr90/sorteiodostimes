import { useEffect, useState, type ChangeEvent } from 'react';
import { TextField, Box, Typography, Paper, Button, Stack } from '@mui/material';

interface PlayerSetupProps {
  playerCount: number;
  setPlayerCount: (count: number) => void;
  players: string[];
  setPlayers: (players: string[]) => void;
}

export default function PlayerSetup({ playerCount, setPlayerCount, players, setPlayers }: PlayerSetupProps) {
  const playersPerPage = 10;
  const [page, setPage] = useState(0);

  const handleCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setPlayerCount(0);
      setPlayers([]);
      return;
    }

    const count = Number(e.target.value);
    if (Number.isNaN(count) || count < 0) {
      return;
    }
    setPlayerCount(count);
    setPlayers(Array.from({ length: count }, (_, i) => players[i] || ''));
  };

  const handleNameChange = (index: number, value: string) => {
    const updated = [...players];
    updated[index] = value;
    setPlayers(updated);
  };

  const totalPages = Math.max(1, Math.ceil(players.length / playersPerPage));
  const startIndex = page * playersPerPage;
  const endIndex = startIndex + playersPerPage;
  const currentPlayers = players.slice(startIndex, endIndex);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(totalPages - 1);
    }
  }, [page, totalPages]);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Quantidade de jogadores
      </Typography>
      <TextField
        type="number"
        inputProps={{ min: 1 }}
        value={playerCount === 0 ? '' : playerCount}
        onChange={handleCountChange}
        onFocus={(e) => e.target.select()}
        variant="outlined"
        size="small"
        sx={{ my: 2, maxWidth: 240 }}
        fullWidth
        helperText="Digite o número total de jogadores"
      />
      {players.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
            disabled={page === 0}
          >
            Anterior
          </Button>
          <Typography variant="body2" color="text.secondary">
            Página {page + 1} de {totalPages}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
            disabled={page >= totalPages - 1}
          >
            Próxima
          </Button>
        </Stack>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 1,
        }}
      >
        {currentPlayers.map((name: string, index: number) => {
          const playerIndex = startIndex + index;
          return (
          <TextField
            key={playerIndex}
            label={`Jogador ${playerIndex + 1}`}
            value={name}
            onChange={(e) => handleNameChange(playerIndex, e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
          />
          );
        })}
      </Box>
    </Paper>
  );
}
