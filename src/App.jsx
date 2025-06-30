// src/App.jsx
import { useState } from "react";
import About from "./components/About";
import Hero from "./components/Hero";
import NavBar from "./components/Navbar";
import Features from "./components/Features";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import useAssetLoader from "./hooks/useAssetLoader"; // Import the hook

// Define your soundtracks and other assets for each page
const soundtracks = {
  hero: "/audio/hero-theme.wav",
  about: "/audio/about-theme.wav",
  features: "/audio/features-theme.wav",
  contact: "/audio/contact-theme.wav",
};

const imageAssets = [
  "/img/about.jpg",
  "/videos/feature-1.jpg",
  "/videos/feature-2.jpg",
  "/videos/feature-3.jpg",
  "/videos/feature-5.jpg",
  "/videos/feature-6.jpg",
  "/videos/阿勒泰.jpg",
  "/videos/伊犁 (2).jpg",
  "/videos/伊犁 (3).jpg",
  "/videos/舟山.jpg",
  "/videos/舟山 (2).jpg",
  "/videos/舟山 (3).jpg",
  "/videos/Melbourne.jpg",
  "/videos/北京市.jpg",
  "/videos/万宁.jpg",
  "/videos/伊犁.jpg",
];

const videoAssets = [
  "/videos/hero-1.mp4",
  "/videos/hero-2.mp4",
  "/videos/hero-3.mp4",
  "/videos/hero-4.mp4",
];

const allAssets = [...Object.values(soundtracks), ...imageAssets, ...videoAssets];

function App() {
  const [currentPage, setCurrentPage] = useState("hero");
  const { loaded: assetsLoaded, error: assetsError } = useAssetLoader(allAssets);

  if (assetsError) {
    return (
      <div className="flex-center h-screen w-screen bg-red-100 text-red-700">
        Error loading assets. Please refresh the page.
      </div>
    );
  }

  if (!assetsLoaded) {
    return (
      <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-violet-50">
        {/* You can use your existing loading animation here */}
        <div className="three-body">
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
          <div className="three-body__dot"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-screen overflow-x-hidden">
      <NavBar soundtrack={soundtracks[currentPage]} />
      <div onMouseEnter={() => setCurrentPage("hero")}>
        <Hero />
      </div>
      <div onMouseEnter={() => setCurrentPage("about")}>
        <About />
      </div>
      <div onMouseEnter={() => setCurrentPage("features")}>
        <Features />
      </div>
      <div onMouseEnter={() => setCurrentPage("contact")}>
        <Contact />
      </div>
      <Footer />
    </main>
  );
}

export default App;