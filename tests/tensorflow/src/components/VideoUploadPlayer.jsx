// src/components/VideoUploadPlayer.js
import { useState } from 'react'

const VideoUploadPlayer = () => {
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

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Upload and Play Video</h2>
      <input
        type='file'
        accept='video/*'
        onChange={handleFileUpload}
      />
      {videoSrc && (
        <div style={{ marginTop: '20px' }}>
          <video
            src={videoSrc}
            controls
            width='800px'
            height='450px'
            style={{
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default VideoUploadPlayer
