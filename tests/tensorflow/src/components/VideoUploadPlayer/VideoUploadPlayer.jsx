import { useState, useRef, useEffect } from 'react'
import './VideoUploadPlayer.css'
import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl' // Import the WebGL backend

const VideoUploadPlayer = ({ videoIndex }) => {
  const [videoSrc, setVideoSrc] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [detector, setDetector] = useState(null)
  const [isMoveNetActive, setIsMoveNetActive] = useState(false)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('video/')) {
      const videoURL = URL.createObjectURL(file)
      setVideoSrc(videoURL)
    } else {
      alert('Please upload a valid video file.')
    }
  }

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready() // Ensure TensorFlow.js is fully initialized
      await tf.setBackend('webgl') // Explicitly set the backend to 'webgl' or another supported backend

      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
      }
      const detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      )
      setDetector(detector)
    }

    loadModel()
  }, [])

  const detectPose = async () => {
    if (detector && videoRef.current && isMoveNetActive) {
      const video = videoRef.current

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      const detect = async () => {
        if (video.readyState >= 2) {
          const poses = await detector.estimatePoses(video)
          ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear the previous frame
          drawPoses(poses, ctx) // Draw new poses

          requestAnimationFrame(detect) // Continue detecting for the next frame
        }
      }

      detect() // Start detection
    }
  }

  const drawPoses = (poses, ctx) => {
    poses.forEach((pose) => {
      pose.keypoints.forEach((keypoint) => {
        if (keypoint.score > 0.5) {
          // Only draw keypoints with a high confidence score
          const { x, y } = keypoint
          ctx.beginPath()
          ctx.arc(x, y, 5, 0, 2 * Math.PI)
          ctx.fillStyle = 'red'
          ctx.fill()
        }
      })
    })
  }

  const handleMoveNetToggle = () => {
    setIsMoveNetActive(!isMoveNetActive)
    if (!isMoveNetActive) {
      console.log(`Video ${videoIndex}: MoveNet is now ON`)
      detectPose() // Start pose detection when MoveNet is enabled
    } else {
      console.log(`Video ${videoIndex}: MoveNet is now OFF`)
    }
  }

  const buttonHandlers = [
    () => {
      setIsMoveNetActive(false)
      console.log(`Video ${videoIndex}: MoveNet is turned OFF`)
    }, // Button 1: OFF
    handleMoveNetToggle, // Button 2: MoveNet
    () => alert(`Video ${videoIndex}: PoseNet action!`),
    () => alert(`Video ${videoIndex}: BlazePose action!`),
    () => alert(`Video ${videoIndex}: BodyPix action!`),
  ]

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
              ref={videoRef}
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
                  <button onClick={buttonHandlers[buttonIndex]}>{label}</button>
                </div>
              )
            )}
          </div>
          <canvas
            ref={canvasRef}
            className='pose-overlay'
          />
        </>
      )}
    </div>
  )
}

export default VideoUploadPlayer
