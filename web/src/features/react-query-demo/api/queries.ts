import { queryOptions } from '@tanstack/react-query';

export type Pokemon = {
  id: number;
  name: string;
  sprites: {
    front_shiny: string;
    front_default: string;
  };
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  height: number;
  weight: number;
};

const fallbackPokemon: Pokemon = {
  id: 25,
  name: 'pikachu',
  sprites: {
    front_shiny: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/25.png',
    front_default: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
  },
  types: [{ type: { name: 'electric' } }],
  stats: [
    { base_stat: 35, stat: { name: 'hp' } },
    { base_stat: 55, stat: { name: 'attack' } },
    { base_stat: 40, stat: { name: 'defense' } },
    { base_stat: 50, stat: { name: 'special-attack' } },
    { base_stat: 50, stat: { name: 'special-defense' } },
    { base_stat: 90, stat: { name: 'speed' } },
  ],
  height: 4,
  weight: 60,
};

export const pokemonOptions = (id: number = 25) =>
  queryOptions({
    queryKey: ['pokemon', id],
    queryFn: async (): Promise<Pokemon> => {
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) return fallbackPokemon;
        return response.json();
      } catch {
        return fallbackPokemon;
      }
    }
  });
