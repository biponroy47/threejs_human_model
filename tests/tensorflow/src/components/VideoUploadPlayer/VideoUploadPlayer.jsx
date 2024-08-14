// src/components/VideoUploadPlayer.js
import { useState } from 'react'
import './VideoUploadPlayer.css' // Import the CSS file

const VideoUploadPlayer = ({ videoIndex }) => {
  const [videoSrc, setVideoSrc] = useState(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('video/')) {
      const videoURL = URL.createObjectURL(file)
      setVideoSrc(videoURL)
    } else {
      alert('Please upload a valid video file.')
    }
  }

  // Define button handlers specific to this video
  const buttonHandlers = ({ videoIndex, buttonIndex }) => {}

  return (
    <div className={`video-upload-container ${videoSrc ? 'uploaded' : ''}`}>
      <h2>Upload and Play Video {videoIndex}</h2>
      <input
        type='file'
        accept='video/*'
        onChange={handleFileUpload}
      />

      {videoSrc && (
        <>
          <div className='video-container'>
            <video
              src={videoSrc}
              controls
              className='video-element'
            />
          </div>
          <div className='button-row'>
            {['OFF', 'MoveNet', 'PoseNet', 'BlazePose', 'BodyPix'].map(
              (label, buttonIndex) => (
                <div
                  key={buttonIndex}
                  className='button-with-label'>
                  <button
                    onClick={() => buttonHandlers(videoIndex, buttonIndex)}>
                    {label}
                  </button>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default VideoUploadPlayer
