import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx"; // You might need to install this: npm install clsx

// Register the GSAP plugin
gsap.registerPlugin(ScrollTrigger);

// Helper function for random animation values (behavior, not position)
const generateRandomValues = (count, min, max) => {
  return Array.from({ length: count }, () => Math.random() * (max - min) + min);
};

// --- Aquarius layout function (UNCHANGED) ---
const generateAquariusLayout = (imageCount) => {
  const spreadFactor = 1.3;
  const starCoordinates = [
    { x: 55, y: 20 }, { x: 45, y: 35 }, { x: 25, y: 40 },
    { x: 80, y: 25 }, { x: 90, y: 35 }, { x: 75, y: 40 },
    { x: 60, y: 65 }, { x: 40, y: 80 }, { x: 75, y: 85 },
    { x: 95, y: 70 },
  ];
  const scaledStarCoordinates = starCoordinates.map(pos => ({
    x: (pos.x - 50) * spreadFactor + 50,
    y: (pos.y - 50) * spreadFactor + 50,
  }));
  const connections = [
    [0, 1], [1, 2], [0, 3], [3, 4], [3, 5],
    [4, 5], [1, 6], [6, 8], [2, 7],
  ];
  let finalPositions = [];
  scaledStarCoordinates.forEach(pos => finalPositions.push(pos));
  const imagesPlaced = finalPositions.length;
  if (imageCount <= imagesPlaced) {
    finalPositions = finalPositions.slice(0, imageCount);
  } else {
    let remainingImages = imageCount - imagesPlaced;
    const imagesPerConnection = Math.floor(remainingImages / connections.length);
    let extraImages = remainingImages % connections.length;
    connections.forEach(connection => {
      const p1 = scaledStarCoordinates[connection[0]];
      const p2 = scaledStarCoordinates[connection[1]];
      let numToPlace = imagesPerConnection + (extraImages > 0 ? 1 : 0);
      if(extraImages > 0) extraImages--;
      for (let i = 1; i <= numToPlace; i++) {
        const t = i / (numToPlace + 1);
        const newX = p1.x + t * (p2.x - p1.x);
        const newY = p1.y + t * (p2.y - p1.y);
        finalPositions.push({ x: newX, y: newY });
      }
    });
  }
  return finalPositions.map(pos => {
    const offsetX = -18;
    const offsetY = -13;
    const screenPadding = 10;
    const scale = 100 - 2 * screenPadding;
    return {
      top: `${(pos.y + offsetY) * (scale / 100) + screenPadding}%`,
      left: `${(pos.x + offsetX) * (scale / 100) + screenPadding}%`,
    };
  });
};


const Story = () => {
  // Main refs for containers and elements
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const titleContainerRef = useRef(null);
  const wordsRef = useRef([]);

  // Refs for animation properties
  const mousePosRef = useRef({ x: 0, y: 0 });
  const imageAnimProps = useRef([]);

  // Component configuration
  const IMAGE_COUNT = 30;
  const images = Array.from({ length: IMAGE_COUNT }, (_, i) => `/img/about${i + 1}.jpg`); // Assumes images are in public/img/about
  const imagePositions = generateAquariusLayout(IMAGE_COUNT);
  
  // Title configuration
  const title = "Featured work";
  const phi = (1 + Math.sqrt(5)) / 2;
  const baseDuration = 4.0;
  const baseStagger = baseDuration / phi;

  // Random values for parallax effect
  const parallaxSpeeds = generateRandomValues(IMAGE_COUNT, 0.7, 1.6);
  const rotationSpeeds = generateRandomValues(IMAGE_COUNT, 0.2, 0.8);
  const scaleSpeeds = generateRandomValues(IMAGE_COUNT, 0.01, 0.05);

  // --- Effect for MOUSE PARALLAX ---
  useEffect(() => {
    const container = containerRef.current;
    const imageElements = imagesRef.current;
    if (!container || imageElements.length === 0) return;

    imageAnimProps.current = imageElements.map(() => ({ currentScale: 1 }));
    const PROXIMITY_RADIUS = 120;
    const MAX_PROXIMITY_SCALE = 4;
    const Z_INDEX_BASE = 1;
    const Z_INDEX_TOP = IMAGE_COUNT;
    let mouseX = 0, mouseY = 0, currentX = 0, currentY = 0;
    let velocity = { x: 0, y: 0 };

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mousePosRef.current = { x: clientX, y: clientY };
      const newMouseX = (clientX - innerWidth / 2) / (innerWidth / 2);
      const newMouseY = (clientY - innerHeight / 2) / (innerHeight / 2);
      velocity.x = newMouseX - mouseX;
      velocity.y = newMouseY - mouseY;
      mouseX = newMouseX;
      mouseY = newMouseY;
    };

    const lerp = (start, end, factor) => start + (end - start) * factor;

    const ticker = gsap.ticker.add(() => {
      currentX = lerp(currentX, mouseX, 0.12);
      currentY = lerp(currentY, mouseY, 0.12);
      const { x: rawMouseX, y: rawMouseY } = mousePosRef.current;
      let closestImageIndex = -1, minDistance = Infinity;

      imageElements.forEach((img, index) => {
        if (!img) return;
        const rect = img.getBoundingClientRect();
        const distance = Math.hypot(
          rect.left + rect.width / 2 - rawMouseX,
          rect.top + rect.height / 2 - rawMouseY
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestImageIndex = index;
        }

        let proximityScale = 1;
        if (distance < PROXIMITY_RADIUS) {
          proximityScale = 1 + (MAX_PROXIMITY_SCALE - 1) * (1 - distance / PROXIMITY_RADIUS);
        }

        const xMove = -currentX * 300 * parallaxSpeeds[index];
        const yMove = -currentY * 300 * parallaxSpeeds[index];
        const rotation = (-currentX * 15 * rotationSpeeds[index]) + (-velocity.x * 30);
        const parallaxScale = 1 + (Math.abs(currentX) + Math.abs(currentY)) * scaleSpeeds[index];
        const targetScale = parallaxScale * proximityScale;

        const props = imageAnimProps.current[index];
        props.currentScale = lerp(props.currentScale, targetScale, 0.1);

        gsap.set(img, {
          x: xMove,
          y: yMove,
          rotation,
          scale: props.currentScale,
          force3D: true,
          transformOrigin: "center center",
          willChange: "transform"
        });
      });

      imageElements.forEach((img, index) => {
        if(img) {
          const isClosestAndInRange = index === closestImageIndex && minDistance < PROXIMITY_RADIUS;
          gsap.set(img, { zIndex: isClosestAndInRange ? Z_INDEX_TOP : Z_INDEX_BASE });
        }
      });
    });

    container.addEventListener('mousemove', handleMouseMove);
    gsap.set(imageElements, { force3D: true, transformOrigin: "center center" });

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      gsap.ticker.remove(ticker);
    };
  }, []); // Empty dependency array ensures this runs once

  // --- MERGED Effect for Scroll-Triggered Animation (Pinning, Images, and Title) ---
useEffect(() => {
    // Wait for all elements to be rendered
    if (!containerRef.current || imagesRef.current.length === 0 || wordsRef.current.length === 0) return;

    const imageWrappers = imagesRef.current;
    const titleWords = wordsRef.current.filter(Boolean);

    // --- Part 1: Set Initial States ---
    gsap.set(imageWrappers, { scale: 0, opacity: 0 });
    gsap.set(titleWords, {
      opacity: 0,
      scale: 0.1,
      transformStyle: "preserve-3d",
      rotationX: () => gsap.utils.random(-180, 180),
      rotationY: () => gsap.utils.random(-180, 180),
      z: () => gsap.utils.random(-3000, -1500)
    });

    // --- Part 2: Create the Master Timeline ---
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        start: "top top",
        // STEP 2: We must increase the total scroll distance to accommodate the pause.
        // The original animations will still happen over the first 2500px,
        // and the new pause will happen over the extra 2000px.
        end: "+=4500", // Original was 2500. We add 2000 for the pause.
        scrub: 1,
        anticipatePin: 1,
      },
    });

    // --- Part 3: Add Animations to the Master Timeline ---

    // Animate the images
    tl.to(imageWrappers, {
      scale: 1,
      opacity: 1,
      stagger: 0.1,
      ease: "power2.out",
    });

    // Animate the title words
    titleWords.forEach((word, i) => {
      const angle = (i / titleWords.length) * Math.PI * 2;
      const radius = 800;
      const delay = baseStagger * Math.pow(phi, -(i / titleWords.length));
      const duration = baseDuration / Math.pow(phi, (i / titleWords.length));

      tl.fromTo(word, {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: gsap.utils.random(-2500, -1500),
        rotationZ: gsap.utils.random(-90, 90)
      }, {
        opacity: 1,
        x: 0, y: 0, z: 0,
        rotationX: 0, rotationY: 0, rotationZ: 0,
        scale: 1,
        ease: "elastic.out(1, 0.6)",
        duration
      }, "<" + delay);
    });
    
    // Add the text shadow glow effect
    tl.to(titleWords, {
      keyframes: [
        { textShadow: "0 0 15px rgba(240,242,250,0.8)", duration: phi / 2 },
        { textShadow: "0 0 30px rgba(87,36,255,0.6)",   duration: phi / 1.5 },
        { textShadow: "0 0 10px rgba(240,242,250,0.3)", duration: phi / 1.1 }
      ]
    }, baseStagger);

    // STEP 1: Add a "pause" to the end of the timeline.
    // Instead of .addPause(), an empty tween is the cleanest way to add
    // pure duration to a scrubbed timeline. This adds "empty time".
    tl.to({}, { duration: tl.duration() * 0.8 }); // The "pause" will be 80% as long as the entire animation that came before it.

    // Cleanup function
    return () => {
      tl.scrollTrigger?.kill();
    };
}, []);


  return (
    <div ref={containerRef} id="work" className="relative min-h-dvh w-screen bg-black text-blue-50 flex items-center justify-center overflow-hidden">
      
      {/* Title JSX is now directly inside Story.jsx */}
      <div
        ref={titleContainerRef}
        className={clsx(
          "absolute inset-0 flex items-center justify-center z-30 pointer-events-none",
          "animated-title special-font mix-blend-difference" // Add your font/styling classes
        )}
      >
        {title.split("<br />").map((line, lineIdx) => (
          <div key={lineIdx} className="flex-center max-w-full flex-wrap gap-2 px-10 md:gap-3">
            {line.split(" ").map((word, wordIdx) => {
              const globalWordIndex = (line.split(" ").slice(0, wordIdx)).length + (lineIdx > 0 ? title.split(" ")[0].split(" ").length : 0);
              return (
                <span
                  key={wordIdx}
                  ref={(el) => (wordsRef.current[globalWordIndex] = el)}
                  className="animated-word inline-block will-change-transform"
                  dangerouslySetInnerHTML={{ __html: word }}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Image container */}
      <div className="absolute inset-0">
        {images.map((imagePath, index) => (
          <div
            key={index}
            ref={(el) => (imagesRef.current[index] = el)}
            className="absolute"
            style={{
              top: imagePositions[index]?.top,
              left: imagePositions[index]?.left,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <img
              src={imagePath}
              alt={`Story image ${index + 1}`}
              className="max-w-32 max-h-32 md:max-w-40 md:max-h-40 lg:max-w-48 lg:max-h-48 rounded-2xl"
            />
            <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-sm pointer-events-none">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Story;