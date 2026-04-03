import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import CurrencyExchangeRounded from '@mui/icons-material/CurrencyExchangeRounded';
import { dismissDonationPrompt } from '../hooks/useDonationPrompt';

interface DonationModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DonationModal({ open, onClose }: DonationModalProps) {
  const handleClose = () => {
    dismissDonationPrompt();
    onClose();
  };

  const handleDonate = () => {
    window.open('https://link.mercadopago.com.br/donationnow', '_blank');
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CurrencyExchangeRounded color="primary" />
        Apoie nosso projeto!
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Estamos felizes que você esteja usando nosso aplicativo! 🎉
          </Typography>
          <Typography variant="body2">
            Se o Sorteio dos Times tem sido útil para você, considere fazer uma
            doação voluntária para nos ajudar a manter e melhorar o projeto.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            O pagamento é feito no Mercado Pago, onde você escolhe a melhor
            forma para você: Pix, cartão de crédito, boleto ou débito virtual da
            Caixa.
          </Typography>

          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            A doação é completamente opcional. Você pode continuar usando o app
            normalmente independente de doar.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDonate} variant="contained">
          Ir para pagamento
        </Button>
        <Button onClick={handleClose} variant="outlined">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
