import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Card, CardContent, 
  Grid, CircularProgress, Box, CssBaseline, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, createTheme, ThemeProvider 
} from '@material-ui/core';
import styled from 'styled-components';

const theme = createTheme({
  palette: {
    type: 'dark',
    primary: { main: '#f44336' },
  },
});

const StatusCard = styled(Card)`
  margin-bottom: 20px;
  background-color: #1e1e1e;
  border-left: 5px solid #f44336;
`;

const ResultsTable = styled(TableContainer)`
  margin-top: 30px;
  background-color: #1e1e1e;
`;

function App() {
  const [serverInfo, setServerInfo] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  // Replace with your actual Hetzner IP
  // const API_URL = 'https://178.104.52.229:8080/api';
  const API_URL = 'https://acc.sino.noho.st/api';

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/info`).then(res => res.json()),
      fetch(`${API_URL}/results`).then(res => res.json())
    ])
    .then(([info, resList]) => {
      setServerInfo(info);
      // If there are results, fetch the data for the most recent one
      if (resList.length > 0) {
        return fetch(`${API_URL}/results/${resList[0].filename}`).then(res => res.json());
      }
      return null;
    })
    .then(lastRace => {
      if (lastRace) setResults(lastRace.sessionResult.leaderBoardLines);
      setLoading(false);
    })
    .catch(err => console.error("Data fetch error:", err));
  }, []);

  // Helper to format milliseconds to MM:SS.ms
  const formatTime = (ms) => {
    if (!ms || ms === 2147483647) return "--:--.---";
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(3);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" style={{ marginTop: '50px', paddingBottom: '50px' }}>
        <Typography variant="h3" align="center" gutterBottom style={{ fontWeight: 700 }}>
          🏁 SPA-FRANCORCHAMPS DASHBOARD
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <StatusCard>
                <CardContent>
                  <Typography variant="h6" color="primary">SERVER INFO</Typography>
                  <Typography variant="h4">{serverInfo?.track?.toUpperCase()}</Typography>
                  <Typography variant="body1" style={{ color: '#aaa' }}>{serverInfo?.serverName}</Typography>
                </CardContent>
              </StatusCard>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>Last Session Leaderboard</Typography>
              <ResultsTable component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Pos</TableCell>
                      <TableCell>Driver</TableCell>
                      <TableCell>Car Model</TableCell>
                      <TableCell align="right">Best Lap</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((line, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          {line.car.drivers[0].firstName} {line.car.drivers[0].lastName}
                        </TableCell>
                        <TableCell>ID: {line.car.carModel}</TableCell>
                        <TableCell align="right">{formatTime(line.timing.bestLap)}</TableCell>
                      </TableRow>
                    ))}
                    {results.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">No race data available yet.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ResultsTable>
            </Grid>
          </Grid>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
