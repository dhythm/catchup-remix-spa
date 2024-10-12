import type { MetaFunction } from "@remix-run/node";
import { useCallback, useEffect, useState } from "react";
import * as v from "valibot";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

type Types = { en: string; ja: string }[];

const ListSchema = v.object({ name: v.string(), url: v.string() });
type ListSchemaType = v.InferOutput<typeof ListSchema>;

export default function Index() {
  const [pokemons, setPokemons] = useState<ListSchemaType[]>([]);
  const [types, setTypes] = useState<{ en: string; ja: string }[]>([]);

  const getAllPokemons = async () => {
    // The number of current pokemons is 1302
    const res = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=50");
    return v.parse(v.array(ListSchema), (await res.json()).results);
  };
  const getAllTypes = async () => {
    const res = await fetch("https://pokeapi.co/api/v2/type");
    return v.parse(v.array(ListSchema), (await res.json()).results);
  };

  useEffect(() => {
    getAllPokemons().then((data) => setPokemons(data));
    getAllTypes().then(async (data) => {
      const _types = await Promise.all(
        data.map(async (d) => {
          const res = await fetch(d.url);
          return v.parse(
            v.object({
              name: v.string(),
              names: v.array(
                v.object({
                  name: v.string(),
                  language: v.object({ name: v.string(), url: v.string() }),
                })
              ),
            }),
            await res.json()
          );
        })
      );
      setTypes(
        _types.map((d) => ({
          en: d.name,
          ja: d.names.find((n) => n.language.name === "ja")?.name || "",
        }))
      );
    });
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
            <PokemonCard
              key={pokemon.name}
              name={pokemon.name}
              url={pokemon.url}
              types={types}
            />
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
const PokemonSpeciesSchema = v.object({
  base_happiness: v.number(),
  capture_rate: v.number(),
  color: v.any(),
  egg_groups: v.array(v.any()),
  evolution_chain: v.any(),
  evolves_from_species: v.any(),
  flavor_text_entries: v.array(v.any()),
  form_descriptions: v.array(v.any()),
  forms_switchable: v.boolean(),
  gender_rate: v.number(),
  genera: v.array(
    v.object({
      genus: v.string(),
      language: v.object({
        name: v.string(),
        url: v.string(),
      }),
    })
  ),
  generation: v.any(),
  growth_rate: v.any(),
  habitat: v.any(),
  has_gender_differences: v.boolean(),
  hatch_counter: v.number(),
  id: v.number(),
  is_baby: v.boolean(),
  is_legendary: v.boolean(),
  is_mythical: v.boolean(),
  name: v.string(),
  names: v.array(
    v.object({
      language: v.object({
        name: v.string(),
        url: v.string(),
      }),
      name: v.string(),
    })
  ),
  order: v.number(),
  pal_park_encounters: v.array(v.any()),
  pokedex_numbers: v.array(
    v.object({
      entry_number: v.number(),
      pokedex: v.object({
        name: v.string(),
        url: v.string(),
      }),
    })
  ),
  shape: v.any(),
  varieties: v.array(v.any()),
});

const PokemonCard = ({
  name,
  url,
  types,
}: {
  name: string;
  url: string;
  types: Types;
}) => {
  const [pokemon, setPokemon] = useState<PokemonSchemaType>();
  const getPokemon = useCallback(async () => {
    try {
      const resPokemon = await fetch(url);
      const resSpecies = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${name}`
      );
      const pokemonData = v.parse(PokemonSchema, await resPokemon.json());
      const species = v.parse(PokemonSpeciesSchema, await resSpecies.json());
      return {
        ...pokemonData,
        name:
          species.names.find((n) => n.language.name === "ja")?.name ||
          pokemonData.name,
        types: pokemonData.types.map((t) => ({
          ...t,
          type: {
            ...t.type,
            name: types.find((_t) => _t.en === t.type.name)?.ja || t.type.name,
          },
        })),
      };
    } catch {
      return;
    }
  }, [name, types, url]);

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
          {pokemon.types.map((data) => data.type.name).join("/")}
        </p>
      </div>
    </div>
  );
};
