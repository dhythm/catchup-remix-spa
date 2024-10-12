import type { MetaFunction } from "@remix-run/node";
import { useCallback, useEffect, useState } from "react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [pokemons, setPokemons] = useState<{ name: string; url: string }[]>([]);
  const getAllPokemons = async () => {
    // The number of current pokemons is 1302
    const res = await fetch("https://pokeapi.co/api/v2/pokemon/?limit=1500");
    return await res.json();
  };

  useEffect(() => {
    getAllPokemons().then((data) => setPokemons(data.results));
  }, []);

  console.log(pokemons);

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
        <nav className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-gray-200 p-6 dark:border-gray-700">
          <p className="leading-6 text-gray-700 dark:text-gray-200">
            What&apos;s next?
          </p>
          <ul>
            {pokemons.map((pokemon) => (
              <PokemonCard key={pokemon.name} url={pokemon.url} />
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}

const PokemonCard = ({ url }: { url: string }) => {
  // const [pokemon, setPokemon] = useState();
  const getPokemon = useCallback(async () => {
    const res = await fetch(url);
    return await res.json();
  }, [url]);

  useEffect(() => {
    getPokemon().then((data) => console.log(data));
  }, [getPokemon]);

  return <></>;
};
