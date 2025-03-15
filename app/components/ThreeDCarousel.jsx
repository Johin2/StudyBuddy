"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";

export default function ThreeDCarousel({ items = [] }) {
  // Local state to track which card is front and center
  const [stepIndex, setStepIndex] = useState(0);

  // Reset carousel index when items change
  useEffect(() => {
    setStepIndex(0);
  }, [items]);

  const itemWidth = 250;
  const itemHeight = 350;
  const distanceZ = 500;

  // Calculate the angle between each item
  const itemAngle = useMemo(() => (items.length ? 360 / items.length : 0), [items]);

  // Memoized handlers to navigate carousel
  const handleNext = useCallback(() => {
    setStepIndex((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setStepIndex((prev) => prev - 1);
  }, []);

  // Memoize carousel container style
  const carouselStyle = useMemo(
    () => ({
      position: "relative",
      width: `${itemWidth}px`,
      height: `${itemHeight}px`,
      transformStyle: "preserve-3d",
      transition: "transform 1s ease",
      transform: `translateZ(-${distanceZ}px) rotateY(${-stepIndex * itemAngle}deg)`,
    }),
    [stepIndex, itemAngle]
  );

  // Memoize rendered items
  const renderItems = useMemo(
    () =>
      items.map((item, i) => (
        <div
          key={item.id}
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
            textAlign: "center",
            fontSize: "1.2rem",
          }}
        >
          {item.content}
        </div>
      )),
    [items, itemAngle]
  );

  return (
    <div style={{ perspective: "1000px" }} className="flex flex-col items-center">
      {/* 3D Carousel Container */}
      <div style={carouselStyle}>{renderItems}</div>

      {/* Prev / Next Buttons */}
      {items.length > 1 && (
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
