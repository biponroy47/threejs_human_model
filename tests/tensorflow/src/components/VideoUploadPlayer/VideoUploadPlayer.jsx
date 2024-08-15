import { useState, useRef, useEffect } from 'react'
import './VideoUploadPlayer.css'
import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'

const VideoUploadPlayer = ({ videoIndex }) => {
  const [videoSrc, setVideoSrc] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [detector, setDetector] = useState(null)
  const [isMoveNetActive, setIsMoveNetActive] = useState(false)
  const animationIdRef = useRef(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('video/')) {
      const videoURL = URL.createObjectURL(file)
      setVideoSrc(videoURL)
    } else {
      alert('Invalid video file.')
    }
  }

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready()
      await tf.setBackend('webgl')
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

  useEffect(() => {
    const detectPose = async () => {
      if (detector && videoRef.current && isMoveNetActive) {
        const video = videoRef.current
        const canvas = canvasRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')

        const detect = async () => {
          const poses = await detector.estimatePoses(video)
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          drawPoses(poses, ctx)
          animationIdRef.current = requestAnimationFrame(detect)
        }
        detect()
      }
    }
    isMoveNetActive ? detectPose() : stopDetection()
  }, [isMoveNetActive, detector])

  const drawPoses = (poses, ctx) => {
    const baseSize = 5
    const baseLineWidth = 3
    const scaleX = canvasRef.current.width / 640
    const scaleY = canvasRef.current.height / 480
    const dotSize = baseSize * Math.min(scaleX, scaleY)
    const lineWidth = baseLineWidth * Math.min(scaleX, scaleY)

    const drawKeypoint = (keypoint, ctx) => {
      const { x, y } = keypoint
      ctx.beginPath()
      ctx.arc(x, y, dotSize, 0, 2 * Math.PI)
      ctx.fillStyle = 'red'
      ctx.fill()
    }

    const drawSkeleton = (keypoints, ctx) => {
      const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
        poseDetection.SupportedModels.MoveNet
      )
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = 'red'

      adjacentKeyPoints.forEach(([i, j]) => {
        const kp1 = keypoints[i]
        const kp2 = keypoints[j]

        if (kp1.score > 0.5 && kp2.score > 0.5) {
          ctx.beginPath()
          ctx.moveTo(kp1.x, kp1.y)
          ctx.lineTo(kp2.x, kp2.y)
          ctx.stroke()
        }
      })
    }

    poses.forEach((pose) => {
      pose.keypoints.forEach((keypoint) => {
        if (keypoint.score > 0.5) {
          drawKeypoint(keypoint, ctx)
        }
      })
      drawSkeleton(pose.keypoints, ctx)
    })
  }

  const stopDetection = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const handleOffClick = () => {
    setIsMoveNetActive(false)
  }

  const handleMoveNetToggle = () => {
    setIsMoveNetActive((prevIsMoveNetActive) => !prevIsMoveNetActive)
  }

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
              <button onClick={handleOffClick}>OFF</button>
            </div>
            <div className='button-with-label'>
              <button
                className={isMoveNetActive ? 'active' : ''}
                onClick={handleMoveNetToggle}>
                MoveNet
              </button>
            </div>
            <div className='button-with-label'>
              <button onClick={() => console.log('temp')}>PoseNet</button>
            </div>
            <div className='button-with-label'>
              <button onClick={() => console.log('temp')}>BlazePose</button>
            </div>
            <div className='button-with-label'>
              <button onClick={() => console.log('temp')}>BodyPix</button>
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
