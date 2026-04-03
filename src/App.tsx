import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  FormControlLabel,
  Paper,
  Switch,
  Tab,
  Tabs,
  Typography,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import DarkModeRounded from '@mui/icons-material/DarkModeRounded';
import LightModeRounded from '@mui/icons-material/LightModeRounded';
import SportsSoccerRounded from '@mui/icons-material/SportsSoccerRounded';
import EmojiEventsRounded from '@mui/icons-material/EmojiEventsRounded';
import PlayerSetup from './components/PlayerSetup';
import TeamSetup from './components/TeamSetup';
import TeamDraw from './components/TeamDraw';
import ChampionshipSetup from './components/ChampionshipSetup';

type AppMode = 'pelada' | 'campeonato';
type PeladaView = 'config' | 'resultado';

const APP_STORAGE_KEY = 'sorteio.app.v1';

export default function App() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [appMode, setAppMode] = useState<AppMode>('pelada');
  const [peladaView, setPeladaView] = useState<PeladaView>('config');

  const [playerCount, setPlayerCount] = useState(0);
  const [players, setPlayers] = useState<string[]>([]);
  const [linePlayers, setLinePlayers] = useState(0);
  const [teamCount, setTeamCount] = useState(0);
  const [teams, setTeams] = useState<string[][]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(APP_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as {
        themeMode?: 'light' | 'dark';
        appMode?: AppMode;
        playerCount?: number;
        players?: string[];
        linePlayers?: number;
        teamCount?: number;
        teams?: string[][];
      };

      if (parsed.themeMode === 'dark' || parsed.themeMode === 'light') {
        setThemeMode(parsed.themeMode);
      }
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
      if (Array.isArray(parsed.teams)) {
        setTeams(
          parsed.teams.map((team) =>
            Array.isArray(team)
              ? team.filter((item): item is string => typeof item === 'string')
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
      teams,
    };
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(payload));
  }, [themeMode, appMode, playerCount, players, linePlayers, teamCount, teams]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          primary: {
            main: '#00a96e',
          },
          secondary: {
            main: '#0067c5',
          },
          background:
            themeMode === 'dark'
              ? {
                  default: '#0f1412',
                  paper: 'rgba(16, 25, 21, 0.88)',
                }
              : {
                  default: '#eef8f2',
                  paper: 'rgba(255, 255, 255, 0.88)',
                },
        },
        shape: {
          borderRadius: 16,
        },
        typography: {
          fontFamily: '"Baloo 2", "Roboto", sans-serif',
        },
      }),
    [themeMode],
  );

  const filledPlayers = players.map((p) => p.trim()).filter(Boolean);
  const effectiveLinePlayers = linePlayers > 0 ? linePlayers : 1;
  const estimatedTeams = Math.floor(filledPlayers.length / (effectiveLinePlayers + 1));
  const canDraw = linePlayers > 0 && teamCount >= 2 && estimatedTeams >= teamCount && estimatedTeams >= 2;

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

  const handleDrawAndGoToResult = () => {
    handleDrawTeams();
    if (canDraw) {
      setPeladaView('resultado');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
                <Typography variant="h3" sx={{ lineHeight: 1 }}>
                  Sorteio dos Times
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Escolha entre pelada casual ou campeonato com chaveamento.
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
                    <TeamSetup
                      teamCount={teamCount}
                      setTeamCount={setTeamCount}
                      linePlayers={linePlayers}
                      setLinePlayers={setLinePlayers}
                      estimatedTeams={estimatedTeams}
                    />
                    <PlayerSetup
                      playerCount={playerCount}
                      setPlayerCount={setPlayerCount}
                      players={players}
                      setPlayers={setPlayers}
                    />
                    <Button
                      variant="contained"
                      onClick={handleDrawAndGoToResult}
                      disabled={!canDraw}
                    >
                      Sortear times e ver resultado
                    </Button>
                  </>
                )}

                {peladaView === 'resultado' && (
                  <TeamDraw
                    teams={teams}
                    helperText={linePlayers > 0 ? `Com os jogadores preenchidos e ${linePlayers} na linha + goleiro, você consegue montar até ${estimatedTeams} times.` : 'Preencha as configurações para sortear'}
                  />
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
      </Box>
    </ThemeProvider>
  );
}
