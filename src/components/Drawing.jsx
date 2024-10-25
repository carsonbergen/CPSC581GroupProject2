import * as tmImage from "@teachablemachine/image";
import p5 from "p5";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { clamp } from "./utils.js";
import {
  ArrowArcLeft,
  ArrowRight,
  Compass,
  Lock,
  LockOpen,
  PaintBrush,
  Palette,
  Trash,
} from "@phosphor-icons/react";
import { twMerge } from "tailwind-merge";

export default function Drawing({
  unlockPhone,
  selectedColor,
  setSelectedColor,
  step,
}) {
  const [colourPaletteOpened, setColourPaletteOpened] = useState(false);

  const divRef = useRef(null);
  let drawing = false;
  let shaking = false;
  let done = false;
  let shakeValue = 0;
  let toErase = false;
  let pos = {
    x: 0,
    y: 0,
  };

  const [divRect, setDivRect] = useState({ width: 0, height: 0 });

  const cursorSketch = (p5) => {
    p5.setup = () => {
      let boundingRect = divRef.current.getBoundingClientRect();
      p5.createCanvas(boundingRect.width, boundingRect.height);
      pos = {
        x: boundingRect.width / 2,
        y: boundingRect.height / 2,
      };
    };

    p5.draw = () => {
      if (!done) {
        if (shaking) {
          p5.background("rgba(0, 0, 0, 0.0)");
          shaking = false;
          drawing = false;
        }

        p5.clear();

        const speed = 6;
        const max = 3;
        const dx = clamp(p5.rotationY * speed, -max, max);
        const dy = clamp(p5.rotationX * speed, -max, max);

        let newPos = {
          x: clamp(pos.x + dx, 0, divRect.width),
          y: clamp(pos.y + dy, 0, divRect.height),
        };

        pos = newPos;

        let chlen = 6;
        p5.fill(0);
        p5.stroke("black");
        p5.strokeWeight(2);
        p5.line(pos.x - chlen, pos.y, pos.x + chlen, pos.y);
        p5.stroke("black");
        p5.strokeWeight(2);
        p5.line(pos.x, pos.y - chlen, pos.x, pos.y + chlen);
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
          p5.fill(selectedColor);
          p5.circle(pos.x, pos.y, 25);
        }
      }
    };
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
        <div
          className="w-full h-[50%] relative flex justify-center items-center"
          ref={divRef}
        >
          <div className="absolute top-0 left-0 z-0">
            <ReactP5Wrapper sketch={drawingSketch} />
          </div>
          <div className="absolute top-0 left-0 z-50">
            <ReactP5Wrapper sketch={cursorSketch} />
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="absolute right-0 top-0 z-[999] w-full h-full p-2 flex justify-end items-end pointer-events-none">
        <div className="relative">
          <button
            className="absolute bottom-4 right-20 bg-gray-100 shadow-[inset_0_-2px_4px_rgba(0.6,0.6,0.6,0.6)] rounded-full w-28 h-28 flex justify-center items-center pointer-events-auto"
            onClick={() => {
              drawing = !drawing;
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
          <button
            className="absolute bottom-[4.5rem] right-0 bg-green-400 shadow-[inset_0_-2px_4px_rgba(0.6,0.6,0.6,0.6)] rounded-full w-20 h-20 flex justify-center items-center pointer-events-auto"
            onClick={unlockPhone}
          >
            {step < 2 ? (
              <ArrowRight className="w-full h-full stroke-2 fill-black" />
            ) : (
              <LockOpen className="w-full h-full stroke-2 fill-black" />
            )}
          </button>
          <button
            className="absolute bottom-32 right-[4.5rem] bg-purple-300 shadow-[inset_0_-2px_4px_rgba(0.6,0.6,0.6,0.6)] rounded-full w-16 h-16 flex justify-center items-center pointer-events-auto"
            onClick={() => setColourPaletteOpened(!colourPaletteOpened)}
          >
            <Palette className="w-full h-full stroke-2 fill-black" />
          </button>
        </div>
      </div>

      {/* Colour palette */}
      <div
        className={twMerge(
          "absolute right-0 top-0 z-[999] w-full h-full p-4 flex flex-col justify-end items-end space-x-2 mb-4 bottom-0 transition-all duration-200 pointer-events-none",
          `${
            colourPaletteOpened ? "translate-y-[0vh]" : "translate-y-[100vh]"
          }`,
          ""
        )}
      >
        <div className="flex flex-col justify-center items-center bg-[#00000080] rounded-full backdrop-blur-md p-2">
          <span className="font-black font-sans text-lg">Pick colour</span>
          <div className="flex flex-row justify-center items-center space-x-2 w-fit h-fit p-4 z-[1000] pointer-events-auto">
            <button
              onClick={() => setSelectedColor("black")}
              className={`w-8 h-8 border-2 rounded-full p-1 ${
                selectedColor === "black"
                  ? "border-white"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: "black" }}
            />

            <button
              onClick={() => setSelectedColor("red")}
              className={`w-8 h-8 border-2 rounded-full p-1 ${
                selectedColor === "red" ? "border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: "red" }}
            />

            <button
              onClick={() => setSelectedColor("blue")}
              className={`w-8 h-8 border-2 rounded-full p-1 ${
                selectedColor === "blue" ? "border-white" : "border-transparent"
              }`}
              style={{ backgroundColor: "blue" }}
            />

            <button
              onClick={() => setSelectedColor("green")}
              className={`w-8 h-8 border-2 rounded-full p-1 ${
                selectedColor === "green"
                  ? "border-white"
                  : "border-transparent"
              }`}
              style={{ backgroundColor: "green" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
