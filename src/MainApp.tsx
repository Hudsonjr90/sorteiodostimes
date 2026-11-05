import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import {
  Box,
  Button,
  Container,
  Fab,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from '@mui/material';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import SportsSoccerRounded from '@mui/icons-material/SportsSoccerRounded';
import EmojiEventsRounded from '@mui/icons-material/EmojiEventsRounded';
import FavoriteBorderRounded from '@mui/icons-material/FavoriteBorderRounded';
import PlayerSetup from './components/PlayerSetup';
import PlayerListPaste from './components/PlayerListPaste';
import TeamSetup from './components/TeamSetup';
import TeamDraw from './components/TeamDraw';
import ChampionshipSetup from './components/ChampionshipSetup';
import DonationModal from './components/DonationModal';
import InstallBanner from './components/InstallBanner';
import { dismissDonationPrompt, useDonationPrompt } from './hooks/useDonationPrompt';
import { useInstallPrompt } from './hooks/useInstallPrompt';

type AppMode = 'pelada' | 'campeonato';
type PeladaView = 'config' | 'resultado';

const APP_STORAGE_KEY = 'sorteio.app.v1';

interface MainAppProps {
  themeMode: 'light' | 'dark';
  setThemeMode: Dispatch<SetStateAction<'light' | 'dark'>>;
}

export default function MainApp({ themeMode, setThemeMode }: MainAppProps) {
  const theme = useTheme();

  const [playerInputMode, setPlayerInputMode] = useState<'individual' | 'paste'>('individual');
  const [appMode, setAppMode] = useState<AppMode>('pelada');
  const [peladaView, setPeladaView] = useState<PeladaView>('config');

  const [players, setPlayers] = useState<string[]>([]);
  const [linePlayers, setLinePlayers] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [teams, setTeams] = useState<string[][]>([]);

  const [openDonationModal, setOpenDonationModal] = useState(false);
  const filledPlayers = players.map((player) => player.trim()).filter(Boolean);
  const { shouldShow: shouldShowDonationModal } = useDonationPrompt(filledPlayers.length);
  const installPrompt = useInstallPrompt();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(APP_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as {
        appMode?: AppMode;
        players?: string[];
        linePlayers?: number;
        teamCount?: number;
        teams?: string[][];
      };

      if (parsed.appMode === 'pelada' || parsed.appMode === 'campeonato') {
        setAppMode(parsed.appMode);
      }
      if (Array.isArray(parsed.players)) {
        setPlayers(parsed.players.filter((item): item is string => typeof item === 'string'));
      }
      if (typeof parsed.linePlayers === 'number' && Number.isInteger(parsed.linePlayers) && parsed.linePlayers >= 0) {
        setLinePlayers(parsed.linePlayers);
      }
      if (typeof parsed.teamCount === 'number' && Number.isInteger(parsed.teamCount) && parsed.teamCount >= 0) {
        setTeamCount(parsed.teamCount);
      }
      if (Array.isArray(parsed.teams)) {
        setTeams(
          parsed.teams.map((teamPlayers) =>
            Array.isArray(teamPlayers)
              ? teamPlayers.filter((item): item is string => typeof item === 'string')
              : [],
          ),
        );
      }
    } catch {
      localStorage.removeItem(APP_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const payload = {
      themeMode,
      appMode,
      players,
      linePlayers,
      teamCount,
      teams,
    };
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(payload));
  }, [themeMode, appMode, players, linePlayers, teamCount, teams]);

  useEffect(() => {
    if (shouldShowDonationModal) {
      setOpenDonationModal(true);
    }
  }, [shouldShowDonationModal]);

  const playerSlots = teamCount * linePlayers;
  const isConfigured = teamCount >= 2 && linePlayers > 0;
  const canDraw = isConfigured && filledPlayers.slice(0, playerSlots).length > 0;

  const handleDrawTeams = (sourcePlayers: string[] = players) => {
    const playersToDraw = sourcePlayers
      .map((player) => player.trim())
      .filter(Boolean)
      .slice(0, playerSlots);
    if (!isConfigured || playersToDraw.length === 0) {
      return false;
    }

    const shuffled = playersToDraw
      .map((p) => ({ p, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ p }) => p);

    const result = Array.from({ length: teamCount }, (_, index) =>
      shuffled.slice(index * linePlayers, (index + 1) * linePlayers),
    );
    setTeams(result);
    return true;
  };

  const handleLinePlayersChange = (value: number) => {
    setLinePlayers(value);
    setTeams([]);
  };

  const handleTeamCountChange = (value: number) => {
    setTeamCount(value);
    setTeams([]);
  };

  const handleDrawAndGoToResult = (sourcePlayers: string[] = players) => {
    if (handleDrawTeams(sourcePlayers)) {
      setPeladaView('resultado');
    }
  };

  const handleResetForNewDraw = () => {
    setPlayers(Array.from({ length: playerSlots }, () => ''));
    setTeams([]);
    setPeladaView('config');
    setPlayerInputMode('paste');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 2, md: 4 },
        backgroundImage:
          themeMode === 'dark'
            ? 'linear-gradient(180deg, rgba(9,13,12,0.86) 0%, rgba(9,13,12,0.96) 100%), url(/logo.png)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.84) 0%, rgba(231,246,237,0.94) 100%), url(/logo.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <Container maxWidth="lg">
        <Paper elevation={7} sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="h3" sx={{ lineHeight: 1 }}>
                  Fut sorteio
                </Typography>
                <Fab
                  size="small"
                  color="primary"
                  aria-label="apoiar-projeto"
                  onClick={() => setOpenDonationModal(true)}
                  sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                  title="Apoiar este projeto"
                >
                  <FavoriteBorderRounded fontSize="small" />
                </Fab>
              </Box>
              <Typography variant="body1" color="text.secondary">
                Escolha pelada casual ou campeonato.
              </Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={() =>
                    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'))
                  }
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {themeMode === 'dark' ? (
                    <DarkModeRounded fontSize="small" />
                  ) : (
                    <LightModeRounded fontSize="small" />
                  )}
                  <Typography variant="body2">
                    {themeMode === 'dark' ? 'Tema escuro' : 'Tema claro'}
                  </Typography>
                </Box>
              }
            />
          </Box>
        </Paper>

        <Paper elevation={4} sx={{ p: { xs: 2, md: 3 } }}>
          <Tabs
            value={appMode}
            onChange={(_, value: AppMode) => setAppMode(value)}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab
              value="pelada"
              icon={<SportsSoccerRounded />}
              iconPosition="start"
              label="Pelada"
              sx={{ textTransform: 'none' }}
            />
            <Tab
              value="campeonato"
              icon={<EmojiEventsRounded />}
              iconPosition="start"
              label="Campeonato"
              sx={{ textTransform: 'none' }}
            />
          </Tabs>

          {appMode === 'pelada' && (
            <>
              <Tabs
                value={peladaView}
                onChange={(_, value: PeladaView) => setPeladaView(value)}
                variant="fullWidth"
                sx={{ mb: 2 }}
              >
                <Tab value="config" label="Configuração" sx={{ textTransform: 'none' }} />
                <Tab value="resultado" label="Sorteio e resultado" sx={{ textTransform: 'none' }} />
              </Tabs>

              {peladaView === 'config' && (
                <>
                  <TeamSetup
                    teamCount={teamCount}
                    setTeamCount={handleTeamCountChange}
                    linePlayers={linePlayers}
                    setLinePlayers={handleLinePlayersChange}
                  />
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Button
                        variant={playerInputMode === 'individual' ? 'contained' : 'outlined'}
                        onClick={() => setPlayerInputMode('individual')}
                        sx={{ textTransform: 'none' }}
                      >
                        Adicionar individualmente
                      </Button>
                      <Button
                        variant={playerInputMode === 'paste' ? 'contained' : 'outlined'}
                        onClick={() => setPlayerInputMode('paste')}
                        sx={{ textTransform: 'none' }}
                      >
                        Colar lista de nomes
                      </Button>
                    </Stack>
                    {playerInputMode === 'individual' ? (
                      <PlayerSetup
                        playerSlots={playerSlots}
                        players={players}
                        setPlayers={setPlayers}
                      />
                    ) : (
                      <PlayerListPaste
                        maxPlayers={playerSlots}
                        isConfigured={isConfigured}
                        onSubmit={(names) => {
                          setPlayers(names);
                          handleDrawAndGoToResult(names);
                        }}
                      />
                    )}
                  </Paper>
                  {playerInputMode === 'individual' && (
                    <Button
                      variant="contained"
                      onClick={() => handleDrawAndGoToResult()}
                      disabled={!canDraw}
                      sx={{ textTransform: 'none' }}
                    >
                      Sortear times e ver resultado
                    </Button>
                  )}
                </>
              )}

              {peladaView === 'resultado' && (
                <Stack spacing={2}>
                  <TeamDraw
                    teams={teams}
                    helperText={
                      linePlayers > 0
                        ? `${teamCount} times de até ${linePlayers} jogadores na linha; goleiros ficam fora do sorteio`
                        : 'Preencha as configurações para sortear'
                    }
                  />
                  <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                    <Button
                      variant="outlined"
                      onClick={() => handleDrawTeams()}
                      disabled={!canDraw}
                      sx={{ textTransform: 'none' }}
                    >
                      Sortear novamente
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleResetForNewDraw}
                      sx={{ textTransform: 'none' }}
                    >
                      Sortear novos times
                    </Button>
                  </Stack>
                </Stack>
              )}
            </>
          )}

          {appMode === 'campeonato' && <ChampionshipSetup />}
        </Paper>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2, color: theme.palette.text.secondary }}
        >
          © 2026 Hudson Kennedy
        </Typography>
      </Container>

      <Fab
        color="primary"
        aria-label="apoiar-projeto"
        onClick={() => setOpenDonationModal(true)}
        sx={{
          display: { xs: 'none', sm: 'inline-flex' },
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
        title="Apoiar este projeto"
      >
        <FavoriteBorderRounded />
      </Fab>

      {installPrompt.visible && (
        <InstallBanner
          showIOSHint={installPrompt.showIOSHint}
          onInstall={installPrompt.install}
          onDismiss={installPrompt.dismiss}
        />
      )}

      <DonationModal
        open={openDonationModal}
        onClose={() => {
          setOpenDonationModal(false);
          dismissDonationPrompt();
        }}
      />
    </Box>
  );
}
