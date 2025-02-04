import React from 'react'
import Image from 'next/image'
export default function MainContent() {
    const games = [
        { name: "Defi Kingdoms", image: "/defi-kingdoms.png", available: true },
        { name: "Spellborne", image: "/spellborne.png", available: false },
        { name: "The Pit", image: "/the-pit.jpg", available: false },
    ];
     return (
    <div>
        <main className="flex-grow px-8">
          <section className="max-w-7xl mx-auto py-12">
            <h2 className="text-3xl font-bold mb-8">Games</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {games.map((game, index) => (
                <div
                  key={index}
                  className="relative group h-60 overflow-hidden rounded-3xl shadow-2xl"
                >
                  <div className="absolute inset-0">
                    <Image
                      src={game.image}
                      alt={game.name}
                      fill
                      className={`object-cover transition-transform duration-700 ${
                        game.available ? "group-hover:scale-110" : ""
                      }`}
                    />
                  </div>
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-700 ${
                      game.available ? "opacity-70 group-hover:opacity-50" : "opacity-80"
                    }`}
                  ></div>
                  <div className="absolute bottom-6 left-6 z-10 transition-transform duration-700 group-hover:-translate-y-2">
                    <h3 className="text-2xl font-semibold text-white drop-shadow-lg">
                      {game.name}
                    </h3>
                  </div>
                  {game.available ? (
                    <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <button className="bg-secondary px-6 py-2 rounded-full text-lg font-semibold text-text shadow-md hover:bg-thirty transition-colors duration-300">
                        Let's go
                      </button>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <span className="bg-gray-800 bg-opacity-75 text-white text-lg font-bold px-6 py-2 rounded-full shadow-md">
                        Coming soon
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </main>
    </div>
  )
}
