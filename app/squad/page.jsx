'use client';
import {
    Container,
    Box,
    Typography,
    Card,
    CardHeader,
    ImageList,
    ImageListItem,
    Dialog,
    DialogTitle,
    DialogContent,
    TableContainer,
    Table,
    TableCell,
    TableRow,
    TableHead,
    TableBody,
} from '@mui/material';
import { useTheme, styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const TeamCard = styled(Card)(({ theme }) => ({
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
    },
}));

const MediaCard = styled(ImageList)(({ theme }) => ({
    aspectRatio: 1,
}));

export default function SquadPage() {
    const theme = useTheme();
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [teams, setTeams] = useState([]);
    const [playersData, setPlayersData] = useState([]);

    const getTeams = async () => {
        fetch('/api/teams')
            .then((res) => res.json())
            .then((data) => {
                setTeams(data);
                console.log('Teams:', data);
            });
    };

    const handleTeamClick = (team) => {
        setSelectedTeam(team);
        const teamSquad = teams.find((t) => t._id === team._id).squad;
        console.log('Team Squad:', teamSquad);
        setPlayersData(teamSquad);
    };

    useEffect(() => {
        getTeams();
        const socket = io('/', { path: '/socket.io' });

        socket.on('playerSold', async (data) => {
            await getTeams();
        });
    }, []);

    return (
        <Container maxWidth='md' component='main' sx={{ mt: 4 }}>
            <Box display='flex' flexDirection='column' alignItems='center' p={2} boxShadow={`${theme.shadows[1]}`} borderRadius={8} sx={{ marginBottom: 2 }}>
                <Typography variant='h3' component='h1'>
                    Squad Roster
                </Typography>
                <Typography variant='subtitle1' color='text.secondary'>
                    Current Lineup and Player Details
                </Typography>
            </Box>

            <Box display='flex' flexWrap='wrap' gap={4}>
                {teams.map((team) => (
                    <TeamCard key={team._id} onClick={() => handleTeamClick(team)} sx={{ width: '100%' }}>
                        <MediaCard sx={{ aspectRatio: 1 }}>
                            <ImageListItem>
                                <img
                                    src={team.logoUrl}
                                    alt={`${team.name} logo`}
                                    style={{
                                        objectFit: 'cover',
                                        width: '100%',
                                        height: '100%',
                                    }}
                                />
                            </ImageListItem>
                        </MediaCard>
                        <Box p={2}>
                            <Box mb={1} textOverflow='ellipsis'>
                                <Typography variant='h6' component='h3'>
                                    {team.name}
                                </Typography>
                            </Box>
                            <Box display='flex' justifyContent='space-between' alignItems='center' fontSize={14} color='text.secondary'>
                                <span>{team.numberOfPlayers} Players</span>
                                <span>Last Updated: {new Date(team.updatedAt).toLocaleDateString()}</span>
                            </Box>
                        </Box>
                    </TeamCard>
                ))}
            </Box>

            <Dialog open={selectedTeam !== null} onClose={() => setSelectedTeam(null)}>
                <DialogTitle>{selectedTeam?.name}</DialogTitle>
                <DialogContent>
                    <TableContainer component='div' sx={{ maxHeight: 400 }}>
                        <Table size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Price</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {playersData.length > 0 ? (
                                    playersData.map((player) => (
                                        <TableRow key={player.id}>
                                            <TableCell>{player.name}</TableCell>
                                            <TableCell>{player.role}</TableCell>
                                            <TableCell>{player.soldFor}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <Typography variant='small'>No Players yet</Typography>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
        </Container>
    );
}
