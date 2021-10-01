import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blue, red } from '@mui/material/colors';
import React, { useState } from 'react';
import { Route, HashRouter, Switch } from 'react-router-dom';
import MainAppBar from './components/MainAppBar';
import PokemonCardContainer from './components/PokemonCardContainer';
import { Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query';

const theme = createTheme({
  palette: {
    primary: {
      main: red[700],
    },
    secondary: {
      main: blue[900],
    },
  },
  typography: {
    // Use the system font instead of the default Roboto font.
    fontFamily: ['"Lato"', 'sans-serif'].join(','),
  },
});

const Home = () => <h1>Home</h1>;
const About = () => <h1>About</h1>;
const Post = () => <h1>Post</h1>;
const Project = () => <h1>Project</h1>;

const queryClient = new QueryClient();

function App() {
  const [searchText, setSearchText] = useState('');

  return (
    <ThemeProvider theme={theme}>
      <MainAppBar setSearchText={setSearchText} />
      <PokemonCardContainer searchText={searchText} />
    </ThemeProvider>
    // <div>
    //   <ThemeProvider theme={theme}>
    //     {/* <Routes /> */}
    //     <HashRouter>
    //       <Route exact path='/' component={Home} />
    //       <Route exact path="/about" component={About} />
    //       <Route exact path="/posts" component={Post} />
    //       <Route exact path="/projects" component={Project} />
    //     </HashRouter>
    //   </ThemeProvider>
    // </div>
  );
}

export default App;
