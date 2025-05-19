// "use client";

// import { useEffect, useState } from "react";
// import { io } from "socket.io-client";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Grid,
//   Avatar,
//   Chip,
//   Stack,
//   Paper,
//   Button,
//   TextField,
//   Divider,
// } from "@mui/material";

// let socket;

// export default function BidRoom() {
//   const [player, setPlayer] = useState(null);
//   const [highestBid, setHighestBid] = useState(null);
//   const [bids, setBids] = useState([]);
//   const [bidInput, setBidInput] = useState("");
//   const [teamId, setTeamId] = useState("");

//   useEffect(() => {
//     fetch("/api/socket");
//     socket = io({ path: "/api/socket" });

//     socket.on("connect", () => console.log("Socket connected", socket.id));

//     socket.on("newBid", (data) => {
//       setBids((prev) => [data, ...prev]);
//       setHighestBid((prev) =>
//         !prev || data.amount > prev.amount ? data : prev
//       );
//     });

//     socket.on("playerSold", (data) => {
//       alert(`Player sold to ${data.teamName} for ₹${data.amount}`);
//       setPlayer(null);
//       setHighestBid(null);
//       setBids([]);
//     });

//     // Fetch initial player
//     fetch("/api/auction/next-player")
//       .then((res) => res.json())
//       .then((p) => setPlayer(p));

//     return () => socket.disconnect();
//   }, []);

//   const placeBid = async () => {
//     const amount = parseFloat(bidInput);
//     if (!teamId || isNaN(amount)) return;
//     await fetch("/api/auction/post-bid", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer admin1",
//       },
//       body: JSON.stringify({ playerId: player._id, teamId, bidAmount: amount }),
//     });
//     setBidInput("");
//   };

//   if (!player) {
//     return (
//       <Box sx={{ textAlign: "center", mt: 8 }}>
//         <Typography variant="h2">No player currently up for auction</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ p: 4 }}>
//       <Grid container spacing={4}>
//         <Grid item xs={12} md={4}>
//           <Card sx={{ borderRadius: 4, boxShadow: 8 }}>
//             <CardContent sx={{ textAlign: "center" }}>
//               <Avatar
//                 alt={player.name}
//                 src={player.photoUrl}
//                 sx={{ width: 140, height: 140, mx: "auto", mb: 2 }}
//               />
//               <Typography variant="h2" gutterBottom>
//                 {player.name}
//               </Typography>
//               <Chip label={player.role} color="secondary" sx={{ mb: 2 }} />
//               <Divider sx={{ mb: 2 }} />
//               <Typography variant="body1">
//                 Base Price: ₹{player.basePrice}
//               </Typography>
//               <Box mt={2}>
//                 <Typography variant="subtitle1">Stats</Typography>
//                 {Object.entries(player.stats).map(([key, val]) => (
//                   <Typography key={key}>
//                     {key.charAt(0).toUpperCase() + key.slice(1)}: {val}
//                   </Typography>
//                 ))}
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid item xs={12} md={8}>
//           <Stack spacing={2}>
//             <Card sx={{ borderRadius: 4, boxShadow: 8, p: 2 }}>
//               <Typography variant="h4" gutterBottom>
//                 Live Bidding Panel
//               </Typography>
//               {highestBid ? (
//                 <Paper sx={{ p: 2, mb: 2, backgroundColor: "#e3f2fd" }}>
//                   <Typography variant="h6">
//                     🔥 Highest Bid: ₹{highestBid.amount} by{" "}
//                     {highestBid.teamName}
//                   </Typography>
//                 </Paper>
//               ) : (
//                 <Typography variant="body1">
//                   No bids yet. Be the first!
//                 </Typography>
//               )}

//               <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
//                 <TextField
//                   label="Your Team ID"
//                   value={teamId}
//                   onChange={(e) => setTeamId(e.target.value)}
//                   variant="outlined"
//                   fullWidth
//                 />
//                 <TextField
//                   label="Bid Amount"
//                   type="number"
//                   value={bidInput}
//                   onChange={(e) => setBidInput(e.target.value)}
//                   variant="outlined"
//                   fullWidth
//                 />
//                 <Button variant="contained" size="large" onClick={placeBid}>
//                   Place Bid
//                 </Button>
//               </Stack>
//             </Card>

//             <Card sx={{ borderRadius: 4, boxShadow: 8 }}>
//               <CardContent>
//                 <Typography variant="h5" gutterBottom>
//                   Bid History
//                 </Typography>
//                 <Stack spacing={1} sx={{ maxHeight: 300, overflowY: "auto" }}>
//                   {bids.map((b, i) => (
//                     <Paper key={i} sx={{ p: 1 }}>
//                       ₹{b.amount} by {b.teamName}
//                     </Paper>
//                   ))}
//                 </Stack>
//               </CardContent>
//             </Card>
//           </Stack>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// }
