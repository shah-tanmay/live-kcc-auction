// components/AdminPanel.js
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Avatar,
  keyframes,
  styled,
  Paper,
  AppBar,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import {
  SportsCricket,
  AccountBalanceWallet,
  Whatshot,
} from "@mui/icons-material";
import { formatPoints } from "@/utils/formatPoints";
import { io } from "socket.io-client";

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const AnimatedCard = styled(Card)({
  animation: `${pulse} 1.5s ease-in-out infinite`,
  border: "2px solid #ff4444",
  background: "linear-gradient(45deg, #fff5f5, #ffffff)",
});

export default function AdminPanel() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([
    { name: "Mumbai Indians", purse: 48200000, color: "#004ba0" },
    { name: "Chennai Super Kings", purse: 46500000, color: "#fdb913" },
    { name: "Kolkata Riders", purse: 45500000, color: "#2e0854" },
  ]);
  const [hasMounted, setHasMounted] = useState(false);
  const [unsoldPlayers, setUnsoldPlayers] = useState([]);
  const router = useRouter();

  //   useEffect(() => {
  // if (!document.cookie.includes("adminToken")) router.push("/admin");
  //   }, []);

  const handleNextPlayer = () => {
    setCurrentPlayer({
      name: "Jasprit Bumrah",
      basePrice: 180000,
      role: "Bowler",
      stats: { matches: 210, wickets: 320 },
    });
  };

  const handleUnsold = async () => {
    try {
      const res = await fetch(`/api/players/${player.id}/unsold`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await res.json();

      if(!res.ok) {
        alert(`Error: ${data.error}`);
        return;
      }

      setPlayer(null);

      alert("Player Unsold")
    } catch(error) {
      console.error("Error handling unsold player:", error);
      alert("Something went wrong while marking the player as unsold.");
    }
  }

  const handleSold = async () => {
    try {
      const res = await fetch(`/api/players/${player.id}/sell`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle and show the error message from the server
        console.error("Bid failed:", data.error);
        alert(`Error: ${data.error}`);
        return;
      }

      // Bid was successful
      // alert("Player Sold!");
      setPlayer(null);

      // You could also update state or UI here if needed
    } catch (error) {
      console.error("Unexpected error placing bid:", error);
      alert("Something went wrong while placing the bid.");
    }
  };

  const [purseData, setPurseData] = useState([]);
  const [currentBid, setCurrentBid] = useState("No Bids Yet");
  const [currentBidTeamName, setCurrentBidTeamName] = useState("No Team Yet");
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    setHasMounted(true);
    const socket = io("/", { path: "/socket.io" });
    fetch("/api/teams/purse")
      .then((res) => res.json())
      .then((data) => {
        setPurseData(data);
        setLoading(false);
      });

    socket.on("newBid", (data) => {
      setCurrentBid(data.amount);
      setCurrentBidTeamName(data.teamName);
    });
  }, []);

  if (!hasMounted || loading || !purseData) return null;

  const getNextPlayerOrCurrentBidPlayer = () => {
    fetch("/api/auction/next-player")
      .then((res) => res.json())
      .then((data) => {
        const player = {
          id: data._id,
          name: data.name,
          role: data.role,
          basePrice: data.basePrice,
          photoUrl: data.photoUrl,
        };
        setPlayer(player);
      })
      .catch((error) => {
        console.log(error, "Error fetching next player");
      });
  };

  const handleBid = async () => {
    const playerId = player.id;
    const teamId = selectedTeam;
    const bidAmount = parseInt(currentBid);
    console.log(playerId, teamId, bidAmount, typeof bidAmount);
    try {
      const res = await fetch("/api/auction/post-bid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playerId, teamId, bidAmount }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle and show the error message from the server
        console.error("Bid failed:", data.error);
        alert(`Error: ${data.error}`);
        return;
      }

      // Bid was successful
      console.log("Bid placed:", data.bid);
      // alert("Bid placed successfully!");

      // You could also update state or UI here if needed
    } catch (error) {
      console.error("Unexpected error placing bid:", error);
      alert("Something went wrong while placing the bid.");
    }
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <AppBar position="static" color="inherit" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <SportsCricket sx={{ mr: 2, color: "primary.main" }} />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Premier Auction
            </Typography>
            <Button variant="contained" color="primary">
              Squad
            </Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Container
        maxWidth="xl"
        sx={{
          py: 4,
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid container spacing={3} sx={{ height: "100%" }}>
          {/* Left Column */}
          <Grid item xs={8} spacing={10} sx={{ pr: 3, height: "100%" }}>
            {/* Current Player Card */}

            {player && (
              <Card
                elevation={2}
                sx={{
                  mb: 3,
                  borderLeft: "4px solid #1976d2",
                  minWidth: isMobile ? 0 : 500,
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Chip
                      label="LIVE"
                      color="error"
                      size="small"
                      sx={{ mr: 2 }}
                    />
                    <Typography variant="h5" component="div">
                      {player.name}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Avatar
                        src={player.photoUrl}
                        sx={{ width: 120, height: 120, mb: 2, mx: "auto" }}
                      />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Grid container spacing={10}>
                        <DetailItem label="Role" value={player.role} />
                        <DetailItem
                          label="Base Price"
                          value={formatPoints(2000)}
                        />
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            {!player && (
              <Button
                variant="contained"
                size="large"
                onClick={getNextPlayerOrCurrentBidPlayer}
                sx={{
                  py: 2,
                  px: 6,
                  fontSize: "1.2rem",
                  borderRadius: 2,
                  background: "linear-gradient(45deg, #1976d2, #004ba0)",
                  mb: "50px",
                }}
              >
                Start Auction - Next Player
              </Button>
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                displayEmpty
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="" disabled>
                  Select Team
                </MenuItem>
                {purseData.map((team, index) => (
                  <MenuItem key={index} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                type="number"
                value={currentBid}
                onChange={(e) => setCurrentBid(e.target.value)}
                label="Bid Amount"
                variant="outlined"
                sx={{ maxWidth: 150 }}
              />
              <Button
                variant="contained"
                color="success"
                onClick={handleBid}
                disabled={!selectedTeam || !currentBid}
                sx={{ px: 4 }}
              >
                Bid
              </Button>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "space-between",
                justifyContent: "space-between",
                gap: 2,
                mb: 3,
              }}
            >
              <Button variant="contained" color="error" sx={{ px: 4 }} onClick={handleUnsold}>
                UnSold!
              </Button>

              <Button
                variant="contained"
                color="info"
                sx={{ px: 4 }}
                onClick={handleSold}
              >
                Sold!
              </Button>
            </Box>

            <AnimatedCard sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Whatshot sx={{ color: "#ff4444", mr: 1 }} />
                  <Typography variant="h6" component="div">
                    Current Bid
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      component="div"
                      sx={{ fontWeight: 700 }}
                    >
                      {formatPoints(currentBid)}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="div"
                      color="text.secondary"
                    >
                      {currentBidTeamName}
                    </Typography>
                  </Box>
                  <Chip
                    label="ACTIVE"
                    color="success"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
              </CardContent>
            </AnimatedCard>
          </Grid>

          {/* Right Column */}
          <Grid
            item
            xs={4}
            sx={{ pl: 3, borderLeft: "1px solid #eee", height: "100%" }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Team Purses */}
              <Card elevation={2} sx={{ mb: 3, maxWidth: 400 }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, display: "flex", alignItems: "center" }}
                  >
                    <AccountBalanceWallet
                      sx={{ mr: 1, color: "primary.main" }}
                    />
                    Team Purses
                  </Typography>
                  <Grid container spacing={1}>
                    {purseData.length > 0 ? (
                      purseData.map((team, index) => (
                        <Grid item xs={6} key={index}>
                          <PurseItem {...team} />
                        </Grid>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Loading purse data…
                      </Typography>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Unsold Players */}
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    Unsold Players ({unsoldPlayers.length})
                  </Typography>
                  <List dense>
                    {unsoldPlayers.map((player, index) => (
                      <ListItem key={index} sx={{ py: 1 }}>
                        <ListItemText
                          primary={player.name}
                          secondary={
                            <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                              <Chip label={player.role} size="small" />
                              <Typography variant="caption">
                                Base: ₹{player.basePrice.toLocaleString()}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

const DetailItem = ({ label, value }) => (
  <Grid item xs={6}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h6" fontWeight={600}>
      {value}
    </Typography>
  </Grid>
);

const PurseItem = ({ name, remainingPurse, maxBidAllowed }) => {
  if (!name || !remainingPurse || !maxBidAllowed)
    return (
      <Typography variant="body2" color="text.secondary">
        Loading...
      </Typography>
    );
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        border: "1px solid #eee",
        borderRadius: 1,
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
        {name}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        <Grid container spacing={3} alignItems="center" direction="row">
          <Grid item>{formatPoints(remainingPurse)}</Grid>
          <Chip
            label={formatPoints(maxBidAllowed)}
            size="small"
            color="error"
            sx={{ fontSize: 20 }}
          />
        </Grid>
      </Typography>
    </Paper>
  );
};
