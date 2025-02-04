import AuthButton from "@/config/authButton";

export default function Header() {

  return (
    <header className="flex justify-between items-center px-8 py-6 bg-primary bg-opacity-80 backdrop-blur-md shadow-md">
        <div className="flex items-center space-x-3">
            <h1 className="text-4xl font-extrabold tracking-tight">blinky.gg</h1>
            <span className="px-3 py-1 bg-secondary text-xs uppercase rounded-full font-semibold">
                testnet
            </span>
        </div>
        <AuthButton/>
    </header>
  );
}
  

  