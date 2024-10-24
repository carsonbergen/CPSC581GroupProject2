import * as tmImage from "@teachablemachine/image";
import p5 from "p5";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

function clamp(num, lower, upper) {
  // Code from:
  // https://www.omarileon.me/blog/javascript-clamp
  return Math.min(Math.max(num, lower), upper);
}

function App() {
  const divRef = useRef(null);
  const URL = "/model/";
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const [permissionsRequested, setPermissionsRequested] = useState(false);
  let pos = {
    x: 0,
    y: 0,
  };
  const [divRect, setDivRect] = useState({ width: 0, height: 0 });

  const [predictions, setPredictions] = useState([]);

  const [model, setModel] = useState();

  const [selectedColor, setSelectedColor] = useState("black");

  // p5 values
  let drawing = false;
  let shaking = false;
  let done = false;
  let shakeValue = 0;
  let toErase = false;

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

    setModel(await tmImage.loadFromFiles(modelFile, weightsFile, metadataFile));
  }

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
          p5.fill(selectedColor);
          p5.circle(pos.x, pos.y, 25);
        }
      }
    };
  };

  const resetApp = () => {
    setUnlocked(false);
    setFailed(false);
    setLoading(false);
    drawing = false;
    shaking = false;
    done = false;
    shakeValue = 0;
    toErase = true;
  };

  const checkPasscode = async () => {
    let canvas = document.getElementById("defaultCanvas0");
    setPredictions(await model.predict(canvas));
  };

  useEffect(() => {
    init();
    updateRect();
    setMounted(true);

    pos = { x: divRect.width / 2, y: divRect.height / 2 };

    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("resize", updateRect);
    };
  }, []);

  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        checkPasscode();
      }, 1);
    }
  }, [loading]);

  useEffect(() => {
    if (predictions.length > 0) {
      let highestProbabilityPrediction = predictions.reduce(
        (highest, prediction) =>
          highest.probability > prediction.probability ? highest : prediction
      );
      if (highestProbabilityPrediction.probability > 0.8) {
        setLoading(false);
        setUnlocked(true);
      } else {
        setLoading(false);
        setFailed(true);
      }
    }
  }, [predictions]);

  return (
    <>
      <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.3.1/dist/tf.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/@teachablemachine/image@0.8.3/dist/teachablemachine-image.min.js"></script>

      {loading ? (
        <div className="text-black z-[10000] absolute top-0 left-0 backdrop-blur-md w-full h-full flex justify-center items-center">
          loading...
        </div>
      ) : null}

      {unlocked ? (
        <img
          className="z-[10000] absolute top-0 left-0 w-full h-full"
          src="/images/IMG_2019.png"
        ></img>
      ) : null}

      {failed ? (
        <div className="text-black z-[10000] absolute top-0 left-0 backdrop-blur-md w-full h-full flex justify-center items-center flex-col">
          failed
          <button
            className="text-white"
            onClick={() => {
              resetApp();
            }}
          >
            Try again
          </button>
        </div>
      ) : null}

      <div
        className={twMerge(
          "absolute left-0 top-0 w-full h-full flex justify-end items-end pb-2 px-2 backdrop-blur-sm transition-all duration-300",
          `${permissionsRequested ? "opacity-0 z-[0]" : "opacity-100 z-[9999]"}`
        )}
      >
        {!permissionsRequested ? (
          <button
            className="w-full font-black uppercase"
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
      </div>

      <div className="w-screen h-screen flex flex-col justify-center items-center p-4">

        {/* Canvases */}
        <div className="w-full h-full relative mb-8 mt-4">
          <div className="absolute top-0 left-0 w-fit h-fit backdrop-blur-md rounded-md text-white border border-black p-4 bg-[#00000080] z-[10000]">
            {predictions.map((prediction) => (
              <div key={prediction.className} className="rounded-md bg-black m-1">
                <span>{`class name:\t${prediction.className}`}</span>
                <span>{`probability:\t${prediction.probability}`}</span>
              </div>
            ))}
          </div>
          <div className="w-full h-full relative" ref={divRef}>
            <div className="absolute top-0 left-0 z-0 border-white border-4 rounded-md">
              {mounted ? <ReactP5Wrapper sketch={drawingSketch} /> : null}
            </div>
            <div className="absolute top-0 left-0 z-50">
              {mounted ? <ReactP5Wrapper sketch={cursorSketch} /> : null}
            </div>
          </div>
        </div>

        {/* Color Section */}
        <div className="flex space-x-2 mb-4 justify-center z-[100]"
        >
          
          <button
            onClick={() => setSelectedColor("black")}
            className={`w-8 h-8 border-2 rounded-full p-1 ${selectedColor === "black" ? "border-white" : "border-transparent"}`}
            style={{ backgroundColor: "black" }}
          />
          
          <button
            onClick={() => setSelectedColor("red")}
            className={`w-8 h-8 border-2 rounded-full p-1 ${selectedColor === "red" ? "border-white" : "border-transparent"}`}
            style={{ backgroundColor: "red" }}
          />
          
          <button
            onClick={() => setSelectedColor("blue")}
            className={`w-8 h-8 border-2 rounded-full p-1 ${selectedColor === "blue" ? "border-white" : "border-transparent"}`}
            style={{ backgroundColor: "blue" }}
          />
          
          <button
            onClick={() => setSelectedColor("green")}
            className={`w-8 h-8 border-2 rounded-full p-1 ${selectedColor === "green" ? "border-white" : "border-transparent"}`}
            style={{ backgroundColor: "green" }}
          />
        </div>

        {/* Buttons */}
          <div className="flex flex-row p-4 space-x-2 z-[100]">
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
                setLoading(true);
                done = true;
              }}
            >
              Unlock phone
            </button>
          </div>


      </div>

    </>
  );
}

export default App;
