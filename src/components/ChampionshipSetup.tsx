import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { exportElementAsPdf, exportElementAsPng } from '../utils/export';

interface Match {
  teamA: string;
  teamB: string;
  scoreA: string;
  scoreB: string;
  winner: string;
}

type ChampionshipView = 'config' | 'chaveamento';

const CHAMPIONSHIP_STORAGE_KEY = 'sorteio.campeonato.v1';

function nextPowerOfTwo(value: number): number {
  let power = 1;
  while (power < value) {
    power *= 2;
  }
  return power;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function resolveWinner(match: Match): string {
  const teamA = match.teamA.trim();
  const teamB = match.teamB.trim();

  if (!teamA && !teamB) {
    return '';
  }
  if (teamA === 'BYE' && teamB && teamB !== 'BYE') {
    return teamB;
  }
  if (teamB === 'BYE' && teamA && teamA !== 'BYE') {
    return teamA;
  }
  if (teamA && !teamB) {
    return teamA;
  }
  if (teamB && !teamA) {
    return teamB;
  }
  if (teamA === 'BYE' && teamB === 'BYE') {
    return '';
  }

  const scoreA = Number(match.scoreA);
  const scoreB = Number(match.scoreB);
  if (!Number.isNaN(scoreA) && !Number.isNaN(scoreB) && scoreA !== scoreB) {
    return scoreA > scoreB ? teamA : teamB;
  }

  return '';
}

function recomputeBracket(inputRounds: Match[][]): Match[][] {
  const rounds = inputRounds.map((round) => round.map((match) => ({ ...match })));
  if (rounds.length === 0) {
    return rounds;
  }

  for (let roundIdx = 1; roundIdx < rounds.length; roundIdx += 1) {
    rounds[roundIdx] = rounds[roundIdx].map(() => ({
      teamA: '',
      teamB: '',
      scoreA: '',
      scoreB: '',
      winner: '',
    }));
  }

  for (let roundIdx = 0; roundIdx < rounds.length; roundIdx += 1) {
    rounds[roundIdx].forEach((match, matchIdx) => {
      const winner = resolveWinner(match);
      match.winner = winner;

      if (roundIdx < rounds.length - 1) {
        const nextMatch = rounds[roundIdx + 1][Math.floor(matchIdx / 2)];
        if (!nextMatch) {
          return;
        }
        if (matchIdx % 2 === 0) {
          nextMatch.teamA = winner;
        } else {
          nextMatch.teamB = winner;
        }
      }
    });
  }

  return rounds;
}

function createInitialBracket(teams: string[]): Match[][] {
  if (teams.length < 2) {
    return [];
  }

  const bracketSize = nextPowerOfTwo(teams.length);
  const seeded = [...shuffle(teams), ...Array.from({ length: bracketSize - teams.length }, () => 'BYE')];

  const rounds: Match[][] = [];
  const firstRound: Match[] = [];
  for (let i = 0; i < seeded.length; i += 2) {
    firstRound.push({
      teamA: seeded[i],
      teamB: seeded[i + 1],
      scoreA: '',
      scoreB: '',
      winner: '',
    });
  }
  rounds.push(firstRound);

  let matchesInRound = firstRound.length;
  while (matchesInRound > 1) {
    matchesInRound /= 2;
    const round: Match[] = [];
    for (let i = 0; i < matchesInRound; i += 1) {
      round.push({ teamA: '', teamB: '', scoreA: '', scoreB: '', winner: '' });
    }
    rounds.push(round);
  }

  return recomputeBracket(rounds);
}

export default function ChampionshipSetup() {
  const teamsPerPage = 10;

  const [view, setView] = useState<ChampionshipView>('config');
  const [teamCount, setTeamCount] = useState(8);
  const [teamNames, setTeamNames] = useState<string[]>(Array.from({ length: 8 }, () => ''));
  const [teamPage, setTeamPage] = useState(0);
  const [rounds, setRounds] = useState<Match[][]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const bracketRef = useRef<HTMLDivElement | null>(null);

  const filledTeams = useMemo(
    () => teamNames.map((name) => name.trim()).filter(Boolean),
    [teamNames],
  );

  const totalTeamPages = Math.max(1, Math.ceil(teamNames.length / teamsPerPage));
  const startIndex = teamPage * teamsPerPage;
  const currentTeams = teamNames.slice(startIndex, startIndex + teamsPerPage);

  useEffect(() => {
    if (teamPage > totalTeamPages - 1) {
      setTeamPage(totalTeamPages - 1);
    }
  }, [teamPage, totalTeamPages]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHAMPIONSHIP_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as {
        teamCount?: number;
        teamNames?: string[];
        rounds?: Match[][];
      };

      if (typeof parsed.teamCount === 'number' && parsed.teamCount >= 2 && parsed.teamCount <= 32) {
        setTeamCount(parsed.teamCount);
      }
      if (Array.isArray(parsed.teamNames)) {
        setTeamNames(parsed.teamNames.filter((item): item is string => typeof item === 'string'));
      }
      if (Array.isArray(parsed.rounds)) {
        setRounds(parsed.rounds);
      }
    } catch {
      localStorage.removeItem(CHAMPIONSHIP_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const payload = { teamCount, teamNames, rounds };
    localStorage.setItem(CHAMPIONSHIP_STORAGE_KEY, JSON.stringify(payload));
  }, [teamCount, teamNames, rounds]);

  const handleTeamCountChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value === '') {
      return;
    }

    const value = Number(e.target.value);
    if (Number.isNaN(value) || value < 2 || value > 32) {
      return;
    }
    setTeamCount(value);
    setTeamNames((prev) => Array.from({ length: value }, (_, idx) => prev[idx] || ''));
    setRounds([]);
  };

  const handleTeamNameChange = (index: number, value: string) => {
    const updated = [...teamNames];
    updated[index] = value;
    setTeamNames(updated);
  };

  const handleGenerateBracket = () => {
    setRounds(createInitialBracket(filledTeams));
    setView('chaveamento');
  };

  const handleScoreChange = (
    roundIdx: number,
    matchIdx: number,
    side: 'A' | 'B',
    value: string,
  ) => {
    if (value !== '' && !/^\d+$/.test(value)) {
      return;
    }

    setRounds((prev) => {
      const cloned = prev.map((round) => round.map((match) => ({ ...match })));
      const match = cloned[roundIdx]?.[matchIdx];
      if (!match) {
        return prev;
      }

      if (side === 'A') {
        match.scoreA = value;
      } else {
        match.scoreB = value;
      }

      return recomputeBracket(cloned);
    });
  };

  const handleExport = async (type: 'png' | 'pdf') => {
    if (!bracketRef.current || rounds.length === 0) {
      return;
    }

    setIsExporting(true);
    try {
      if (type === 'png') {
        await exportElementAsPng(bracketRef.current, 'campeonato-chaveamento.png');
      } else {
        await exportElementAsPdf(bracketRef.current, 'campeonato-chaveamento.pdf');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const getRoundTitle = (roundIdx: number) => {
    const remainingRounds = rounds.length - roundIdx;
    if (remainingRounds === 1) {
      return 'Final';
    }
    if (remainingRounds === 2) {
      return 'Semifinal';
    }
    if (remainingRounds === 3) {
      return 'Quartas';
    }
    return `Rodada ${roundIdx + 1}`;
  };

  return (
    <Box>
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Configuração do campeonato
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Informe os times e gere um chaveamento eliminatório automático.
        </Typography>

        <Tabs
          value={view}
          onChange={(_, value: ChampionshipView) => setView(value)}
          variant="fullWidth"
          sx={{ mb: 2 }}
        >
          <Tab value="config" label="Configuração" />
          <Tab value="chaveamento" label="Chaveamento" />
        </Tabs>

        {view === 'config' && (
          <>
            <TextField
              type="number"
              label="Quantidade de times"
              inputProps={{ min: 2, max: 32 }}
              value={teamCount}
              onChange={handleTeamCountChange}
              onFocus={(e) => e.target.select()}
              size="small"
              sx={{ width: { xs: '100%', sm: 240 }, mb: 2 }}
              helperText="Mínimo 2 e máximo 32"
            />

            {teamNames.length > 0 && (
              <Stack
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setTeamPage((prev) => Math.max(0, prev - 1))}
                  disabled={teamPage === 0}
                >
                  Anterior
                </Button>
                <Typography variant="body2" color="text.secondary">
                  Página {teamPage + 1} de {totalTeamPages}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setTeamPage((prev) => Math.min(totalTeamPages - 1, prev + 1))}
                  disabled={teamPage >= totalTeamPages - 1}
                >
                  Próxima
                </Button>
              </Stack>
            )}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 1,
                mb: 2,
              }}
            >
              {currentTeams.map((team, index) => {
                const teamIndex = startIndex + index;
                return (
                  <TextField
                    key={teamIndex}
                    label={`Time ${teamIndex + 1}`}
                    value={team}
                    onChange={(e) => handleTeamNameChange(teamIndex, e.target.value)}
                    size="small"
                    fullWidth
                  />
                );
              })}
            </Box>

            <Button
              variant="contained"
              onClick={handleGenerateBracket}
              disabled={filledTeams.length < 2}
            >
              Gerar chaveamento
            </Button>
          </>
        )}

        {view === 'chaveamento' && rounds.length === 0 && (
          <Alert severity="info">Gere um chaveamento na aba de configuração para iniciar.</Alert>
        )}
      </Paper>

      {view === 'chaveamento' && rounds.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="h6">Chaveamento</Typography>
            <Stack direction="row" spacing={1}>
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
          </Stack>

          {isExporting && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Gerando arquivo para download...
            </Alert>
          )}

          <Divider sx={{ mb: 2 }} />

          <Stack ref={bracketRef} direction="row" spacing={2} useFlexGap flexWrap="wrap">
            {rounds.map((round, roundIdx) => (
              <Paper
                key={roundIdx}
                elevation={2}
                sx={{ p: 2, minWidth: 230, flex: '1 1 230px' }}
              >
                <Typography variant="subtitle1" sx={{ mb: 1.5 }}>
                  {getRoundTitle(roundIdx)}
                </Typography>

                <Stack spacing={1}>
                  {round.map((match, matchIdx) => (
                    <Paper
                      key={matchIdx}
                      variant="outlined"
                      sx={{ p: 1.2, borderRadius: 2 }}
                    >
                      <Typography variant="body2">{match.teamA || '-'}</Typography>
                      <Typography variant="body2">{match.teamB || '-'}</Typography>
                      <Stack direction="row" spacing={1} sx={{ my: 1 }}>
                        <TextField
                          size="small"
                          type="number"
                          value={match.scoreA}
                          onChange={(e) =>
                            handleScoreChange(roundIdx, matchIdx, 'A', e.target.value)
                          }
                          disabled={!match.teamA || match.teamA === 'BYE' || !match.teamB || match.teamB === 'BYE'}
                          inputProps={{ min: 0 }}
                          sx={{ width: 90 }}
                        />
                        <TextField
                          size="small"
                          type="number"
                          value={match.scoreB}
                          onChange={(e) =>
                            handleScoreChange(roundIdx, matchIdx, 'B', e.target.value)
                          }
                          disabled={!match.teamA || match.teamA === 'BYE' || !match.teamB || match.teamB === 'BYE'}
                          inputProps={{ min: 0 }}
                          sx={{ width: 90 }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Vencedor: {match.winner || 'A definir'}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
