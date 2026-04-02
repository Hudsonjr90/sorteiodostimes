import { useRef, useState } from 'react';
import {
  Button,
  Paper,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemText,
  Alert,
} from '@mui/material';
import { exportElementAsPdf, exportElementAsPng } from '../utils/export';

interface TeamDrawProps {
  teams: string[][];
  helperText: string;
}

const TeamDraw: React.FC<TeamDrawProps> = ({ teams, helperText }) => {
  const resultRef = useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'png' | 'pdf') => {
    if (!resultRef.current) {
      return;
    }

    setIsExporting(true);
    try {
      if (type === 'png') {
        await exportElementAsPng(resultRef.current, 'pelada-times.png');
      } else {
        await exportElementAsPdf(resultRef.current, 'pelada-times.pdf');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Sorteio dos times
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {helperText}
      </Typography>

      {teams.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleExport('png')}
            disabled={isExporting}
          >
            Exportar PNG
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
          >
            Exportar PDF
          </Button>
        </Stack>
      )}

      {isExporting && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Gerando arquivo para download...
        </Alert>
      )}

      {teams.length > 0 && (
        <Stack
          ref={resultRef}
          direction="row"
          spacing={2}
          useFlexGap
          flexWrap="wrap"
          sx={{ alignItems: 'stretch' }}
        >
          {teams.map((team, i) => (
            <Paper
              key={i}
              elevation={3}
              sx={{ p: 2, minWidth: 220, flex: '1 1 220px' }}
            >
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
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default TeamDraw;
