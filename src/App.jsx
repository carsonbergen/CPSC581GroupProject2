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
  const [pos, setPos] = useState({
    x: 0,
    y: 0,
  });
  const [divRect, setDivRect] = useState({ width: 0, height: 0 });
  const [drawing, setDrawing] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [done, setDone] = useState(false);
  const [value, setValue] = useState(0);
  let rotationX = 0;
  let rotationY = 0;

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

    setPos({ x: divRect.width / 2, y: divRect.height / 2 });

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

  const sketch = (p5) => {
    p5.setup = () => {
      let boundingRect = divRef.current.getBoundingClientRect();
      p5.createCanvas(boundingRect.width, boundingRect.height);
      p5.background(200);
    };

    p5.draw = () => {
      if (!done) {
        if (shaking) {
          p5.background(200);
          setShaking(false);
        }
        if (!drawing) {
          p5.background(200);
        }
        const speed = 6;
        const max = 3;
        const dx = clamp(p5.rotationY * speed, -max, max);
        const dy = clamp(p5.rotationX * speed, -max, max);

        let newPos = {
          x: clamp(pos.x + dx, 0, divRect.width),
          y: clamp(pos.y + dy, 0, divRect.height),
        };
        setPos(newPos);

        console.log(p5.pRotationX, p5.pRotationY);
        rotationX = p5.rotationX;
        rotationY = p5.rotationY;

        if (!drawing) {
          // console.log(pos);
          let chlen = 6;
          p5.stroke("magenta");
          p5.strokeWeight(5);
          p5.line(pos.x - chlen, pos.y, pos.x + chlen, pos.y);
          p5.stroke("magenta");
          p5.strokeWeight(5);
          p5.line(pos.x, pos.y - chlen, pos.x, pos.y + chlen);
        } else {
          p5.circle(pos.x, pos.y, 25);
        }
      }
    };
  };

  return (
    <>
      <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.3/dist/teachablemachine-image.min.js"></script>

      <div className="w-screen h-screen flex flex-col justify-center items-center p-4">
        <span className="whitespace-pre">
          {`x: ${rotationX}\ny: ${rotationY}`}
        </span>
        <div className="w-full h-[50%]" ref={divRef}>
          {mounted ? <ReactP5Wrapper sketch={sketch} /> : null}
        </div>
        <div className="flex flex-row">
          {!permissionsRequested ? (
            <button
              onClick={() => {
                if (typeof DeviceOrientationEvent.requestPermission === "function") {
                  DeviceOrientationEvent.requestPermission()
                } else {
                  // handle regular non iOS 13+ devices
                }
                // if (permissionState === "granted") {
                //   setPermissionsRequested(true);
                // }
              }}
            >
              Allow motion?
            </button>
          ) : null}
          <button
            onClick={() => {
              let boundingRect = divRef.current.getBoundingClientRect();
              setPos({ x: boundingRect.width / 2, y: boundingRect.height / 2 });
            }}
          >
            Reset to origin
          </button>
          <button
            onClick={() => {
              setDrawing(!drawing);
            }}
          >
            Start drawing
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
