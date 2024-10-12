import type { MetaFunction } from "@remix-run/node";
import { useCallback, useEffect, useState } from "react";
import * as v from "valibot";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

const PokemonListSchema = v.object({ name: v.string(), url: v.string() });
type PokemonListSchemaType = v.InferOutput<typeof PokemonListSchema>;

export default function Index() {
  const [pokemons, setPokemons] = useState<PokemonListSchemaType[]>([]);
  const getAllPokemons = async () => {
    // The number of current pokemons is 1302
    const res = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=50");
    return v.parse(v.array(PokemonListSchema), (await res.json()).results);
  };

  useEffect(() => {
    getAllPokemons().then((data) => setPokemons(data));
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Welcome to <span className="sr-only">Remix</span>
          </h1>
          <div className="h-[144px] w-[434px]">
            <img
              src="/logo-light.png"
              alt="Remix"
              className="block w-full dark:hidden"
            />
            <img
              src="/logo-dark.png"
              alt="Remix"
              className="hidden w-full dark:block"
            />
          </div>
        </header>
        <div className="flex flex-wrap">
          {pokemons.map((pokemon) => (
            <PokemonCard key={pokemon.name} url={pokemon.url} />
          ))}
        </div>
      </div>
    </div>
  );
}

const PokemonSchema = v.object({
  abilities: v.array(v.any()),
  base_experience: v.number(),
  cries: v.any(),
  forms: v.array(v.any()),
  game_indices: v.array(v.any()),
  height: v.number(),
  held_items: v.array(v.any()),
  id: v.number(),
  is_default: v.boolean(),
  location_area_encounters: v.string(),
  moves: v.array(v.any()),
  name: v.string(),
  order: v.number(),
  past_attributes: v.any(),
  past_types: v.any(),
  species: v.any(),
  sprites: v.object({
    front_default: v.string(),
  }),
  versions: v.any(),
  stats: v.array(
    v.object({
      base_stat: v.number(),
      effort: v.number(),
      stat: v.object({
        name: v.string(),
        url: v.string(),
      }),
    })
  ),
  types: v.array(
    v.object({
      slot: v.number(),
      type: v.object({
        name: v.string(),
        url: v.string(),
      }),
    })
  ),
  weight: v.number(),
});
type PokemonSchemaType = v.InferOutput<typeof PokemonSchema>;
const PokemonCard = ({ url }: { url: string }) => {
  const [pokemon, setPokemon] = useState<PokemonSchemaType>();
  const getPokemon = useCallback(async () => {
    try {
      const res = await fetch(url);
      return v.parse(PokemonSchema, await res.json());
    } catch {
      return;
    }
  }, [url]);

  useEffect(() => {
    getPokemon().then((data) => setPokemon(data));
  }, [getPokemon]);

  if (!pokemon) return null;

  return (
    <div className="thumb-container grass w-24">
      <div className="number">
        <small>#0{pokemon?.id}</small>
      </div>
      <img src={pokemon.sprites.front_default} alt={pokemon.name} />
      <div className="detail-wrapper">
        <h4>{pokemon.name}</h4>
        <p className="text-sm">
          {pokemon.types.map((data) => data.type.name).join(", ")}
        </p>
      </div>
    </div>
  );
};
