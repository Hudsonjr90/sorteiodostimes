import { useState } from 'react';
import { Paper, Typography, TextField, Button, Stack, Alert } from '@mui/material';

interface PlayerListPasteProps {
  onSubmit: (names: string[]) => void;
  maxPlayers: number;
}

export default function PlayerListPaste({ onSubmit, maxPlayers }: PlayerListPasteProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handlePaste = () => {
    const lines = input
      .split(/\r?\n/)
      .map(line => line.replace(/^\s*\d+[-.\s]*|^[-.\s]+/, '').trim())
      .filter(Boolean);
    if (lines.length === 0) {
      setError('Cole pelo menos um nome.');
      return;
    }
    if (lines.length > maxPlayers) {
      setError(`Limite de ${maxPlayers} nomes.`);
      return;
    }
    setError('');
    onSubmit(lines);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Colar lista de nomes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Cole aqui a lista copiada do WhatsApp ou outro app. Cada nome deve estar em uma linha.
      </Typography>
      <TextField
        multiline
        minRows={5}
        maxRows={12}
        fullWidth
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={"1- Rafael\n2- Roberto\n3- Carlos\n..."}
        sx={{ mb: 2 }}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={handlePaste}>
          Sortear agora
        </Button>
      </Stack>
    </Paper>
  );
}
