import clsx from "clsx";
import gsap from "gsap";
import { useWindowScroll } from "react-use";
import { useEffect, useRef, useState, useLayoutEffect, useCallback } from "react";
import { TiLocationArrow } from "react-icons/ti";

import Button from "./Button";

const navItems = ["About", "Portofolio", "Contact"];

const NavBar = ({ soundtrack }) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isIndicatorActive, setIsIndicatorActive] = useState(false);
  const [activeIndex, setActiveIndex] = useState(null);

  const audioElementRef = useRef(null);
  const navContainerRef = useRef(null);
  const highlightRef = useRef(null);
  const navItemRefs = useRef([]);
  const mouseLeftRef = useRef(false);

  const { y: currentScrollY } = useWindowScroll();
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleAudioIndicator = () => {
    setIsAudioPlaying((prev) => !prev);
    setIsIndicatorActive((prev) => !prev);
  };

  useEffect(() => {
    if (isAudioPlaying) {
      audioElementRef.current.play();
    } else {
      audioElementRef.current.pause();
    }
  }, [isAudioPlaying]);

  useEffect(() => {
    if (soundtrack) {
      audioElementRef.current.src = soundtrack;
      if (isAudioPlaying) {
        audioElementRef.current.play();
      }
    }
  }, [soundtrack, isAudioPlaying]);

  useEffect(() => {
    if (currentScrollY === 0) {
      setIsNavVisible(true);
      navContainerRef.current.classList.remove("floating-nav");
    } else if (currentScrollY > lastScrollY) {
      setIsNavVisible(false);
      navContainerRef.current.classList.add("floating-nav");
    } else if (currentScrollY < lastScrollY) {
      setIsNavVisible(true);
      navContainerRef.current.classList.add("floating-nav");
    }
    setLastScrollY(currentScrollY);
  }, [currentScrollY, lastScrollY]);

  useEffect(() => {
    gsap.to(navContainerRef.current, {
      y: isNavVisible ? "0%" : "-100%",
      autoAlpha: isNavVisible ? 1 : 0,
      duration: 0.35,
      ease: "power6.inOut",
      force3D: true,
      onStart: () => {
        gsap.set(navContainerRef.current, { willChange: "transform, opacity" });
      },
      onComplete: () => {
        gsap.set(navContainerRef.current, { clearProps: "willChange" });
      }
    });
  }, [isNavVisible]);

  useLayoutEffect(() => {
    if (navItemRefs.current.length > 0) {
      const firstEl = navItemRefs.current[0];
      gsap.set(highlightRef.current, {
        left: firstEl.offsetLeft,
        top: firstEl.offsetTop,
        width: 0,
        height: 0,
        opacity: 0,
        scale: 1
      });
    }
  }, []);

  useEffect(() => {
    gsap.killTweensOf(highlightRef.current);
    if (activeIndex !== null && navItemRefs.current[activeIndex]) {
      const el = navItemRefs.current[activeIndex];
      const tl = gsap.timeline();

      if (mouseLeftRef.current) {
        gsap.set(highlightRef.current, {
          left: el.offsetLeft,
          top: el.offsetTop,
          width: el.offsetWidth,
          height: el.offsetHeight,
          opacity: 1,
          scale: 1,
        });
        tl.fromTo(
          highlightRef.current,
          { scale: 0.9 },
          { scale: 1.2, duration: 0.2, ease: "back.out(1.7)" }
        );
        tl.to(
          highlightRef.current,
          { scale: 1, duration: 0.1, ease: "power2.out" }
        );
        mouseLeftRef.current = false;
      } else {
        tl.to(
          highlightRef.current,
          {
            left: el.offsetLeft,
            top: el.offsetTop,
            width: el.offsetWidth,
            height: el.offsetHeight,
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
          },
          0
        );
        tl.fromTo(
          highlightRef.current,
          { scale: 0.9 },
          { scale: 1.2, duration: 0.2, ease: "back.out(1.7)" },
          0
        );
        tl.to(
          highlightRef.current,
          { scale: 1, duration: 0.1, ease: "power2.out" },
          0.2
        );
      }
    } else {
      gsap.to(highlightRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.out",
      });
    }
  }, [activeIndex]);

  const handleResize = useCallback(() => {
    if (activeIndex !== null && navItemRefs.current[activeIndex]) {
      const el = navItemRefs.current[activeIndex];
      gsap.set(highlightRef.current, {
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
    }
  }, [activeIndex]);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  return (
    <div
      ref={navContainerRef}
      className="fixed inset-x-0 top-2.5 z-50 h-20 border-none sm:inset-x-4"
    >
      <header className="absolute top-1/2 w-full -translate-y-1/2">
        <nav className="flex items-center justify-between p-7">
          <div className="flex items-center gap-7">
            <img src="/img/logo.png" alt="logo" className="w-16" />
            <Button
              id="product-button"
              title="Products"
              rightIcon={<TiLocationArrow />}
              containerClass="bg-blue-50 md:flex hidden items-center justify-center gap-1"
            />
          </div>
          <div className="flex h-full items-center">
            <div
              className="hidden md:block relative nav-links"
              onMouseLeave={() => {
                mouseLeftRef.current = true;
                gsap.killTweensOf(highlightRef.current);
                setActiveIndex(null);
              }}
            >
              <div
                ref={highlightRef}
                className="absolute bg-violet-50 pointer-events-none rounded-full"
                style={{ left: 0, top: 0, width: 0, height: 0, opacity: 0, scale: 1 }}
              ></div>
              {navItems.map((item, index) => (
                <a
                  key={index}
                  ref={(el) => (navItemRefs.current[index] = el)}
                  href={`#${item.toLowerCase()}`}
                  className="relative inline-block px-7 py-3 text-blue-50 hover:text-black font-bold font-general text-xs uppercase"
                  onMouseEnter={() => {
                    gsap.killTweensOf(highlightRef.current);
                    setActiveIndex(index);
                  }}
                >
                  {item}
                </a>
              ))}
            </div>
            {/* The new audio button structure */}
            <a
              onClick={toggleAudioIndicator}
              className="ml-5 flex items-center space-x-1 cursor-pointer p-3" // Increased padding for a larger hit area
              role="button" // Add a role for accessibility
              tabIndex={0} // Make it focusable
              aria-label={isAudioPlaying ? "Pause audio" : "Play audio"} // Add an accessible label
            >
              <audio
                ref={audioElementRef}
                className="hidden"
                src={soundtrack}
                loop
              />
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className={clsx("indicator-line", {
                    active: isIndicatorActive,
                  })}
                  style={{
                    animationDelay: `${bar * 0.1}s`,
                  }}
                />
              ))}
            </a>
          </div>
        </nav>
      </header>
    </div>
  );
};

export default NavBar;