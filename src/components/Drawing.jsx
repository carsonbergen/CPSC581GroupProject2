import * as tmImage from "@teachablemachine/image";
import p5 from "p5";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { clamp } from './utils.js';

export default function Drawing({ unlockPhone }) {
  const divRef = useRef(null);
  let drawing = false;
  let shaking = false;
  let done = false;
  let shakeValue = 0;
  let toErase = false;
  let pos = {
    x: 0,
    y: 0
  };

  const [divRect, setDivRect] = useState({ width: 0, height: 0 });

  const cursorSketch = (p5) => {
    p5.setup = () => {
      let boundingRect = divRef.current.getBoundingClientRect();
      p5.createCanvas(boundingRect.width, boundingRect.height);
    };

    p5.draw = () => {
      if (!done) {
        if (shaking) {
          p5.background("rgba(0, 0, 0, 0.0)");
          shaking = false;
        }

        if (!drawing) {
          p5.clear();
        }
        const speed = 6;
        const max = 3;
        const dx = clamp(p5.rotationY * speed, -max, max);
        const dy = clamp(p5.rotationX * speed, -max, max);

        let newPos = {
          x: clamp(pos.x + dx, 0, divRect.width),
          y: clamp(pos.y + dy, 0, divRect.height),
        };

        pos = newPos;

        if (!drawing) {
          let chlen = 6;
          p5.fill(0);
          p5.stroke("magenta");
          p5.strokeWeight(2);
          p5.line(pos.x - chlen, pos.y, pos.x + chlen, pos.y);
          p5.stroke("magenta");
          p5.strokeWeight(2);
          p5.line(pos.x, pos.y - chlen, pos.x, pos.y + chlen);
        }
      }
    };
  };

  const drawingSketch = (p5) => {
    p5.setup = () => {
      let boundingRect = divRef.current.getBoundingClientRect();
      p5.createCanvas(boundingRect.width, boundingRect.height);
      p5.background(255);
    };

    p5.deviceShaken = () => {
      shakeValue = shakeValue + 5;
      if (shakeValue > 150) {
        shaking = true;
        done = false;
        drawing = false;
        shakeValue = 0;
      }
    };

    p5.draw = () => {
      if (!done) {
        if (shaking) {
          p5.background(255);
          shaking = false;
        }
        if (toErase) {
          p5.background(255);
          toErase = false;
        }
        const speed = 6;
        const max = 3;
        const dx = clamp(p5.rotationY * speed, -max, max);
        const dy = clamp(p5.rotationX * speed, -max, max);

        let newPos = {
          x: clamp(pos.x + dx, 0, divRect.width),
          y: clamp(pos.y + dy, 0, divRect.height),
        };

        pos = newPos;

        if (drawing) {
          p5.strokeWeight(0);
          p5.fill("red");
          p5.circle(pos.x, pos.y, 25);
        }
      }
    };
  };

  const resetApp = () => {
    // drawing = false;
    // shaking = false;
    // done = false;
    // shakeValue = 0;
    // toErase = true;
  };

  const updateRect = () => {
    let rect = divRef.current.getBoundingClientRect();
    if (rect) {
      setDivRect({
        width: rect.width,
        height: rect.height,
      });
      pos = {
        x: rect.width / 2,
        y: rect.height / 2,
      };
    }
  };

  useEffect(() => {
    updateRect();
    pos = { x: divRect.width / 2, y: divRect.height / 2 };
    
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("resize", updateRect);
    };
  }, []);

  return (
    <>
      {/* Canvases */}
      <div className="w-screen h-screen flex flex-col justify-center items-center p-4">
        <div className="w-full h-[50%] relative" ref={divRef}>
          <div className="absolute top-0 left-0 z-0 border-white border-4 rounded-md">
            <ReactP5Wrapper sketch={drawingSketch} />
          </div>
          <div className="absolute top-0 left-0 z-50">
            <ReactP5Wrapper sketch={cursorSketch} />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="absolute top-0 left-0 w-screen h-screen flex justify-end items-end z-0">
        <div className="flex flex-row p-4 space-x-2">
          <button
            onClick={(e) => {
              resetApp();
            }}
          >
            Reset drawing
          </button>
          <button
            onClick={() => {
              let boundingRect = divRef.current.getBoundingClientRect();
              pos = { x: boundingRect.width / 2, y: boundingRect.height / 2 };
            }}
          >
            Reset to origin
          </button>
          <button
            onClick={(e) => {
              drawing = !drawing;
              if (drawing) toErase = false;
            }}
          >
            Toggle drawing
          </button>
          <button
            onClick={() => {
              unlockPhone();
            }}
          >
            Unlock phone
          </button>
        </div>
      </div>
    </>
  );
}
