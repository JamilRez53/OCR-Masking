import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'
import ImageAndMask from './maskingComponent/ImageAndMask'
import MaskedComponent from './maskingComponent/MaksedComponent'
import OcrComponent from './maskingComponent/MaksedComponent'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <ImageAndMask/>
     <OcrComponent/>
    </>
  )
}

export default App
