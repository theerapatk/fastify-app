import {
  alpha,
  Avatar,
  Box,
  Card,
  CardActions,
  CardHeader,
  CardMedia,
  Chip,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { green, red } from '@mui/material/colors';
import { useState } from 'react';
import bug from '../static/images/avatar/Icon_Bug.png';
import dark from '../static/images/avatar/Icon_Dark.png';
import dragon from '../static/images/avatar/Icon_Dragon.png';
import electric from '../static/images/avatar/Icon_Electric.png';
import fairy from '../static/images/avatar/Icon_Fairy.png';
import fighting from '../static/images/avatar/Icon_Fighting.png';
import fire from '../static/images/avatar/Icon_Fire.png';
import flying from '../static/images/avatar/Icon_Flying.png';
import ghost from '../static/images/avatar/Icon_Ghost.png';
import grass from '../static/images/avatar/Icon_Grass.png';
import ground from '../static/images/avatar/Icon_Ground.png';
import ice from '../static/images/avatar/Icon_Ice.png';
import normal from '../static/images/avatar/Icon_Normal.png';
import poison from '../static/images/avatar/Icon_Poison.png';
import psychic from '../static/images/avatar/Icon_Psychic.png';
import rock from '../static/images/avatar/Icon_Rock.png';
import steel from '../static/images/avatar/Icon_Steel.png';
import water from '../static/images/avatar/Icon_Water.png';
import pokeballBg from '../static/images/pokeball_bg3.png';
import PokemonDialog from './PokemonDialog';
import { lighten } from '@mui/material/styles';
import { Pokemon, Type } from './PokemonCardContainer';

const typeColor: Record<string, string> = {
  normal: '#a8a878',
  fighting: '#c03028',
  flying: '#a890f0',
  poison: '#a040a0',
  ground: '#e0c068',
  rock: '#b8a038',
  bug: '#a8b820',
  ghost: '#705898',
  steel: '#b8b8d0',
  fire: '#f08030',
  water: '#6890f0',
  grass: '#78c850',
  electric: '#f8d030',
  psychic: '#f85888',
  ice: '#98d8d8',
  dragon: '#7038f8',
  dark: '#705848',
  fairy: '#ee99ac',
  unknown: '#68a090',
};

interface PokemonCardProps {
  pokemon: Pokemon;
}

const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon }) => {
  const [openDialog, setOpenDialog] = useState(false);

  const getTitle = () => {
    const number = pokemon?.url?.split('pokemon/')[1]?.split('/')[0];
    return `#${number} ${pokemon?.name?.toUpperCase()}`;
  };

  const getTypeName = (type: Type): string => {
    return type?.type?.name || '';
  };

  const getAvatar = (type: Type): string => {
    const typeName = getTypeName(type);
    if (typeName === 'normal') return normal;
    else if (typeName === 'fighting') return fighting;
    else if (typeName === 'flying') return flying;
    else if (typeName === 'poison') return poison;
    else if (typeName === 'ground') return ground;
    else if (typeName === 'rock') return rock;
    else if (typeName === 'bug') return bug;
    else if (typeName === 'ghost') return ghost;
    else if (typeName === 'steel') return steel;
    else if (typeName === 'fire') return fire;
    else if (typeName === 'water') return water;
    else if (typeName === 'grass') return grass;
    else if (typeName === 'electric') return electric;
    else if (typeName === 'psychic') return psychic;
    else if (typeName === 'ice') return ice;
    else if (typeName === 'dragon') return dragon;
    else if (typeName === 'dark') return dark;
    else if (typeName === 'fairy') return fairy;
    else return '';
  };

  const handleChipClick = (
    event: React.MouseEvent<HTMLElement>,
    type: string
  ) => {
    console.info(`You clicked ${type}`);
    event.stopPropagation();
  };

  const createTypeTheme = (type: Type) => {
    return createTheme({
      palette: {
        primary: {
          main: typeColor[getTypeName(type)],
        },
        secondary: {
          main: red[700],
        },
        background: {
          paper: lighten(typeColor[getTypeName(type)], 0.8),
        },
      },
    });
  };

  return (
    <Card
      sx={{
        position: 'relative',
        height: '100%',
        '&:hover': {
          cursor: 'pointer',
          opacity: 0.8,
          boxShadow: '0 6px 10px 0 rgba(0, 0, 0, 0.6)',
        },
        backgroundColor: alpha(typeColor[getTypeName(pokemon?.types[0])], 0.5),
        '&::before': {
          content: '""',
          position: 'absolute',
          opacity: '0.1',
          width: '100%',
          height: '100%',
          backgroundImage: `url(${pokeballBg})`,
          backgroundPosition: {
            xs: '76px 36px',
            sm: '18px 20px',
            md: '10px 20px',
          },
          backgroundRepeat: 'no-repeat',
          backgroundSize: '300px',
          zIndex: '-99',
        },
      }}
      onClick={() => setOpenDialog(true)}
    >
      <CardHeader
        title={getTitle()}
        titleTypographyProps={{ variant: 'body1' }}
        sx={{ fontWeight: 'bold' }}
      />
      <Box>
        <CardMedia
          sx={{ width: '50%', margin: '0 auto' }}
          image={pokemon?.sprites?.front_default}
          title={pokemon?.name}
          component="img"
        />
      </Box>
      <CardActions
        sx={{
          flexWrap: 'wrap',
          justifyContent: 'center',
          textTransform: 'capitalize',
        }}
      >
        {pokemon?.types?.map((type: Type, index: number) => (
          <Chip
            sx={{
              margin: 0.5,
              color: '#FAF8F6',
              fontWeight: 'bold',
              backgroundColor: typeColor[getTypeName(type)],
              '&:hover, &:focus': {
                backgroundColor: alpha(typeColor[getTypeName(type)], 0.7),
              },
            }}
            avatar={<Avatar alt={getTypeName(type)} src={getAvatar(type)} />}
            label={getTypeName(type)}
            onClick={(event) => handleChipClick(event, getTypeName(type))}
            key={index}
          />
        ))}
      </CardActions>
      <ThemeProvider theme={createTypeTheme(pokemon?.types[0])}>
        <PokemonDialog
          pokemon={pokemon}
          open={openDialog}
          handleDialogClose={() => setOpenDialog(false)}
        />
      </ThemeProvider>
    </Card>
  );
};

export default PokemonCard;
