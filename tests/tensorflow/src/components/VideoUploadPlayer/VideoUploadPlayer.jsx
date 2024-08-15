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
    console.log('DetectPose function started')
    // console.log(detector)
    // console.log(videoRef.current)
    // console.log(isMoveNetActive)
    // console.log('Video ready state:', videoRef.current.readyState)
    if (detector && videoRef.current && !isMoveNetActive) {
      const video = videoRef.current
      console.log('Video ready state:', video.readyState)

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const detect = async () => {
        console.log('Detect function running')
        //console.log('Video ready state:', video.readyState)
        if (video.readyState >= 2) {
          // console.log('Video is ready, estimating poses')
          const poses = await detector.estimatePoses(video)
          // console.log('Detected poses:', poses) // Should output detected poses
          ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear the previous frame
          drawPoses(poses, ctx) // Draw new poses

          requestAnimationFrame(detect) // Continue detecting for the next frame
        }
      }
      console.log(
        'Canvas width:',
        canvas.width,
        'Canvas height:',
        canvas.height
      )
      console.log(
        'Video width:',
        video.videoWidth,
        'Video height:',
        video.videoHeight
      )

      detect() // Start detection
    }
  }

  const drawPoses = (poses, ctx) => {
    const baseSize = 5 // Base dot size
    const scaleX = canvasRef.current.width / 640 // Assuming 640 is the standard width
    const scaleY = canvasRef.current.height / 480 // Assuming 480 is the standard height
    const dotSize = baseSize * Math.min(scaleX, scaleY) // Scale dot size proportionally
    // console.log('Detected poses:', poses) // Log the poses array
    poses.forEach((pose) => {
      pose.keypoints.forEach((keypoint) => {
        if (keypoint.score > 0.01) {
          // console.log(`Drawing keypoint at (${keypoint.x}, ${keypoint.y})`) // Log each keypoint position
          // Only draw keypoints with a high confidence score
          const { x, y } = keypoint
          ctx.beginPath()
          ctx.arc(x, y, dotSize, 0, 2 * Math.PI)
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
      videoRef.current.play()
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
              autoPlay
              loop
            />
          </div>
          <div className='button-row'>
            <div className='button-with-label'>
              <button onClick={buttonHandlers[0]}>OFF</button>
            </div>
            <div className='button-with-label'>
              <button
                className={isMoveNetActive ? 'active' : ''}
                onClick={buttonHandlers[1]}>
                MoveNet
              </button>
            </div>
            <div className='button-with-label'>
              <button onClick={buttonHandlers[2]}>PoseNet</button>
            </div>
            <div className='button-with-label'>
              <button onClick={buttonHandlers[3]}>BlazePose</button>
            </div>
            <div className='button-with-label'>
              <button onClick={buttonHandlers[4]}>BodyPix</button>
            </div>
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
