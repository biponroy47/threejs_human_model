import VideoUploadPlayer from './components/VideoUploadPlayer/VideoUploadPlayer'
import './App.css'

function App() {
  return (
    <div className='App'>
      <h1 className='site-title'>Tensorflow Tests</h1>
      <div className='video-row'>
        <VideoUploadPlayer videoIndex={1} />
        <VideoUploadPlayer videoIndex={2} />
      </div>
    </div>
  )
}

export default App
