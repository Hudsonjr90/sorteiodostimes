import { useState } from 'react';
import { Paper, Typography, TextField, Button, Stack, Alert } from '@mui/material';

interface PlayerListPasteProps {
  onSubmit: (names: string[]) => void;
  maxPlayers: number;
  isConfigured: boolean;
}

export default function PlayerListPaste({
  onSubmit,
  maxPlayers,
  isConfigured,
}: PlayerListPasteProps) {
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
        Cole a lista com um nome por linha. Se faltarem jogadores, os primeiros times serão preenchidos
        e o último ficará incompleto.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Capacidade máxima para esta configuração: {maxPlayers} jogadores.
      </Typography>
      {!isConfigured && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Configure pelo menos 2 times e a quantidade de jogadores na linha para sortear.
        </Alert>
      )}
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
        <Button variant="contained" onClick={handlePaste} disabled={!isConfigured} sx={{ textTransform: 'none' }}>
          Sortear agora
        </Button>
      </Stack>
    </Paper>
  );
}
