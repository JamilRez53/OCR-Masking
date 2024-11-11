import React, { useState } from 'react';
import axios from 'axios';

const OcrComponent = () => {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // Preview the image
      recognizeText(file);
    }
  };

  const recognizeText = (file) => {
    const formData = new FormData();
    formData.append('apikey', 'your-ocr-space-api-key');
    formData.append('language', 'eng');
    formData.append('file', file);

    axios.post('https://api.ocr.space/parse/image', formData, {
      headers: formData.getHeaders(),
    })
      .then(response => {
        const detectedText = response.data.ParsedResults[0].ParsedText;
        setText(detectedText);
      })
      .catch(error => {
        console.error('Error recognizing text:', error);
      });
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <div>
        <img src={image} alt="Uploaded" style={{ maxWidth: '100%' }} />
      </div>
      <div>
        <h3>Extracted Text:</h3>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default OcrComponent;
