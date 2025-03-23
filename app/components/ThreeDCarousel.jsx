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
  // Limit items to a maximum of 12
  const limitedItems = useMemo(() => items.slice(0, 12), [items]);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Reset rotation index whenever the items change
    setStepIndex(0);
  }, [limitedItems]);

  // Responsive calculations based on window width
  const { width } = useWindowSize();
  // For smaller screens, use a percentage of the viewport; otherwise, use fixed dimensions.
  const itemWidth = useMemo(() => (width < 640 ? width * 0.8 : 260), [width]);
  const itemHeight = useMemo(
    () => (width < 640 ? itemWidth * 1.4 : 380),
    [width, itemWidth]
  );

  // Calculate the angle between each card in degrees
  const itemAngle = useMemo(
    () => (limitedItems.length > 0 ? 360 / limitedItems.length : 0),
    [limitedItems]
  );

  /**
   * Dynamically compute the distanceZ so cards don’t overlap.
   *
   * The idea:
   *   - Each card is placed on a circle of radius R.
   *   - The chord length between two adjacent cards = itemWidth.
   *   - The chord length formula: chord = 2 * R * sin(θ/2),
   *     where θ = 2π / numberOfCards (in radians).
   *   - Solve for R => R = chord / (2 * sin(θ/2)).
   *   - Use Math.max(...) so we have a fallback if only 1 card or small angles.
   */
  const distanceZ = useMemo(() => {
    const n = limitedItems.length;
    if (n <= 1) {
      // If there's only one card, just place it in front
      return itemWidth * 2;
    }
    // θ in radians
    const theta = (2 * Math.PI) / n;
    // Desired radius so the chord between two adjacent cards is at least itemWidth
    const radius = itemWidth / (2 * Math.sin(theta / 2));
    // Provide a fallback so the cards are not too close
    return Math.max(radius, itemWidth * 1.5);
  }, [limitedItems, itemWidth]);

  // Handlers for next/previous
  const handleNext = useCallback(() => {
    setStepIndex((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setStepIndex((prev) => prev - 1);
  }, []);

  // Container style for the carousel
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

  // Render each card
  const renderItems = useMemo(
    () =>
      limitedItems.map((item, i) => {
        const cardKey = item.id || i;
        return (
          <div
            key={cardKey}
            style={{
              position: "absolute",
              width: `${itemWidth}px`,
              height: `${itemHeight}px`,
              top: 0,
              left: 0,
              transform: `rotateY(${i * itemAngle}deg) translateZ(${distanceZ}px)`,
              background: "linear-gradient(135deg, #ffffff 0%, #f8f8f8 100%)",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Bookmark badge in the top-right corner */}
            <div
              style={{
                position: "absolute",
                top: "0.5rem",
                right: "0.5rem",
                backgroundColor: "#ff6e00",
                color: "#fff",
                borderRadius: "50%",
                width: "2rem",
                height: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                fontWeight: "bold",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
            >
              {i + 1}
            </div>

            {/* Main card content */}
            <div
              style={{
                flex: 1,
                padding: "1rem",
                color: "#333",
                overflowY: "auto",
                overflowWrap: "break-word",
                wordWrap: "break-word",
              }}
              className="card-scrollbar"
            >
              {typeof item === "string" ? (
                <div style={{ fontSize: "0.95rem", lineHeight: 1.4 }}>
                  {item}
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                    fontSize: "0.95rem",
                    lineHeight: 1.4,
                  }}
                >
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: "bold",
                      color: "#1c1c1c",
                    }}
                  >
                    Question:
                  </div>
                  <div>{item.question}</div>

                  <hr
                    style={{
                      border: "none",
                      borderTop: "1px dashed #ccc",
                      margin: "0.25rem 0",
                    }}
                  />

                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: "bold",
                      color: "#1c1c1c",
                    }}
                  >
                    Answer:
                  </div>
                  <div>{item.answer}</div>
                </div>
              )}
            </div>
          </div>
        );
      }),
    [limitedItems, itemAngle, itemWidth, itemHeight, distanceZ]
  );

  return (
    <div style={{ perspective: "1000px" }} className="flex flex-col items-center ">
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
