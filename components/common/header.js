

export default function Header() {

  return (
    <header className="flex justify-between items-center px-8 py-6 bg-primary bg-opacity-80 backdrop-blur-md shadow-md">
        <div className="flex items-center space-x-3">
            <h1 className="text-4xl font-extrabold tracking-tight">blinky.gg</h1>
            <span className="px-3 py-1 bg-secondary text-xs uppercase rounded-full font-semibold">
                alpha
            </span>
        </div>
        <button className="px-6 py-2 bg-secondary hover:bg-thirty transition-colors duration-300 text-text font-bold rounded-full shadow-lg">
            Connect Wallet
        </button>
    </header>
  );
}
  

  