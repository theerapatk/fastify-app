import { Box, Grid } from '@mui/material';
import axios from 'axios';
import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
// import InfiniteScroll from 'react-infinite-scroller';
import { useInfiniteQuery } from 'react-query';
import { getPokemon, getPokemons } from '../services/rest/poke-api';
import PokemonCard from './PokemonCard';
// import CatchingPokemonIcon from '@mui/icons-material/CatchingPokemon';

// TODO: Redux GraphQL
// const actionDispatch = (dispatch: Dispatch) => ({
//   setPokedex: (pokedex: GetPokedex['pokemon_v2_pokemon']) => dispatch(setPokedex(pokedex))
// });

// const actionDispatch = (dispatch: Dispatch) => ({
//   setPokemons: (pokedex: GetPokedex['pokemon_v2_pokemon']) =>
//     dispatch(setPokemons(pokedex)),
// });

interface Props {
  searchText: string;
}

export interface Type {
  type: { name: string };
}

export interface Sprites {
  front_default: string;
}

export interface Pokemon {
  name: string;
  url: string;
  types: Type[];
  sprites: Sprites;
}

const PokemonCardContainer: React.FC<Props> = ({ searchText }) => {
  const [nextUrl, setNextUrl] = useState('');
  const [pokemons, setPokemons] = useState<any[]>([]);

  // TODO: Redux
  // const [pokemons, setPokemons] = useState<GetPokedex['pokemon_v2_pokemon']>([]);
  // const { setPokemons } = actionDispatch(useAppDispatch());

  const getPokemonsWithDetail = (nextUrl = '') => {
    getPokemons(nextUrl).then((data) => {
      let promises: unknown[] = [];
      setNextUrl(data.next);
      data.results.forEach((pokemon: Pokemon) => {
        promises.push(
          getPokemon(pokemon.url).then((detail) => {
            const defaultSprite = detail.sprites.front_default;
            pokemon.types = detail.types;
            pokemon.sprites = {
              front_default:
                detail.sprites.other?.['official-artwork']?.front_default ||
                defaultSprite,
            };
          })
        );
      });
      Promise.allSettled(promises).then(() => {
        if (nextUrl) {
          // setPokemons([...pokemons, ...data.results]);
        } else {
          setPokemons(data.results);
        }
      });
    });
  };

  useEffect(() => {
    getPokemonsWithDetail();
  }, []);

  const filteredPokemons = useMemo(() => {
    if (!searchText) return pokemons;
    return pokemons.filter((pokemon) =>
      pokemon.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [pokemons, searchText]);

  const loadNext = async () => {
    if (!nextUrl) {
      return;
    }
    getPokemonsWithDetail(nextUrl);
  };

  // TODO: GraphQL
  // const getPokedex = async () => {
  //   const pokedex = await pokeApiService.getPokemons(0)
  //     .catch(err => console.log("Error: ", err));
  //   console.log("Pokedex: ", pokedex);
  //   if (pokedex) setPokemons(pokedex);
  // };

  // useEffect(() => {
  //   getPokedex();
  // }, []);

  return (
    <Box sx={{ mx: 4, marginTop: 4, marginBottom: 1 }}>
      <InfiniteScroll
        dataLength={filteredPokemons.length}
        next={loadNext}
        hasMore={Boolean(nextUrl)}
        loader={
          <h4 style={{ textAlign: 'center' }}>
            <b>Loading more Pokémon</b>
          </h4>
        }
        endMessage={
          <h4 style={{ textAlign: 'center' }}>
            <b>
              {filteredPokemons.length > 0
                ? 'All Pokémon have been loaded'
                : 'No Pokémon found'}
            </b>
          </h4>
        }
      >
        {filteredPokemons.length > 0 && (
          <Grid container spacing={4}>
            {filteredPokemons.map((pokemon, index) => (
              <Grid item key={index} xs={12} sm={4} md={3} lg={2}>
                <PokemonCard pokemon={pokemon} />
              </Grid>
            ))}
          </Grid>
        )}
      </InfiniteScroll>
    </Box>
  );
};

export default PokemonCardContainer;
