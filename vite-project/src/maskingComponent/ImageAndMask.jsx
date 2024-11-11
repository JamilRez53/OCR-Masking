import React, { useEffect, useState } from 'react';
import * as Tesseract from 'tesseract.js';
import { Stage, Layer, Image as KonvaImage, Rect } from 'react-konva';
import useImage from 'use-image';

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
      setMaskedBoxes([]); // Reset masked boxes for new image
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
          { label: "ID No.", pattern: /^No\s*[.:;]?$/i }  // NID No.
        ];
        console.log(words); // Check the words detected by Tesseract
        const boxesToMask = [];

        // Iterate through sensitive fields and find labels and values
        sensitiveFields.forEach(({ label, pattern }) => {
          const labelIndex = words.findIndex((word) => pattern.test(word.text.trim()));
          console.log(label, labelIndex); // Debug: Check if the label is found
          const labels = words.find((word) => pattern.test(word.text.trim()));
          console.log(labels); // Debug: Check the found label

          if (labelIndex !== -1) {
            const labelBox = words[labelIndex].bbox;
            let valueBox = null;

            // Find the next non-empty word after the label to use as the value
            for (let i = labelIndex + 1; i < words.length; i++) {
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
            }
          }
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
      {imageURL && (
        <MaskedImageCanvas imageURL={imageURL} maskedBoxes={maskedBoxes} />
      )}
    </div>
  );
};

const MaskedImageCanvas = ({ imageURL, maskedBoxes }) => {
  const [image] = useImage(imageURL); // Use the uploaded image

  if (!image) return <div>Loading...</div>; // Show loading while the image is loading

  // Set the Stage dimensions based on the image size
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
            y={box.y} // Adjust Y position for alignment if needed
            width={box.width}
            height={box.height}
            fill="black"
            opacity={1} // Full opacity to ensure visibility
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default MaskedNID;
