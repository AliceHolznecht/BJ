import { useState } from "react";
import About from "./components/About";
import Hero from "./components/Hero";
import NavBar from "./components/Navbar";
import Story from "./components/Story";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

// Define your soundtracks for each page
const soundtracks = {
  hero: "/audio/hero-theme.wav",
  about: "/audio/about-theme.wav",
  features: "/audio/features-theme.wav",
  contact: "/audio/contact-theme.wav",
};

function App() {
  const [currentPage, setCurrentPage] = useState("hero");

  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden">
      <NavBar soundtrack={soundtracks[currentPage]} />
      <div onMouseEnter={() => setCurrentPage("hero")}>
        <Hero />
      </div>
      <div onMouseEnter={() => setCurrentPage("about")}>
        <About />
      </div>
      <div onMouseEnter={() => setCurrentPage("story")}>
        <Story />
      </div>
      <div onMouseEnter={() => setCurrentPage("contact")}>
        <Contact />
      </div>
      <Footer />
    </main>
  );
}

export default App;