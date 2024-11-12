import React, { useEffect, useState } from 'react';
import * as Tesseract from 'tesseract.js';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';
import { Loader, Placeholder } from 'rsuite';

const MaskedNID = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [maskedBoxes, setMaskedBoxes] = useState([]);
  const [imageURL, setImageURL] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageURL(url);
      setSelectedImage(file);
      setMaskedBoxes([]); 
    }
  };

  useEffect(() => {
    const detectText = async () => {
      if (!selectedImage) return;

      try {
        const { data: { words } } = await Tesseract.recognize(selectedImage, 'eng+ben', {
          logger: (m) => console.log(m)
        });

        const sensitiveFields = [
          { label: "ID", patterns: [/^ID\s*No[.:;]?$/i,  /^No[.:;]$/i] }
        ];

        const boxesToMask = [];

        sensitiveFields.forEach(({ patterns }) => {
          console.log(words)
          words.forEach((word, index) => {
            // Check if the word matches any of the patterns
            if (patterns.some((pattern) => pattern.test(word.text.trim()))) {
              const labelBox = word.bbox;
              let valueBox = null;
           
              // Find the next non-empty word after the label to use as the value
              for (let i = index + 1; i < words.length; i++) {
                if (words[i].text.trim()) {
                  valueBox = words[i].bbox;
                  break;
                }
              }
 
              // If a value was found, create a mask box that covers both label and value
              if (valueBox) {
                const x = Math.min(labelBox.x0, valueBox.x0);
                const y = Math.min(labelBox.y0, valueBox.y0);
                const width = Math.max(labelBox.x1, valueBox.x1) - x;
                const height = Math.max(labelBox.y1, valueBox.y1) - y;

                boxesToMask.push({ x, y, width, height });
              } else {
                // Mask just the label if no value is found
                boxesToMask.push({
                  x: labelBox.x0,
                  y: labelBox.y0,
                  width: labelBox.x1 - labelBox.x0,
                  height: labelBox.y1 - labelBox.y0
                });
              }
            }
          });
        });

        console.log('Detected sensitive fields to mask:', boxesToMask);
        setMaskedBoxes(boxesToMask); // Store the detected boxes for masking
      } catch (error) {
        console.error('Error detecting text:', error);
      }
    };

    detectText();
  }, [selectedImage]); // Trigger when the selected image changes

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {maskedBoxes.length > 0 ? (
        <MaskedImageCanvas imageURL={imageURL} maskedBoxes={maskedBoxes} />
      ) : (
        <div>
          <Placeholder.Paragraph rows={8} />
          <Loader center content="Loading" />
        </div>
      )}
    </div>
  );
};

const MaskedImageCanvas = ({ imageURL, maskedBoxes }) => {
  const [image] = useImage(imageURL); // Use the uploaded image

 

  const imageWidth = image.width;
  const imageHeight = image.height;

  return (
    <Stage width={imageWidth} height={imageHeight}>
      <Layer>
        {image && <KonvaImage image={image} width={imageWidth} height={imageHeight} />}
        
        {/* Render black rectangles over the text regions to mask them */}
        {maskedBoxes.map((box, index) => (
          <Rect
            key={index}
            x={box.x}
            y={box.y}
            width={box.width}
            height={box.height}
            fill="black"
            opacity={1} // Full opacity for masking
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default MaskedNID;
