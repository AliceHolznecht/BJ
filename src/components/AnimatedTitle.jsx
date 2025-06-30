import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";

gsap.registerPlugin(ScrollTrigger);

const AnimatedTitle = ({ title, containerClass }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words = gsap.utils.toArray(".animated-word");
      const container = containerRef.current;
      
      // Set faceted initial positions
      gsap.set(words, {
        opacity: 0,
        scale: 0.1,
        transformStyle: "preserve-3d",
        rotationX: () => gsap.utils.random(-180, 180),
        rotationY: () => gsap.utils.random(-180, 180),
        z: () => gsap.utils.random(-3000, -1500)
      });

      // Create staggered timeline with crystal growth effect
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 76%",
          end: "top 35%",
          scrub: 1.5,
          toggleActions: "play none none reverse"
        }
      });

      // Crystal formation animation
      words.forEach((word, i) => {
        const angle = (i / words.length) * Math.PI * 2;
        const radius = 800;
        
        tl.fromTo(word, {
          x: Math.cos(angle) * radius,
          y: Math.sin(angle) * radius,
          z: gsap.utils.random(-2500, -1500),
          rotationZ: gsap.utils.random(-90, 90)
        }, {
          opacity: 1,
          x: 0,
          y: 0,
          z: 0,
          rotationX: 0,
          rotationY: 0,
          rotationZ: 0,
          scale: 1,
          ease: "elastic.out(1, 0.8)",
          duration: 2.5
        }, i * 0.05);
      });

      // Add ambient rotation to container
      tl.to(container, {
        rotationY: 5,
        rotationX: 2,
        duration: 1,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 1
      }, 0);

      // Add lighting effect
      tl.to(words, {
        keyframes: [
          { textShadow: "0 0 15px rgba(240, 242, 250, 0.8)", duration: 0.5 },
          { textShadow: "0 0 30px rgba(87, 36, 255, 0.6)", duration: 0.8 },
          { textShadow: "0 0 10px rgba(240, 242, 250, 0.3)", duration: 1 }
        ]
      }, 0.5);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={clsx("animated-title special-font", containerClass)}
    >
      {title.split("<br />").map((line, index) => (
        <div
          key={index}
          className="flex-center max-w-full flex-wrap gap-2 px-10 md:gap-3"
        >
          {line.split(" ").map((word, idx) => (
            <span
              key={idx}
              className="animated-word inline-block will-change-transform"
              dangerouslySetInnerHTML={{ __html: word }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default AnimatedTitle;