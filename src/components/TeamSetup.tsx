// components/TeamSetup.jsx
import { TextField, Box, Typography } from '@mui/material';

interface TeamSetupProps {
  teamCount: number;
  setTeamCount: (value: number) => void;
}

export default function TeamSetup({ teamCount, setTeamCount }: TeamSetupProps) {
  const handleChange = (e: { target: { value: string; }; }) => {
    setTeamCount(parseInt(e.target.value));
  };

  return (
    <Box mb={4} bgcolor={'#00000080'} p={2} borderRadius={2}>
      <Typography variant="h6" sx={{ color: '#fff' }}>Quantidade de times:</Typography>
      <TextField
        type="number"
        inputProps={{ min: 2 }}
        value={teamCount}
        onChange={handleChange}
        variant="outlined"
        size="small"
        sx={{ mt: 2, maxWidth: 200,  input: { color: '#fff' },
        '& .MuiOutlinedInput-root': {
          '& fieldset': { borderColor: '#fff' },
          '&:hover fieldset': { borderColor: '#fff' },
          '&.Mui-focused fieldset': { borderColor: '#fff' },
        },
        '& .MuiFormHelperText-root': { color: '#fff' }, 
        '& .MuiInputLabel-root': { color: '#fff' }, 
        '& .MuiInputLabel-root.Mui-focused': { color: '#fff' },  }}
        fullWidth
      />
    </Box>
  );
}