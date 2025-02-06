import Image from "next/image";
import GamePage from "@/components/game/dashboard";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
export default function Game() {
  return (
    <div className="min-h-screen bg-primary text-text flex flex-col">
      <Header />
      <GamePage/>
    </div>
  );
}
