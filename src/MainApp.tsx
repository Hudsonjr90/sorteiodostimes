import { useEffect, useState, type Dispatch, type SetStateAction, type ChangeEvent } from 'react';
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
  TextField,
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

  const [playerCount, setPlayerCount] = useState(0);
  const [players, setPlayers] = useState<string[]>([]);
  const [linePlayers, setLinePlayers] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [countGoalkeeper, setCountGoalkeeper] = useState(false);
  const [teams, setTeams] = useState<string[][]>([]);

  const [openDonationModal, setOpenDonationModal] = useState(false);
  const { shouldShow: shouldShowDonationModal } = useDonationPrompt(playerCount);
  const installPrompt = useInstallPrompt();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(APP_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as {
        appMode?: AppMode;
        playerCount?: number;
        players?: string[];
        linePlayers?: number;
        teamCount?: number;
        countGoalkeeper?: boolean;
        teams?: string[][];
      };

      if (parsed.appMode === 'pelada' || parsed.appMode === 'campeonato') {
        setAppMode(parsed.appMode);
      }
      if (typeof parsed.playerCount === 'number' && parsed.playerCount >= 0) {
        setPlayerCount(parsed.playerCount);
      }
      if (Array.isArray(parsed.players)) {
        setPlayers(parsed.players.filter((item): item is string => typeof item === 'string'));
      }
      if (typeof parsed.linePlayers === 'number' && parsed.linePlayers >= 0) {
        setLinePlayers(parsed.linePlayers);
      }
      if (typeof parsed.teamCount === 'number' && parsed.teamCount >= 0) {
        setTeamCount(parsed.teamCount);
      }
      if (typeof parsed.countGoalkeeper === 'boolean') {
        setCountGoalkeeper(parsed.countGoalkeeper);
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
      playerCount,
      players,
      linePlayers,
      teamCount,
      countGoalkeeper,
      teams,
    };
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(payload));
  }, [themeMode, appMode, playerCount, players, linePlayers, teamCount, countGoalkeeper, teams]);

  useEffect(() => {
    if (shouldShowDonationModal) {
      setOpenDonationModal(true);
    }
  }, [shouldShowDonationModal]);

  const filledPlayers = players.map((p) => p.trim()).filter(Boolean);
  const effectiveLinePlayers = linePlayers > 0 ? linePlayers : 1;
  const playersPerTeam = countGoalkeeper ? effectiveLinePlayers + 1 : effectiveLinePlayers;
  const estimatedTeams = Math.floor(playerCount / playersPerTeam);
  const teamSize = countGoalkeeper ? linePlayers + 1 : linePlayers;
  const canDraw =
    linePlayers > 0 &&
    teamCount >= 2 &&
    estimatedTeams >= teamCount &&
    estimatedTeams >= 2 &&
    filledPlayers.length >= teamCount * teamSize;

  useEffect(() => {
    if (linePlayers === 0 || estimatedTeams < 2) {
      setTeamCount(0);
      return;
    }
    if (teamCount > estimatedTeams) {
      setTeamCount(estimatedTeams);
    }
  }, [estimatedTeams, teamCount, linePlayers]);

  const handleDrawTeams = () => {
    if (!canDraw) {
      return;
    }

    const shuffled = filledPlayers
      .map((p) => ({ p, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ p }) => p);

    const result: string[][] = Array.from({ length: teamCount }, () => []);
    shuffled.forEach((player, index) => {
      result[index % teamCount].push(player);
    });
    setTeams(result);
  };

  const handleCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      setPlayerCount(0);
      setPlayers([]);
      setTeams([]);
      return;
    }
    const count = Number(e.target.value);
    if (Number.isNaN(count) || count < 1) {
      return;
    }
    setPlayerCount(count);
    setPlayers((prev) => Array.from({ length: count }, (_, i) => prev[i] || ''));
    setTeams([]);
  };

  const handleDrawAndGoToResult = () => {
    handleDrawTeams();
    if (canDraw) {
      setPeladaView('resultado');
    }
  };

  const handleResetForNewDraw = () => {
    // Limpa a lista atual para novo sorteio com novos nomes.
    setPlayers(Array.from({ length: playerCount }, () => ''));
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
            />
            <Tab
              value="campeonato"
              icon={<EmojiEventsRounded />}
              iconPosition="start"
              label="Campeonato"
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
                <Tab value="config" label="Configuração" />
                <Tab value="resultado" label="Sorteio e resultado" />
              </Tabs>

              {peladaView === 'config' && (
                <>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Quantos jogadores vão jogar?
                    </Typography>
                    <TextField
                      label="Número total de jogadores"
                      type="number"
                      inputProps={{ min: 1 }}
                      value={playerCount === 0 ? '' : playerCount}
                      onChange={handleCountChange}
                      onFocus={(e) => e.target.select()}
                      variant="outlined"
                      size="small"
                      sx={{ mt: 1, maxWidth: 240 }}
                      fullWidth
                      helperText="Digite o total para liberar a configuração"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={countGoalkeeper}
                          onChange={(e) => setCountGoalkeeper(e.target.checked)}
                          size="small"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          {countGoalkeeper ? 'Com goleiro fixo por time' : 'Sem goleiro fixo (rotativo)'}
                        </Typography>
                      }
                      sx={{ mt: 1.5, display: 'flex', alignItems: 'center' }}
                    />
                  </Paper>

                  {playerCount > 0 && (
                    <>
                      <TeamSetup
                        teamCount={teamCount}
                        setTeamCount={setTeamCount}
                        linePlayers={linePlayers}
                        setLinePlayers={setLinePlayers}
                        estimatedTeams={estimatedTeams}
                        countGoalkeeper={countGoalkeeper}
                      />
                      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                          <Button
                            variant={playerInputMode === 'individual' ? 'contained' : 'outlined'}
                            onClick={() => setPlayerInputMode('individual')}
                          >
                            Adicionar individualmente
                          </Button>
                          <Button
                            variant={playerInputMode === 'paste' ? 'contained' : 'outlined'}
                            onClick={() => setPlayerInputMode('paste')}
                          >
                            Colar lista de nomes
                          </Button>
                        </Stack>
                        {playerInputMode === 'individual' ? (
                          <PlayerSetup
                            playerCount={playerCount}
                            players={players}
                            setPlayers={setPlayers}
                          />
                        ) : (
                          <PlayerListPaste
                            maxPlayers={playerCount}
                            onSubmit={(names) => {
                              setPlayers(names);
                              setTimeout(() => handleDrawAndGoToResult(), 100);
                            }}
                          />
                        )}
                      </Paper>
                      {playerInputMode === 'individual' && (
                        <Button
                          variant="contained"
                          onClick={handleDrawAndGoToResult}
                          disabled={!canDraw}
                          sx={{ textTransform: 'none' }}
                        >
                          Sortear times e ver resultado
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}

              {peladaView === 'resultado' && (
                <Stack spacing={2}>
                  <TeamDraw
                    teams={teams}
                    helperText={
                      linePlayers > 0
                        ? `${teamCount} times de ${linePlayers} na linha${countGoalkeeper ? ' + goleiro' : ''} (${teamSize} por time)`
                        : 'Preencha as configurações para sortear'
                    }
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleResetForNewDraw}
                    sx={{ textTransform: 'none', alignSelf: 'flex-center' }}
                  >
                    Sortear novos times
                  </Button>
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
