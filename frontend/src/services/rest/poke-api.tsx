import axios from 'axios';

export const getPokemons = async (nextUrl = '') => {
  const url =
    nextUrl.trim() === '' ? 'https://pokeapi.co/api/v2/pokemon' : nextUrl;
  const response = await axios.get(url);
  return response.data;
};

export const getPokemon = async (url: string) => {
  const response = await axios.get(url);
  return response.data;
};
