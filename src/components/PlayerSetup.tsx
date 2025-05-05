// components/PlayerSetup.jsx
import { TextField, Box, Typography } from '@mui/material';

interface PlayerSetupProps {
  playerCount: number;
  setPlayerCount: (count: number) => void;
  players: string[];
  setPlayers: (players: string[]) => void;
}

export default function PlayerSetup({ playerCount, setPlayerCount, players, setPlayers }: PlayerSetupProps) {
  const handleCountChange = (e: { target: { value: string; }; }) => {
    const count = parseInt(e.target.value);
    setPlayerCount(count);
    setPlayers(Array.from({ length: count }, (_, i) => players[i] || ''));
  };

  const handleNameChange = (index: number, value: string) => {
    const updated = [...players];
    updated[index] = value;
    setPlayers(updated);
  };

  return (
    <Box mb={4} sx={{ backgroundColor: '#00000080', p: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ color: '#fff' }}>Quantidade de jogadores:</Typography>
      <TextField
      type="number"
      inputProps={{ min: 1 }}
      value={playerCount}
      onChange={handleCountChange}
      variant="outlined"
      size="small"
      sx={{
        my: 2,
        maxWidth: 200,
        input: { color: '#fff' },
        '& .MuiOutlinedInput-root': {
        '& fieldset': { borderColor: '#fff' },
        '&:hover fieldset': { borderColor: '#fff' },
        '&.Mui-focused fieldset': { borderColor: '#fff' },
        },
        '& .MuiFormHelperText-root': { color: '#fff' }, 
        '& .MuiInputLabel-root': { color: '#fff' }, 
        '& .MuiInputLabel-root.Mui-focused': { color: '#fff' }, 
      }}
      fullWidth
      helperText="Digite o número de jogadores"
      />
      {players.map((name: string, index: number) => (
      <TextField
        key={index}
        label={`Jogador ${index + 1}`}
        value={name}
        onChange={(e) => handleNameChange(index, e.target.value)}
        variant="outlined"
        size="small"
        sx={{
        mb: 1,
        input: { color: '#fff' },
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: '#fff' },
          '&:hover fieldset': { borderColor: '#fff' },
          '&.Mui-focused fieldset': { borderColor: '#fff' },
        },
        '& .MuiFormHelperText-root': { color: '#fff' }, 
        '& .MuiInputLabel-root': { color: '#fff' }, 
        '& .MuiInputLabel-root.Mui-focused': { color: '#fff' }, 
        }}
        fullWidth
      />
      ))}
    </Box>
  );
}
