import { useRef, useEffect, useCallback } from "react";
import { TiLocationArrow } from "react-icons/ti";
import { gsap } from "gsap";

export const BentoTilt = ({ children, className = "" }) => (
  <div className={`${className} rounded-3xl`}>{children}</div>
);

export const BentoCard = ({
  src,
  title,
  description,
  onZoomStart,
  onZoomEnd,
}) => {
  const imgRef = useRef(null);
  const itemRef = useRef(null);
  const isZoomed = useRef(false);
  const originalStylesRef = useRef({});
  const overlayRef = useRef(null);
  const cloneRef = useRef(null);
  const isAnimating = useRef(false);
  const lastKnownPosition = useRef({});
  const isInViewport = useRef(false);

  const getAbsolutePosition = useCallback(() => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        borderRadius: "1.5rem",
      };
    }
    return lastKnownPosition.current;
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewport.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          lastKnownPosition.current = getAbsolutePosition();
        }
      },
      { threshold: 0 }
    );
    const currentItemRef = itemRef.current;
    if (currentItemRef) observer.observe(currentItemRef);
    return () => {
      if (currentItemRef) observer.unobserve(currentItemRef);
    };
  }, [getAbsolutePosition]);

  const handleZoomToggle = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    if (onZoomStart) onZoomStart();
  
    // If already zoomed in, we're zooming out
    if (isZoomed.current) {
      const returnToPosition = getAbsolutePosition();
  
      const tl = gsap.timeline({
        defaults: {
          duration: 1.1,
          ease: "power3.inOut" // A smooth and elegant ease for both directions
        },
        onComplete: () => {
          // Clean up the cloned element and reset states
          if (cloneRef.current) cloneRef.current.remove();
          gsap.set(overlayRef.current, {
            opacity: 0,
            pointerEvents: "none",
          });
          isAnimating.current = false;
          isZoomed.current = false;
          if (onZoomEnd) onZoomEnd();
        },
      });
  
      // Animate the cloned image back to its original position
      tl.to(cloneRef.current, {
        ...returnToPosition, // Use the stored position
        borderRadius: "1.5rem",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        onUpdate: () => {
          // As it shrinks, make it slightly smaller to "tuck" it away
          gsap.to(cloneRef.current, {
            scale: 0.98,
            duration: tl.duration() * 0.5,
            ease: "power2.in"
          });
        },
      })
      // Fade out the overlay in sync with the image returning
      .to(overlayRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      }, "<0.3"); // Start fading out before the image is fully back
    } else {
      // We are zooming in
      const img = imgRef.current;
      const rect = img.getBoundingClientRect();
  
      // Store the original styles to revert to later
      originalStylesRef.current = {
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        borderRadius: "1.5rem",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      };
  
      // Create and style the clone element
      cloneRef.current = img.cloneNode(true);
      Object.assign(cloneRef.current.style, {
        position: "fixed",
        zIndex: "9998",
        objectFit: "cover",
        transformOrigin: "center center",
        pointerEvents: "none",
        willChange: "transform",
        transition: "none",
        ...originalStylesRef.current,
      });
      document.body.appendChild(cloneRef.current);
  
      // Calculate the target size and position for the zoomed image
      const padding = Math.min(window.innerWidth, window.innerHeight) * 0.05;
      const maxWidth = window.innerWidth - padding * 2;
      const maxHeight = window.innerHeight - padding * 2;
      const imageAspect = rect.width / rect.height;
      let targetWidth, targetHeight;
      if (imageAspect > 1) {
        targetWidth = Math.min(maxWidth, rect.width * 2.5); // A moderate zoom
        targetHeight = targetWidth / imageAspect;
      } else {
        targetHeight = Math.min(maxHeight, rect.height * 2.5);
        targetWidth = targetHeight * imageAspect;
      }
      const centerX = (window.innerWidth - targetWidth) / 2;
      const centerY = (window.innerHeight - targetHeight) / 2;
  
      // Set up the overlay for a gentle fade
      gsap.set(overlayRef.current, {
        display: "block",
        pointerEvents: "auto",
        opacity: 0,
      });
  
      const tl = gsap.timeline({
        defaults: {
          ease: "power3.inOut"
        },
        onComplete: () => {
          isAnimating.current = false;
          isZoomed.current = true;
        },
      });
  
      // Animate the overlay and the cloned image together
      tl.to(overlayRef.current, {
        opacity: 1, // Change to a subtle dark background
        duration: 0.7,
        ease: "power2.out"
      })
      // Animate the cloned image's position, size, and other properties
      .to(cloneRef.current, {
        left: centerX,
        top: centerY,
        width: targetWidth,
        height: targetHeight,
        borderRadius: "0.6rem", // A slightly smaller radius for the zoomed state
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)", // A slightly stronger shadow
        // Add a subtle scale and rotation effect during the zoom
        scale: 1.05, // Slightly overshoot the scale
        rotationX: 1,
        rotationY: 2,
        duration: 1.2,
        onComplete: () => {
          // Animate the overshoot back to a normal scale
          gsap.to(cloneRef.current, {
            scale: 1,
            rotationX: 0,
            rotationY: 0,
            duration: 0.5,
            ease: "power2.out"
          });
        },
      }, "<0.2"); // Start the image animation slightly before the overlay is fully visible
    }
  };

  useEffect(() => {
    return () => {
      if (cloneRef.current) cloneRef.current.remove();
      if (overlayRef.current) overlayRef.current.style.display = "none";
    };
  }, []);

  return (
    <>
      <div ref={itemRef} className="relative size-full rounded-3xl overflow-hidden">
        <img
          ref={imgRef}
          onClick={handleZoomToggle}
          src={src}
          alt={Array.isArray(title) ? 'Image' : title}
          className="absolute left-0 top-0 size-full rounded-3xl object-cover object-center cursor-pointer will-change-transform hover:scale-[1.02] transition-transform duration-300"
        />
        <div className="relative z-10 flex size-full flex-col justify-between p-5 text-blue-50 pointer-events-none">
          <div>
            <h1 className="bento-title special-font">{title}</h1>
            {description && (
              <p className="mt-3 max-w-64 text-xs md:text-base">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div
        ref={overlayRef}
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.95)",
          zIndex: "9997",
          opacity: 0,
          cursor: "pointer",
          perspective: "3000px",
        }}
        onClick={handleZoomToggle}
      />
    </>
  );
};

const AutoScrollCarousel = ({
  items,
  direction = "horizontal",
  reverse = false,
}) => {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  const pause = useCallback(() => {
    if (animationRef.current) animationRef.current.pause();
  }, []);

  const resume = useCallback(() => {
    if (animationRef.current) animationRef.current.resume();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const prop = direction === "horizontal" ? "scrollLeft" : "scrollTop";
    const scrollSize = direction === "horizontal" 
      ? container.scrollWidth / 2 
      : container.scrollHeight / 2;

    container[prop] = reverse ? scrollSize : 0;
    animationRef.current = gsap
      .timeline({ repeat: -1 })
      .to(container, {
        [prop]: reverse ? 0 : scrollSize,
        duration: scrollSize / 90,
        ease: "none",
      })
      .set(container, { [prop]: reverse ? scrollSize : 0 });

    return () => {
      if (animationRef.current) animationRef.current.kill();
    };
  }, [direction, reverse]);

  return (
    <div
      ref={containerRef}
      className={`flex w-full h-full overflow-hidden ${
        direction === "horizontal" ? "flex-row" : "flex-col"
      }`}
    >
      {[...items, ...items].map((item, index) => (
        <div
          key={index}
          className={`flex-shrink-0 w-full h-full ${
            direction === "horizontal" ? "" : "mb-5"
          }`}
          style={{
            [direction === "horizontal" ? "marginRight" : "marginBottom"]: "20px",
          }}
        >
          <BentoCard
            src={item.src}
            title={item.title}
            description={item.description}
            onZoomStart={pause}
            onZoomEnd={resume}
          />
        </div>
      ))}
    </div>
  );
};

const Features = () => {
  const mainCarouselItems = [
    {
      src: "videos/feature-1.jpg",
      title: <>seg<b>o</b>vi<b>a</b></>,
    },
    {
      src: "videos/feature-3.jpg",
      title: <>seg<b>o</b>vi<b>a</b></>,
    },
    {
      src: "videos/feature-5.jpg",
      title: <>seg<b>o</b>vi<b>a</b></>,
    }
  ];

  const verticalCarouselItems = [
    {
      src: "videos/feature-2.jpg",
      title: <>seg<b>o</b>vi<b>a</b></>,
    },
    {
      src: "videos/feature-6.jpg",
      title: <>seg<b>o</b>vi<b>a</b></>,
    },
    {
      src: "videos/阿勒泰.jpg",
      title: <>阿勒泰</>,
    },
    {
      src: "videos/伊犁 (2).jpg",
      title: <>伊犁</>,
    },
    {
      src: "videos/伊犁 (3).jpg",
      title: <>伊犁</>,
    }
  ];

  const leftToRightCarouselItems = [
    {
      src: "videos/舟山.jpg",
      title: <>舟山</>,
    },
    {
      src: "videos/舟山 (2).jpg",
      title: <>舟山</>,
    },
    {
      src: "videos/舟山 (3).jpg",
      title: <>舟山</>,
    }
  ];

  const rightToLeftCarouselItems = [
    {
      src: "videos/Melbourne.jpg",
      title: <>Melb<b>our</b>ne</>,
    },
    {
      src: "videos/北京市.jpg",
      title: <>北京</>,
    }
  ];

  const verticalCarouselItems2 = [
    {
      src: "videos/万宁.jpg",
      title: <>万宁</>,
    },
    {
      src: "videos/伊犁.jpg",
      title: <>伊犁</>,
    }
  ];

  return (
    <section id="portofolio" className="bg-black pb-52">
      <div className="container mx-auto px-3 md:px-10">
        <div className="px-5 py-32">
          <p className="font-circular-web text-lg text-blue-50">I'm Brynner</p>
          <p className="max-w-md font-circular-web text-lg text-blue-50 opacity-50">
            Photographer, 3D artist, and front-end developer who cares about
            design. My focus is on precise integration and crafting innovative
            interactions.
          </p>
        </div>
        <BentoTilt className="relative mb-7 h-96 w-full overflow-hidden rounded-3xl md:h-[65vh]">
          <AutoScrollCarousel items={mainCarouselItems} direction="horizontal" />
        </BentoTilt>
        <div className="grid h-[135vh] w-full grid-cols-2 grid-rows-3 gap-7">
          <BentoTilt className="bento-tilt_1 row-span-1 md:col-span-1 md:row-span-2 overflow-hidden">
            <AutoScrollCarousel
              items={verticalCarouselItems}
              direction="vertical"
            />
          </BentoTilt>
          <BentoTilt className="bento-tilt_1 row-span-1 ms-32 md:col-span-1 md:ms-0 overflow-hidden">
            <AutoScrollCarousel
              items={leftToRightCarouselItems}
              direction="horizontal"
              reverse={true}
            />
          </BentoTilt>
          <BentoTilt className="bento-tilt_1 me-14 md:col-span-1 md:me-0 overflow-hidden">
            <AutoScrollCarousel
              items={rightToLeftCarouselItems}
              direction="horizontal"
            />
          </BentoTilt>
          <BentoTilt className="bento-tilt_2 overflow-hidden">
            <div className="flex size-full flex-col justify-between bg-violet-300 p-5 rounded-3xl">
              <h1 className="bento-title special-font max-w-64 text-black">
                M<b>o</b>re co<b>m</b>ing s<b>o</b>on.
              </h1>
              <TiLocationArrow className="m-5 scale-[5] self-end" />
            </div>
          </BentoTilt>
          <BentoTilt className="bento-tilt_2 overflow-hidden">
            <AutoScrollCarousel
              items={verticalCarouselItems2}
              direction="vertical"
            />
          </BentoTilt>
        </div>
      </div>
    </section>
  );
};

export default Features;