import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import AnimatedTitle from "./AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  useGSAP(() => {
    // Enhanced 3D container perspective
    gsap.set("#clip", {
      perspective: 3000,
    });

    // Initial 3D state with more dramatic angles
    gsap.set(".about-image", {
      rotationY: 40,
      rotationX: 15,
      scale: 1.2,
      transformOrigin: "50% 50%",
      transformStyle: "preserve-3d",
      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    });
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#clip",
        start: "top top",
        end: "+=3000px",
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: true,
        ease: "power3.out"
      },
    });
    // Phase 1: Dynamic 3D rotation with depth shift
    tl.to(".about-image", {
      rotationY: 15,
      rotationX: 5,
      scale: 1.1,
      duration: 1.5,
      ease: "power3.out"
    })
    // Phase 2: Cinematic zoom with perspective shift
    .to(".about-image", {
      rotationY: 0,
      rotationX: 0,
      scale: 1.05,
      width: "120vw",
      height: "120vh",
      borderRadius: "20%",
      boxShadow: "0 30px 60px rgba(0,0,0,0.4)",
      duration: 2,
      ease: "power4.inOut"
    })
    // Phase 3: Final immersive perspective
    .to(".about-image", {
      rotationY: 0,
      rotationX: 0,
      scale: 1.05,
      duration: 1.5,
      ease: "elastic.out(1, 0.5)"
    });
  });

  return (
    <div id="about" className="min-h-screen w-screen">
      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5">
        <p className="font-general font-medium text-sm uppercase md:text-[11px]">
          Welcome to BJ STUDIO
        </p>
        <AnimatedTitle
          title="Cr<b>a</b>fting world-class<br />digit<b>a</b>l experie<b>n</b>ce"
          containerClass="mt-5 !text-black text-center"
        />
      </div>

      <div
        id="clip"
        className="h-screen w-full flex items-center justify-center relative"
      >
        <div className="about-image w-full h-full" style={{ willChange: 'transform' }}>
          <img
            src="img/about.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default About;