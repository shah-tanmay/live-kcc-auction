'use client';

import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import { SportsCricket, Whatshot, AccountBalanceWallet, Note } from '@mui/icons-material';
import { io } from 'socket.io-client';
import { formatPoints } from '@/utils/formatPoints';
import { useRouter } from 'next/navigation';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const AnimatedCard = styled(Card)(() => ({
    animation: `${pulse} 1.5s ease-in-out infinite`,
    background: 'linear-gradient(45deg, #fff5f5, #fff)',
    border: '2px solid #ff4444',
    boxShadow: '0 4px 20px rgba(255, 68, 68, 0.15)',
}));

const AuctionUI = () => {
    const isMobile = useMediaQuery('(max-width:600px)');
    const [currentBid, setCurrentBid] = useState('No Bids Yet');
    const [currentBidTeamName, setCurrentBidTeamName] = useState('No Team Yet');
    const [purseData, setPurseData] = useState([]);
    const [hasMounted, setHasMounted] = useState(false);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [playerSold, setPlayerSold] = useState(null);
    const [unSold, setUnsoldData] = useState(null);
    const [topBids, setTopBids] = useState([]);
    const [unsoldPlayers, setUnsoldPlayers] = useState([]);
    const [remainingPlayersCount, setRemainingPlayers] = useState();
    const router = useRouter();

    const remainingPlayers = async () => {
        fetch('/api/auction/remaining')
            .then((res) => res.json())
            .then((data) => {
                console.log('remaining players:', data);
                setRemainingPlayers(data.count);
            });
    };

    const fetchPurseData = async () => {
        fetch('/api/teams/purse')
            .then((res) => res.json())
            .then((data) => setPurseData(data));
    };

    const getTopBids = async () => {
        fetch('/api/players/sold/top')
            .then((res) => res.json())
            .then((data) => {
                console.log('data', data);
                setTopBids(data.players);
            });
    };

    const getUnSoldPlayers = async () => {
        fetch('/api/players/unsold')
            .then((res) => res.json())
            .then((data) => {
                setUnsoldPlayers(data.players);
            });
    };

    useEffect(() => {
        setHasMounted(true);
        const socket = io('/', { path: '/socket.io' });

        fetchPurseData();
        getTopBids();
        getUnSoldPlayers();
        remainingPlayers();

        socket.on('newBid', (data) => {
            setCurrentBid(data.amount);
            setCurrentBidTeamName(data.teamName);
        });

        socket.on('newPlayer', (data) => {
            setCurrentPlayer(data.player);
            setPlayerSold(null);
            setCurrentBid('No Bids Yet');
            setCurrentBidTeamName('No Team Yet');
            setUnsoldData(null);
            remainingPlayers();
        });

        socket.on('playerSold', async (data) => {
            setPlayerSold(data);
            await getTopBids();
            await fetchPurseData();
            await remainingPlayers();
        });

        socket.on('playerUnSold', async (data) => {
            setUnsoldData(data);
            await getUnSoldPlayers();
            await remainingPlayers();
        });
    }, []);

    if (!hasMounted) return null;

    return (
        <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <AppBar position='static' color='inherit' elevation={1}>
                <Container maxWidth='lg'>
                    <Toolbar disableGutters>
                        <SportsCricket sx={{ mr: 2, color: 'primary.main' }} />
                        <Typography variant='h6' component='div' sx={{ flexGrow: 1, fontWeight: 700 }}>
                            Premier Auction
                        </Typography>
                        <Button variant='contained' color='primary' onClick={() => router.push('/squad')}>
                            Squad
                        </Button>
                    </Toolbar>
                </Container>
            </AppBar>

            <Container
                maxWidth='lg'
                sx={{
                    py: 4,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Grid container spacing={3}>
                    {/* Left Column */}
                    <Grid item xs={12} md={8}>
                        {remainingPlayersCount && <Chip label={`Remaining Players: ${remainingPlayersCount}`} size='medium' color='info' sx={{ fontSize: 20, mb: 5 }} />}
                        <Card
                            elevation={2}
                            sx={{
                                mb: 3,
                                borderLeft: '4px solid #1976d2',
                                minWidth: isMobile ? 0 : 500,
                            }}
                        >
                            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Chip label='LIVE' color='error' size='small' sx={{ mr: 2 }} />
                                    <Typography variant='h5' component='div'>
                                        {currentPlayer?.name || 'Coming Soon...'}
                                    </Typography>
                                </Box>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <Avatar src={currentPlayer?.photoUrl} sx={{ width: 300, height: 300, mb: 2, mx: 'auto' }} />
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Grid container spacing={10}>
                                        <DetailItem label='Role' value={currentPlayer?.role} sx={{ fontSize: '30px' }} />
                                        <DetailItem label='Base Price' value={formatPoints(2000)} sx={{ fontSize: '30px' }} />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        <AnimatedCard sx={{ mb: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <Whatshot sx={{ color: '#ff4444', mr: 1 }} />
                                    <Typography variant='h6' component='div'>
                                        {playerSold ? 'PLAYER SOLD' : unSold ? 'PLAYER UNSOLD' : 'Current Bid'}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box>
                                        <Typography variant='h4' component='div' sx={{ fontWeight: 700 }}>
                                            {formatPoints(currentBid)}
                                        </Typography>
                                        <Typography variant='body2' component='div' color='text.secondary'>
                                            {playerSold ? playerSold.teamName : currentBidTeamName}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={playerSold ? 'SOLD' : unSold ? 'UNSOLD' : 'ACTIVE'}
                                        color={playerSold ? 'error' : unSold ? 'warning' : 'success'}
                                        sx={{ fontWeight: 700 }}
                                    />
                                </Box>
                            </CardContent>
                        </AnimatedCard>

                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant='h6' component='div' sx={{ mb: 2 }}>
                                    Top 10 Bids
                                </Typography>
                                {topBids.length > 0 ? (
                                    <List dense>
                                        {topBids.map((bid, index) => (
                                            <BidItem key={index} rank={index + 1} {...bid} />
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant='body2' color='text.secondary'>
                                        No Bids Yet
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Column */}
                    <Grid item xs={12} md={4}>
                        <Card elevation={2} sx={{ mb: 3, maxWidth: 400 }}>
                            <CardContent>
                                <Typography variant='h6' component='div' sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                                    <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
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
                                        <Typography variant='body2' color='text.secondary'>
                                            Loading purse data…
                                        </Typography>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>

                        <Card elevation={2} sx={{ mb: 3 }}>
                            <CardContent>
                                <Typography variant='h6' component='div' sx={{ mb: 2 }}>
                                    Unsold Players
                                </Typography>
                                {unsoldPlayers.length > 0 ? (
                                    <List dense>
                                        {unsoldPlayers.map((player, index) => (
                                            <PlayerItem key={index} {...player} />
                                        ))}
                                    </List>
                                ) : (
                                    <Typography>No unsold Players Yet</Typography>
                                )}
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
        <Typography variant='body2' color='text.secondary'>
            {label}
        </Typography>
        <Typography variant='body1' component='div' fontWeight={500}>
            {value}
        </Typography>
    </Grid>
);

const PlayerItem = ({ name, role, price }) => (
    <ListItem sx={{ py: 1, display: 'flex', alignItems: 'center' }}>
        <ListItemAvatar>
            <Avatar sx={{ bgcolor: 'primary.main' }}>{name[0]}</Avatar>
        </ListItemAvatar>
        <Box
            sx={{
                ml: 2,
                flexGrow: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}
        >
            <Typography variant='body1' component='div'>
                {name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant='body2' component='span'>
                    {role}
                </Typography>
                <Chip label={price} size='small' sx={{ ml: 1 }} />
            </Box>
        </Box>
    </ListItem>
);

const BidItem = ({ rank, player, team, amount }) => (
    <ListItem
        sx={{
            py: 1,
            borderBottom: '1px solid #eee',
            '&:hover': { backgroundColor: '#f8f9fa' },
        }}
    >
        <Box sx={{ width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip label={`#${rank}`} size='small' sx={{ mr: 1.5 }} />
                <Typography variant='subtitle1' component='div'>
                    {player}
                </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant='body2' component='span'>
                    {team}
                </Typography>
                <Typography variant='body2' component='span' sx={{ fontWeight: 600, color: '#1976d2' }}>
                    {amount}
                </Typography>
            </Box>
        </Box>
    </ListItem>
);

const PurseItem = ({ name, remainingPurse, maxBidAllowed }) => {
    if (!name || remainingPurse == null || maxBidAllowed == null)
        return (
            <Typography variant='body2' color='text.secondary'>
                Loading...
            </Typography>
        );

    return (
        <Paper
            elevation={0}
            sx={{
                p: 1.5,
                border: '1px solid #eee',
                borderRadius: 1,
                backgroundColor: '#fff',
            }}
        >
            <Typography variant='subtitle1' color='text.secondary' fontWeight={600}>
                {name}
            </Typography>

            <Box sx={{ fontWeight: 700 }}>
                <Grid container spacing={3} alignItems='center' direction='row'>
                    <Grid item>{formatPoints(remainingPurse)}</Grid>
                    <Grid item>
                        <Chip label={formatPoints(maxBidAllowed)} size='small' color='error' sx={{ fontSize: 20 }} />
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

// Temporary Data
const players = [
    { name: 'Rohit Sharma', role: 'Batsman', price: '₹2.00 Lakh' },
    { name: 'Virat Kohli', role: 'Batsman', price: '₹2.00 Lakh' },
    { name: 'Yuzvendra Chahal', role: 'Bowler', price: '₹1.20 Lakh' },
    { name: 'Hardik Pandya', role: 'All-Rounder', price: '₹1.50 Lakh' },
    { name: 'MS Dhoni', role: 'Wicket Keeper', price: '₹1.50 Lakh' },
    { name: 'Ravindra Jadeja', role: 'All-Rounder', price: '₹1.50 Lakh' },
];
export default AuctionUI;
