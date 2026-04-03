import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import CloseRounded from '@mui/icons-material/CloseRounded';
import IosShareRounded from '@mui/icons-material/IosShareRounded';
import AddToHomeScreenRounded from '@mui/icons-material/AddToHomeScreenRounded';

interface InstallBannerProps {
  showIOSHint: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export default function InstallBanner({ showIOSHint, onInstall, onDismiss }: InstallBannerProps) {
  return (
    <Paper
      elevation={6}
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 1300,
        p: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderRadius: 3,
      }}
    >
      <AddToHomeScreenRounded color="primary" />

      <Box sx={{ flex: 1 }}>
        {showIOSHint ? (
          <Typography variant="body2">
            Adicione à tela inicial: toque em{' '}
            <IosShareRounded sx={{ fontSize: 14, verticalAlign: 'middle', mx: 0.3 }} />
            {' '}e depois <strong>Adicionar à Tela de Início</strong>
          </Typography>
        ) : (
          <Typography variant="body2">
            Instale o app para acesso rápido na tela inicial
          </Typography>
        )}
      </Box>

      {!showIOSHint && (
        <Button size="small" variant="contained" onClick={onInstall} sx={{ textTransform: 'none', flexShrink: 0 }}>
          Instalar
        </Button>
      )}

      <IconButton size="small" onClick={onDismiss} aria-label="fechar">
        <CloseRounded fontSize="small" />
      </IconButton>
    </Paper>
  );
}
