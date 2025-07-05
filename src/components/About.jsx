import React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useGSAP } from "@gsap/react";
import AnimatedTitle from "./AnimatedTitle";

gsap.registerPlugin(ScrollTrigger);

const images = Array.from({ length: 17 }, (_, i) => `img/about${i + 1}.jpg`);

const About = () => {
  useGSAP(() => {
    // --- 1. SETUP ---
    const imageContainer = document.querySelector('[data-image-container="main"]');
    const imageElement = imageContainer.querySelector("img");
    const clipContainer = document.querySelector("#clip");
    const leftText = document.querySelector('[data-text-container="left"]');
    const rightText = document.querySelector('[data-text-container="right"]');

    images.forEach((src) => { new Image().src = src; });

    gsap.set(clipContainer, { perspective: 3000 });
    gsap.set(imageContainer, {
      rotationY: 40,
      rotationX: 15,
      scale: 1.2,
      transformOrigin: "50% 50%",
      transformStyle: "preserve-3d",
      force3D: true
    });
    gsap.set([leftText, rightText], { opacity: 0, y: 20 });

    // --- 2. MAIN SCROLL-PIN TIMELINE ---
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: clipContainer,
        start: "top top",
        // STEP 2: ADJUST THE END VALUE
        // The original end was 6000. We increase it to give the new, longer
        // proportional pause enough physical scroll distance to feel substantial.
        end: "+=9000",
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      },
    });

    // Add all the main animations to the timeline
    tl
      .to(imageContainer, {
        rotationY: 15, rotationX: 5, scale: 1.1,
        duration: 3, ease: "power3.out",
      })
      .to(leftText, { opacity: 1, y: 0, duration: 1.5, ease: "power2.out" }, "<0.5")
      .addLabel("text1-out", "+=2")
      .to(leftText, { opacity: 0, y: -20, duration: 1.5, ease: "power2.in" }, "text1-out")
      .to(rightText, { opacity: 1, y: 0, duration: 1.5, ease: "power2.out" }, "text1-out")
      .addLabel("text2-out", "+=2")
      .to(rightText, { opacity: 0, y: -20, duration: 1.5, ease: "power2.in" }, "text2-out")
      .addLabel("zoom", "-=1")
      .to(imageContainer, {
        rotationY: 0, rotationX: 0, scale: 4, borderRadius: "20%",
        duration: 4, ease: "power4.inOut",
      }, "zoom");

    // STEP 1: ADD THE PROPORTIONAL PAUSE
    // We replace the old `.addPause("+=3")` with a more robust empty tween.
    // This adds "empty time" to the end of the timeline that is 60% as long
    // as all the animations that came before it, creating a balanced pause.
    tl.to({}, { duration: tl.duration() * 0.2 });


    // --- 3. IMAGE SEQUENCE SCROLL (NO CHANGES HERE) ---
    const frame = { index: 0 };
    gsap.to(frame, {
      index: images.length - 1,
      snap: "index",
      ease: "none",
      scrollTrigger: {
        trigger: clipContainer,
        start: "top top",
        end: "+=3500",
        scrub: 1,
        onLeave: () => (imageElement.src = images[images.length - 1]),
      },
      onUpdate: () => {
        imageElement.src = images[Math.round(frame.index)];
      },
    });

  }, []);

  return (
    <div id="about" className="min-h-screen w-screen">
      <div className="relative mb-8 mt-36 flex flex-col items-center gap-5 px-4">
        <p className="font-general text-sm font-medium uppercase md:text-[11px]">
          Welcome to BJ STUDIO
        </p>
        <AnimatedTitle
          title="We <b>h</b>elp br<b>a</b>nds <b>c</b>reate <br />digit<b>a</b>l experien<b>c</b>es"
          containerClass="mt-5 !text-black text-center"
        />
      </div>

      <div id="clip">
        <div data-text-container="left" className="text-container left-10 w-1/4">
          <p className="font-general text-lg font-medium uppercase">
            BJ STUDIO is a digital production studio that brings your ideas to life through visually captivating designs and interactive experiences.
          </p>
        </div>
        <div data-image-container="main" className="about-image">
          <img
            src={images[0]}
            alt="About frame"
            className="w-full h-full object-cover object-center rounded-2xl"
          />
        </div>
        <div data-text-container="right" className="text-container right-10 w-1/4">
          <p className="font-general text-lg font-medium uppercase">
            At BJ STUDIO, we don't follow trends for the sake of it. We believe in a different approach - one that's centered around you, your audience, and the art of creating a memorable, personalized experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;