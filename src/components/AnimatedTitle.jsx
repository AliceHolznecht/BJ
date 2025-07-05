import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import clsx from "clsx";

gsap.registerPlugin(ScrollTrigger);

const phi          = (1 + Math.sqrt(5)) / 2;
const baseDuration = 4.0;                     // extended
const baseStagger  = baseDuration / phi;

const AnimatedTitle = ({ title, containerClass }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const words     = gsap.utils.toArray(".animated-word");
      const container = containerRef.current;

      gsap.set(words, {
        opacity:       0,
        scale:         0.1,
        transformStyle:"preserve-3d",
        rotationX:     () => gsap.utils.random(-180, 180),
        rotationY:     () => gsap.utils.random(-180, 180),
        z:             () => gsap.utils.random(-3000, -1500)
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger:        container,
          start:          "top 95%",
          end:            "top 75%",
          scrub:          1.0,
          toggleActions:  "play none none reverse"
        }
      });

      words.forEach((word, i) => {
        const angle    = (i / words.length) * Math.PI * 2;
        const radius   = 800;
        const delay    = baseStagger * Math.pow(phi, -(i / words.length));
        const duration = baseDuration   / Math.pow(phi,  (i / words.length));

        tl.fromTo(word, {
          x:         Math.cos(angle) * radius,
          y:         Math.sin(angle) * radius,
          z:         gsap.utils.random(-2500, -1500),
          rotationZ: gsap.utils.random(-90, 90)
        }, {
          opacity:    1,
          x:          0, y: 0, z: 0,
          rotationX:  0, rotationY: 0, rotationZ: 0,
          scale:      1,
          ease:       "elastic.out(1, 0.6)",
          duration
        }, delay);
      });

      tl.to(container, {
        rotationY: 3,
        rotationX: 1.5,
        duration:  phi * 1.2,
        ease:      "sine.inOut",
        yoyo:      true,
        repeat:    1
      }, 0);

      tl.to(words, {
        keyframes: [
          { textShadow: "0 0 15px rgba(240,242,250,0.8)", duration: phi / 2 },
          { textShadow: "0 0 30px rgba(87,36,255,0.6)",   duration: phi / 1.5 },
          { textShadow: "0 0 10px rgba(240,242,250,0.3)", duration: phi / 1.1 }
        ]
      }, baseStagger);

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={clsx("animated-title special-font", containerClass)}
    >
      {title.split("<br />").map((line, idx) => (
        <div key={idx} className="flex-center max-w-full flex-wrap gap-2 px-10 md:gap-3">
          {line.split(" ").map((word, i) => (
            <span
              key={i}
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
