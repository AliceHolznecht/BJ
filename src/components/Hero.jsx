import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/all";
import { useEffect, useRef, useState } from "react";
import VideoPreview from "./VideoPreview";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  /* ────────────────────────────── state & refs ───────────────────────────── */
  const [currentIndex, setCurrentIndex] = useState(1);
  const [hasClicked, setHasClicked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadedVideos, setLoadedVideos] = useState(0);

  const totalVideos = 4;
  const nextVdRef = useRef(null);
  const heroRef   = useRef(null);

  /* ────────────────────────────── video loader ───────────────────────────── */
  const handleVideoLoad = (e) => {
    setLoadedVideos((prev) => prev + 1);
    e.target.dataset.ready = "true";
  };

  useEffect(() => {
    if (loadedVideos === totalVideos - 1) {
      setLoading(false);
    }
  }, [loadedVideos]);

  /* ─────────── prevent overscroll when at the very top (unchanged) ───────── */
  useEffect(() => {
    const preventOverscroll = (e) => {
      if (window.scrollY <= 0 && e.deltaY < 0) e.preventDefault();
    };
    const preventTouchOverscroll = (e) => {
      if (window.scrollY <= 0) e.preventDefault();
    };

    window.addEventListener("wheel", preventOverscroll, { passive: false });
    window.addEventListener("touchmove", preventTouchOverscroll, {
      passive: false,
    });

    return () => {
      window.removeEventListener("wheel", preventOverscroll);
      window.removeEventListener("touchmove", preventTouchOverscroll);
    };
  }, []);

  /* ───────────────────────────── autoplay control ────────────────────────── */
  useGSAP(
    () => {
      const section = heroRef.current;
      if (!section) return;

      const videos = gsap.utils.toArray(section.querySelectorAll("video"));

      const playVideos = () =>
        videos.forEach((v) => v.dataset.ready && v.play?.().catch(() => {}));
      const pauseVideos = () => videos.forEach((v) => v.pause?.());

      const st = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",    
        onEnter:      playVideos,
        onEnterBack:  playVideos,
        onLeave:      pauseVideos,
        onLeaveBack:  pauseVideos,
      });

      return () => st.kill();
    },
    { dependencies: [] }
  );

  /* ────────────────── click → swap preview / hero animation ─────────────── */
  const handleMiniVdClick = () => {
    setHasClicked(true);
    setCurrentIndex((prevIndex) => (prevIndex % totalVideos) + 1);
  };

  useGSAP(
    () => {
      if (hasClicked) {
        gsap.set("#next-video", { visibility: "visible" });
        gsap.to("#next-video", {
          transformOrigin: "center center",
          scale: 1,
          width: "100%",
          height: "100%",
          duration: 1,
          ease: "power1.inOut",
          onStart: () => nextVdRef.current.play(),
        });
        gsap.from("#current-video", {
          transformOrigin: "center center",
          scale: 0,
          duration: 1.5,
          ease: "power1.inOut",
        });
      }
    },
    { dependencies: [currentIndex], revertOnUpdate: true }
  );

  /* ─────────────────────── fancy frame morph scroll anim ─────────────────── */
  useGSAP(() => {
    gsap.set("#video-frame", {
      clipPath: "polygon(14% 0, 72% 0, 88% 90%, 0 95%)",
      borderRadius: "0% 0% 40% 10%",
    });
    gsap.from("#video-frame", {
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      borderRadius: "0",
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: "#video-frame",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
    });
  });

  /* ─────────────────────────── helpers / JSX ─────────────────────────────── */
  const getVideoSrc = (index) => `videos/hero-${index}.mp4`;

  return (
    <div ref={heroRef} className="relative h-dvh w-screen overflow-x-hidden">
      {/* loader ------------------------------------------------------------ */}
      {loading && (
        <div className="flex-center absolute z-[100] h-dvh w-screen overflow-hidden bg-violet-50">
          <div className="three-body">
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
            <div className="three-body__dot"></div>
          </div>
        </div>
      )}

      {/* video frame ------------------------------------------------------- */}
      <div
        id="video-frame"
        className="relative z-10 h-dvh w-screen overflow-hidden rounded-lg bg-blue-75"
      >
        <div>
          {/* tiny preview -------------------------------------------------- */}
          <div className="mask-clip-path absolute-center absolute z-50 size-64 cursor-pointer overflow-hidden rounded-lg">
            <VideoPreview>
              <div
                onClick={handleMiniVdClick}
                className="origin-center scale-50 opacity-0 transition-all duration-500 ease-in hover:scale-100 hover:opacity-100"
              >
                <video
                  ref={nextVdRef}
                  src={getVideoSrc((currentIndex % totalVideos) + 1)}
                  loop
                  muted
                  id="current-video"
                  className="size-64 origin-center scale-150 object-cover object-center"
                  onLoadedData={handleVideoLoad}
                />
              </div>
            </VideoPreview>
          </div>

          {/* grows to full size on click ----------------------------------- */}
          <video
            ref={nextVdRef}
            src={getVideoSrc(currentIndex)}
            loop
            muted
            id="next-video"
            className="absolute-center invisible absolute z-20 size-64 object-cover object-center"
            onLoadedData={handleVideoLoad}
          />

          {/* full-screen background --------------------------------------- */}
          <video
            src={getVideoSrc(
              currentIndex === totalVideos - 1 ? 1 : currentIndex
            )}
            autoPlay
            loop
            muted
            className="absolute left-0 top-0 size-full object-cover object-center"
            onLoadedData={handleVideoLoad}
          />
        </div>

        {/* overlay text ---------------------------------------------------- */}
        <h1 className="special-font hero-heading absolute bottom-5 right-5 z-40 text-blue-75">
          E<b>x</b>perie<b>n</b>ce
        </h1>

        <div className="absolute left-0 top-0 z-40 size-full">
          <div className="mt-24 px-5 sm:px-10">
            <h1 className="special-font hero-heading text-blue-100">
              Redefi<b>n</b>e
            </h1>

            <p className="mb-5 max-w-64 font-robert-regular text-blue-100">
              {/* your subtitle / tagline here */}
            </p>
          </div>
        </div>
      </div>

      {/* bottom-right shadow headline ------------------------------------- */}
      <h1 className="special-font hero-heading absolute bottom-5 right-5 text-black">
        E<b>x</b>perie<b>n</b><b>c</b>e
      </h1>
    </div>
  );
};

export default Hero;