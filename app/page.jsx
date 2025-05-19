"use client";

import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Button,
  Box,
  useMediaQuery,
  keyframes,
  styled,
} from "@mui/material";
import {
  SportsCricket,
  Whatshot,
  AccountBalanceWallet,
} from "@mui/icons-material";
import { io } from "socket.io-client";
import { formatPoints } from "@/utils/formatPoints";

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const AnimatedCard = styled(Card)(() => ({
  animation: `${pulse} 1.5s ease-in-out infinite`,
  background: "linear-gradient(45deg, #fff5f5, #fff)",
  border: "2px solid #ff4444",
  boxShadow: "0 4px 20px rgba(255, 68, 68, 0.15)",
}));

const AuctionUI = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [currentBid, setCurrentBid] = useState("No Bids Yet");
  const [currentBidTeamName, setCurrentBidTeamName] = useState("No Team Yet");
  const [purseData, setPurseData] = useState([]);
  const [hasMounted, setHasMounted] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [playerSold, setPlayerSold] = useState(null);

  const fetchPurseData = async () => {
    fetch("/api/teams/purse")
      .then((res) => res.json())
      .then((data) => setPurseData(data));
  };

  useEffect(() => {
    setHasMounted(true);
    const socket = io("/", { path: "/socket.io" });

    fetchPurseData();

    socket.on("newBid", (data) => {
      setCurrentBid(data.amount);
      setCurrentBidTeamName(data.teamName);
    });

    socket.on("newPlayer", (data) => {
      setCurrentPlayer(data.player);
      setPlayerSold(null);
      setCurrentBid("No Bids Yet");
      setCurrentBidTeamName("No Team Yet");
    });

    socket.on("playerSold", async (data) => {
      setPlayerSold(data);
      await fetchPurseData();
    });
  }, []);

  if (!hasMounted) return null;

  return (
    <Box sx={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <AppBar position="static" color="inherit" elevation={1}>
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <SportsCricket sx={{ mr: 2, color: "primary.main" }} />
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, fontWeight: 700 }}
            >
              Premier Auction
            </Typography>
            <Button variant="contained" color="primary">
              Squad
            </Button>
          </Toolbar>
        </Container>
      </AppBar>

      <Container
        maxWidth="lg"
        sx={{
          py: 4,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Grid container spacing={3}>
          {/* Left Column */}
          <Grid item xs={12} md={8}>
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
                    {currentPlayer?.name || "Coming Soon..."}
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Avatar
                      src={currentPlayer?.photoUrl}
                      sx={{ width: 120, height: 120, mb: 2, mx: "auto" }}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <Grid container spacing={10}>
                      <DetailItem label="Role" value={currentPlayer?.role} />
                      <DetailItem
                        label="Base Price"
                        value={formatPoints(2000)}
                      />
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <AnimatedCard sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Whatshot sx={{ color: "#ff4444", mr: 1 }} />
                  <Typography variant="h6" component="div">
                    {playerSold ? "PLAYER SOLD" : "Current Bid"}
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
                      {playerSold ? playerSold.teamName : currentBidTeamName}
                    </Typography>
                  </Box>
                  <Chip
                    label={playerSold ? "SOLD" : "ACTIVE"}
                    color={playerSold ? "error" : "success"}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
              </CardContent>
            </AnimatedCard>

            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                  Top 10 Bids
                </Typography>
                <List dense>
                  {topBids.map((bid, index) => (
                    <BidItem key={index} rank={index + 1} {...bid} />
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={4}>
            <Card elevation={2} sx={{ mb: 3, maxWidth: 400 }}>
              <CardContent>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ mb: 2, display: "flex", alignItems: "center" }}
                >
                  <AccountBalanceWallet sx={{ mr: 1, color: "primary.main" }} />
                  Team Purses
                </Typography>
                <Grid container spacing={1}>
                  {purseData.length > 0 ? (
                    purseData.map((team) => (
                      <Grid item xs={6} key={team.name}>
                        <PurseItem {...team} />
                      </Grid>
                      // <div>{team.name}</div>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Loading purse data…
                    </Typography>
                  )}
                </Grid>
              </CardContent>
            </Card>

            <Card elevation={2} sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ mb: 2 }}>
                  Unsold Players
                </Typography>
                <List dense>
                  {players.map((player, index) => (
                    <PlayerItem key={index} {...player} />
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const DetailItem = ({ label, value }) => (
  <Grid item xs={6}>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body1" component="div" fontWeight={500}>
      {value}
    </Typography>
  </Grid>
);

const PlayerItem = ({ name, role, price }) => (
  <ListItem sx={{ py: 1, display: "flex", alignItems: "center" }}>
    <ListItemAvatar>
      <Avatar sx={{ bgcolor: "primary.main" }}>{name[0]}</Avatar>
    </ListItemAvatar>
    <Box
      sx={{
        ml: 2,
        flexGrow: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography variant="body1" component="div">
        {name}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Typography variant="body2" component="span">
          {role}
        </Typography>
        <Chip label={price} size="small" sx={{ ml: 1 }} />
      </Box>
    </Box>
  </ListItem>
);

const BidItem = ({ rank, player, team, amount }) => (
  <ListItem
    sx={{
      py: 1,
      borderBottom: "1px solid #eee",
      "&:hover": { backgroundColor: "#f8f9fa" },
    }}
  >
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Chip label={`#${rank}`} size="small" sx={{ mr: 1.5 }} />
        <Typography variant="subtitle1" component="div">
          {player}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="body2" component="span">
          {team}
        </Typography>
        <Typography
          variant="body2"
          component="span"
          sx={{ fontWeight: 600, color: "#1976d2" }}
        >
          {amount}
        </Typography>
      </Box>
    </Box>
  </ListItem>
);

const PurseItem = ({ name, remainingPurse, maxBidAllowed }) => {
  if (!name || remainingPurse == null || maxBidAllowed == null)
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

      <Box sx={{ fontWeight: 700 }}>
        <Grid container spacing={3} alignItems="center" direction="row">
          <Grid item>{formatPoints(remainingPurse)}</Grid>
          <Grid item>
            <Chip
              label={formatPoints(maxBidAllowed)}
              size="small"
              color="error"
              sx={{ fontSize: 20 }}
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

// Temporary Data
const players = [
  { name: "Rohit Sharma", role: "Batsman", price: "₹2.00 Lakh" },
  { name: "Virat Kohli", role: "Batsman", price: "₹2.00 Lakh" },
  { name: "Yuzvendra Chahal", role: "Bowler", price: "₹1.20 Lakh" },
  { name: "Hardik Pandya", role: "All-Rounder", price: "₹1.50 Lakh" },
  { name: "MS Dhoni", role: "Wicket Keeper", price: "₹1.50 Lakh" },
  { name: "Ravindra Jadeja", role: "All-Rounder", price: "₹1.50 Lakh" },
];

const topBids = Array(10)
  .fill()
  .map((_, i) => ({
    player: `Player ${i + 1}`,
    team: `Team ${(i % 5) + 1}`,
    amount: `₹${(2.1 - i * 0.1).toFixed(1)} Lakh`,
  }));

export default AuctionUI;
