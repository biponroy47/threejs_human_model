import './App.css'
import VideoUploadPlayer from './components/VideoUploadPlayer'

function App() {
  return (
    <>
      <h1>Tensorflow Tests</h1>
      <div className='video-container'>
        <VideoUploadPlayer />
        <VideoUploadPlayer />
      </div>
    </>
  )
}

export default App
