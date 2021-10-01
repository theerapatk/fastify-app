import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import { TransitionProps } from '@mui/material/transitions';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { Pokemon } from './PokemonCardContainer';
import PokemonDetailTabs from './PokemonDetailTabs';

interface Props {
  pokemon: Pokemon;
  open: boolean;
  handleDialogClose: () => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children?: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const PokemonDialog = ({ pokemon, open, handleDialogClose }: Props) => {
  const handleDialogClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <div>
      <Dialog
        fullScreen
        open={open}
        onClose={handleDialogClose}
        TransitionComponent={Transition}
        onClick={(event) => handleDialogClick(event)}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleDialogClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography
              sx={{ ml: 2, flex: 1, textTransform: 'uppercase' }}
              variant="h6"
              component="div"
            >
              {pokemon.name}
            </Typography>
          </Toolbar>
        </AppBar>
        <img
          style={{ width: 240, alignSelf: 'center', margin: 32 }}
          src={pokemon.sprites?.front_default}
          alt={pokemon.name}
        />
        <PokemonDetailTabs pokemon={pokemon}></PokemonDetailTabs>
      </Dialog>
    </div>
  );
};

export default PokemonDialog;
