"use client";

import { usePrivy } from "@privy-io/react-auth";

function AuthButton() {
  const { ready, authenticated, login, logout } = usePrivy();

  return (
    <div>
      {authenticated && ready ? (
        <button
          type="button"
          onClick={logout}
          className="bg-primary text-background font-bold py-2 px-4 rounded-lg"
        >
          Disconnect
        </button>
      ) : (
        <button
          type="button"
          onClick={login}
          className="px-6 py-2 bg-secondary hover:bg-thirty transition-colors duration-300 text-text font-bold rounded-full shadow-lg"
      >
        Connect Wallet
        </button>
      )}
    </div>
  );
}

export default AuthButton;