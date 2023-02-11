import { useState, useEffect } from 'react';
import Quagga from 'quagga'

import './App.css'

function App() {

  const [barcode, setBarcode] = useState(null);

  useEffect(() => {
    Quagga.init({
      inputStream: {
        type: "LiveStream",
        constraints: {
          width: 640,
          height: 480,
          facingMode: "environment"
        }
      },
      decoder: {
        readers: ['ean_reader', 'code_128_reader', 'ean_8_reader', 'code_39_reader', 'code_39_vin_reader',
        'codabar_reader', 'upc_reader', 'upc_e_reader', 'i2of5_reader']
      }
    }, function(err) {
      if (err) {
        console.log(err);
        return;
      }
      console.log("Initialization finished. Ready to start");
      Quagga.start();
    });

    Quagga.onProcessed(function(result) {

      var drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;

      if (result) {
        if (result.boxes) {
          drawingCtx.clearRect(
            0,
            0,
            parseInt(drawingCanvas.getAttribute("width")),
            parseInt(drawingCanvas.getAttribute("height"))
          );
          result.boxes
            .filter(function(box) {
              return box !== result.box;
            })
            .forEach(function(box) {
              Quagga.ImageDebug.drawPath(
                box,
                { x: 0, y: 1 },
                drawingCtx,
                { color: "green", lineWidth: 2 }
              );
            });
        }

        if (result.box) {
          console.log("does this even get hit?")
          Quagga.ImageDebug.drawPath(
            result.box,
            { x: 0, y: 1 },
            drawingCtx,
            { color: "#00F", lineWidth: 2 }
          );
        }

        if (result.codeResult && result.codeResult.code) {
          Quagga.ImageDebug.drawPath(
            result.line,
            { x: "x", y: "y" },
            drawingCtx,
            { color: "red", lineWidth: 3 }
          );
        }
      }
    });

    Quagga.onDetected(function(result) {
      console.log("OH HARRROOOOOOOOOO")
      setBarcode(result.codeResult.code);
      console.log("Barcode detected and processed : [" + result.codeResult.code + "]", result);
      Quagga.stop();
    });

  }, []);

  console.log(barcode)

  return (
    <div>
      <div id="interactive" className="viewport" />
      {barcode && <p>Barcode: {barcode}</p>}
    </div>
  )
}

export default App
