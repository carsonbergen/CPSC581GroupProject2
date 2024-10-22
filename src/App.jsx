import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";
import p5 from "p5";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import { useEffect, useRef, useState } from "react";

function clamp(num, lower, upper) {
  // https://www.omarileon.me/blog/javascript-clamp
  return Math.min(Math.max(num, lower), upper);
}

function App() {
  const divRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  let pos = {
    x: 0,
    y: 0,
  };
  const [divRect, setDivRect] = useState({ width: 0, height: 0 });
  let drawing = false;
  let shaking = false;
  let done = false;
  let shakeValue = 0;
  let toErase = true;

  const updateRect = () => {
    let rect = divRef.current.getBoundingClientRect();
    if (rect) {
      setDivRect({
        width: rect.width,
        height: rect.height,
      });
    }
  };

  useEffect(() => {
    updateRect();
    setMounted(true);

    pos = { x: divRect.width / 2, y: divRect.height / 2 };

    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("resize", updateRect);
    };
  }, []);

  const URL = "/model/";

  async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    const weightsURL = URL + "weights.bin";

    const modelFile = new File(
      [await fetch(modelURL).then((res) => res.blob())],
      "model"
    );

    const metadataFile = new File(
      [await fetch(metadataURL).then((res) => res.blob())],
      "metadata"
    );

    const weightsFile = new File(
      [await fetch(weightsURL).then((res) => res.blob())],
      "weights.bin"
    );

    let model = await tmImage.loadFromFiles(
      modelFile,
      weightsFile,
      metadataFile
    );
  }

  const cursorSketch = (p5) => {
    p5.setup = () => {
      let boundingRect = divRef.current.getBoundingClientRect();
      p5.createCanvas(boundingRect.width, boundingRect.height);
    };

    p5.draw = () => {
      if (!done) {
        if (shaking) {
          p5.background('rgba(0, 0, 0, 0.0)');
          shaking = false;
        }

        if (!drawing) {
          p5.background('rgba(0, 0, 0, 0.0)');
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
          p5.stroke("black");
          p5.strokeWeight(2);
          p5.line(pos.x - chlen, pos.y, pos.x + chlen, pos.y);
          p5.stroke("black");
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
      p5.background(200);
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
          p5.background(200);
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
          p5.fill("black");
          p5.circle(pos.x, pos.y, 25);
        }
      }
    };
  };

  // useEffect(() => {
  //   console.log(drawing)
  // }, [drawing])

  return (
    <>
      <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.3/dist/teachablemachine-image.min.js"></script>

      <div className="w-screen h-screen flex flex-col justify-center items-center p-4">
        <div className="w-full h-[50%] relative" ref={divRef}>
          <div className="absolute top-0 left-0 z-10">
            {mounted ? <ReactP5Wrapper sketch={drawingSketch} /> : null}
          </div>
          <div className="absolute top-0 left-0 z-50">
            {mounted ? <ReactP5Wrapper sketch={cursorSketch} /> : null}
          </div>
        </div>
        <div className="flex flex-row">
          {!permissionsRequested ? (
            <button
              onClick={() => {
                if (
                  typeof DeviceOrientationEvent.requestPermission === "function"
                ) {
                  DeviceOrientationEvent.requestPermission();
                  setPermissionsRequested(true);
                } else {
                  setPermissionsRequested(true);
                }
              }}
            >
              Allow motion?
            </button>
          ) : null}
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
        </div>
      </div>
    </>
  );
}

export default App;
