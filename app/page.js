import Image from "next/image";
import MainContent from "@/components/main/mainContent";
import Header from "@/components/common/header";
import Footer from "@/components/common/footer";
export default function Home() {
  return (
    <div className="min-h-screen bg-primary text-text flex flex-col">
      <Header />
      <MainContent/>
    </div>
  );
}
