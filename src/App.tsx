// App.jsx
import { useState } from "react";
import PlayerSetup from "./components/PlayerSetup";
import TeamSetup from "./components/TeamSetup";
import TeamDraw from "./components/TeamDraw";
import { Container, Typography } from "@mui/material";

export default function App() {
  const [playerCount, setPlayerCount] = useState(0);
  const [players, setPlayers] = useState<string[]>([]);
  const [teamCount, setTeamCount] = useState(2);
  const [teams, setTeams] = useState<string[][]>([]);

  const handleDrawTeams = () => {
    const shuffled = players
      .map((p) => ({ p, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ p }) => p);

    const result: string[][] = Array.from({ length: teamCount }, () => []);
    shuffled.forEach((player, index) => {
      result[index % teamCount].push(player);
    });
    setTeams(result);
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        py: 4,
        backgroundImage: "url(/logo2.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ color: "#fff" }}
        bgcolor={"#00000080"}
        p={2}
        borderRadius={2}
      >
        Sorteador de Times
      </Typography>
      <PlayerSetup
        playerCount={playerCount}
        setPlayerCount={setPlayerCount}
        players={players}
        setPlayers={setPlayers}
      />
      <TeamSetup teamCount={teamCount} setTeamCount={setTeamCount} />
      <TeamDraw teams={teams} onDraw={handleDrawTeams} />
      
      <Typography variant="h6"
        align="center"
        gutterBottom
        sx={{ color: "#fff" }}
        bgcolor={"#00000080"}
        p={2}
        borderRadius={2} >&copy; 2025 Hudson Kennedy</Typography>
    </Container>
  );
}
