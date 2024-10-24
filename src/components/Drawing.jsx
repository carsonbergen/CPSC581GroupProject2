import * as tmImage from "@teachablemachine/image";
import p5 from "p5";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { clamp } from './utils.js';
import { Compass, Lock, LockOpen, PaintBrush, Palette, Trash } from "@phosphor-icons/react";

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
    p5.deviceShaken = () => {
      shakeValue = shakeValue + 5;
      if (shakeValue > 150) {
        shaking = true;
        done = false;
        drawing = false;
        shakeValue = 0;
      }
    };
  };

  const drawingSketch = (p5) => {
    p5.setup = () => {
      console.log('setup')
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
      <div className="w-screen h-screen flex flex-col justify-start items-center p-4 pt-16 shadow-inner">
        <div className="w-full h-[50%] relative flex justify-center items-center" ref={divRef}>
          <div className="absolute top-0 left-0 z-0">
            <ReactP5Wrapper sketch={drawingSketch} />
          </div>
          <div className="absolute top-0 left-0 z-50">
            <ReactP5Wrapper sketch={cursorSketch} />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="absolute right-0 top-0 z-[999] w-screen h-screen p-2 flex justify-end items-end pointer-events-none">
        <div className="relative">
          <button 
            className="absolute bottom-4 right-20 bg-gray-100 shadow-[inset_0_-2px_4px_rgba(0.6,0.6,0.6,0.6)] rounded-full w-28 h-28 flex justify-center items-center pointer-events-auto"
            onClick={() => {
              drawing = !(drawing)
            }}
          >
            <PaintBrush className="w-full h-full stroke-2 fill-black" />
          </button>
          <button 
            className="absolute bottom-0 right-4 bg-yellow-400 shadow-[inset_0_-2px_4px_rgba(0.6,0.6,0.6,0.6)] rounded-full w-16 h-16 flex justify-center items-center pointer-events-auto"
            onClick={() => {
              let boundingRect = divRef.current.getBoundingClientRect();
              pos = { x: boundingRect.width / 2, y: boundingRect.height / 2 };
            }}
          >
            <Compass className="w-full h-full stroke-2 fill-black" />
          </button>
          <button className="absolute bottom-[4.5rem] right-0 bg-green-400 shadow-[inset_0_-2px_4px_rgba(0.6,0.6,0.6,0.6)] rounded-full w-20 h-20 flex justify-center items-center pointer-events-auto"
            onClick={unlockPhone}
          >
            <LockOpen className="w-full h-full stroke-2 fill-black" />
          </button>
          <button className="absolute bottom-32 right-[4.5rem] bg-purple-300 shadow-[inset_0_-2px_4px_rgba(0.6,0.6,0.6,0.6)] rounded-full w-16 h-16 flex justify-center items-center pointer-events-auto">
            <Palette className="w-full h-full stroke-2 fill-black" />
          </button>
        </div>
      </div>
    </>
  );
}
