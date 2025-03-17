'use client';
import React, { useState, useEffect, useCallback, useMemo } from "react";

// Custom hook to get window dimensions
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1024,
    height: typeof window !== "undefined" ? window.innerHeight : 768,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

export default function ThreeDCarousel({ items = [] }) {
  // Limit the items to a maximum of 12
  const limitedItems = useMemo(() => items.slice(0, 12), [items]);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    setStepIndex(0);
  }, [limitedItems]);

  // Responsive calculations based on window width
  const { width } = useWindowSize();
  // For smaller screens, use a percentage of the viewport; otherwise use fixed dimensions.
  const itemWidth = useMemo(() => (width < 640 ? width * 0.8 : 250), [width]);
  const itemHeight = useMemo(() => (width < 640 ? itemWidth * 1.4 : 350), [width, itemWidth]);
  const distanceZ = useMemo(() => itemWidth * 2, [itemWidth]);

  // Calculate the angle between each item
  const itemAngle = useMemo(
    () => (limitedItems.length ? 360 / limitedItems.length : 0),
    [limitedItems]
  );

  // Navigation handlers
  const handleNext = useCallback(() => {
    setStepIndex((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setStepIndex((prev) => prev - 1);
  }, []);

  // Carousel container style updated for responsive dimensions
  const carouselStyle = useMemo(
    () => ({
      position: "relative",
      width: `${itemWidth}px`,
      height: `${itemHeight}px`,
      transformStyle: "preserve-3d",
      transition: "transform 1s ease",
      transform: `translateZ(-${distanceZ}px) rotateY(${-stepIndex * itemAngle}deg)`,
    }),
    [stepIndex, itemAngle, itemWidth, itemHeight, distanceZ]
  );

  // Render carousel items
  const renderItems = useMemo(
    () =>
      limitedItems.map((item, i) => (
        <div
          key={item.id || i}
          style={{
            position: "absolute",
            width: `${itemWidth}px`,
            height: `${itemHeight}px`,
            top: 0,
            left: 0,
            transform: `rotateY(${i * itemAngle}deg) translateZ(${distanceZ}px)`,
            backgroundColor: "#fff",
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            color: "#000",
          }}
        >
          {/* Bookmark badge */}
          <div
            style={{
              position: "absolute",
              top: "0.5rem",
              right: "0.5rem",
              backgroundColor: "orange",
              color: "white",
              borderRadius: "50%",
              width: "2rem",
              height: "2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.9rem",
              fontWeight: "bold",
            }}
          >
            {i + 1}
          </div>
          {typeof item === "string" ? (
            <div style={{ textAlign: "left", width: "100%" }}>{item}</div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                textAlign: "left",
                width: "100%",
              }}
            >
              <div className="text-xl font-semibold">
                Question: {item.question}
              </div>
              <div className="text-lg font-medium">
                Ans: {item.answer}
              </div>
            </div>
          )}
        </div>
      )),
    [limitedItems, itemAngle, itemWidth, itemHeight, distanceZ]
  );

  return (
    <div style={{ perspective: "1000px" }} className="flex flex-col items-center">
      {/* Carousel Container */}
      <div style={carouselStyle}>{renderItems}</div>
      {/* Navigation Buttons */}
      {limitedItems.length > 1 && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={handlePrev}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-500"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-500"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
