import { useState, useRef, useEffect } from 'react'
import './VideoUploadPlayer.css'
import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'

const VideoUploadPlayer = ({ videoIndex }) => {
  const [videoSrc, setVideoSrc] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [detector, setDetector] = useState({ movenet: null, posenet: null })
  const [isMoveNetActive, setIsMoveNetActive] = useState(false)
  const [isPoseNetActive, setIsPoseNetActive] = useState(false)
  const animationIdMoveNetRef = useRef(null)
  const animationIdPoseNetRef = useRef(null)

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
    const loadModels = async () => {
      await tf.ready()
      await tf.setBackend('webgl')

      const movenetDetector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING }
      )

      const posenetDetector = await poseDetection.createDetector(
        poseDetection.SupportedModels.PoseNet,
        {
          architecture: 'MobileNetV1',
          outputStride: 16,
          inputResolution: { width: 300, height: 300 },
          multiplier: 0.75,
        }
      )

      setDetector({ movenet: movenetDetector, posenet: posenetDetector })
    }

    loadModels()
  }, [])

  useEffect(() => {
    const detectMoveNetPose = async () => {
      if (isMoveNetActive && videoRef.current && detector.movenet) {
        const video = videoRef.current
        const canvas = canvasRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')

        const detect = async () => {
          console.log('detecting MoveNet')
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          const movenetPoses = await detector.movenet.estimatePoses(video)
          drawPoses(movenetPoses, ctx, 'red')
          animationIdMoveNetRef.current = requestAnimationFrame(detect)
        }
        detect()
      } else {
        stopMoveNetDetection()
      }
    }

    detectMoveNetPose()
  }, [isMoveNetActive, detector.movenet])

  useEffect(() => {
    let cancelDetection = false

    const detectPoseNetPose = async () => {
      if (isPoseNetActive && videoRef.current && detector.posenet) {
        const video = videoRef.current
        const canvas = canvasRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')

        const detect = async () => {
          console.log('poseNet detection')
          if (!isPoseNetActive || cancelDetection) return

          ctx.clearRect(0, 0, canvas.width, canvas.height)

          // Perform pose estimation
          const posenetPoses = await detector.posenet.estimatePoses(video)

          // Draw the poses
          drawPoses(posenetPoses, ctx, 'blue')

          // Continue the detection loop
          animationIdPoseNetRef.current = requestAnimationFrame(detect)
        }

        detect()
      }
    }

    detectPoseNetPose()

    return () => {
      cancelDetection = true
      if (animationIdPoseNetRef.current) {
        cancelAnimationFrame(animationIdPoseNetRef.current)
        animationIdPoseNetRef.current = null // Clear the reference
      }
      stopPoseNetDetection()
    }
  }, [isPoseNetActive, detector.posenet])

  const drawPoses = (poses, ctx, color) => {
    const baseSize = 5
    const baseLineWidth = 3
    const scaleX = canvasRef.current.width / 1920
    const scaleY = canvasRef.current.height / 1080
    const dotSize = baseSize * Math.min(scaleX, scaleY)
    const lineWidth = baseLineWidth * Math.min(scaleX, scaleY)
    const drawKeypoint = (keypoint, ctx) => {
      const { x, y } = keypoint
      ctx.beginPath()
      ctx.arc(x, y, dotSize, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
    }
    const drawSkeleton = (keypoints, ctx) => {
      const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
        poseDetection.SupportedModels.MoveNet
      )
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = color
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

  const stopMoveNetDetection = () => {
    if (animationIdMoveNetRef.current) {
      cancelAnimationFrame(animationIdMoveNetRef.current)
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const stopPoseNetDetection = () => {
    if (animationIdPoseNetRef.current) {
      cancelAnimationFrame(animationIdPoseNetRef.current)
      animationIdPoseNetRef.current = null // Clear the reference
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const handleOffClick = () => {
    setIsMoveNetActive(false)
    setIsPoseNetActive(false)
  }

  const handleMoveNetToggle = () => {
    setIsMoveNetActive((prevIsMoveNetActive) => {
      const newState = !prevIsMoveNetActive
      if (!newState) stopMoveNetDetection()
      return newState
    })
  }

  const handlePoseNetToggle = () => {
    setIsPoseNetActive((prevIsPoseNetActive) => {
      const newState = !prevIsPoseNetActive
      if (!newState) stopPoseNetDetection() // Stop detection immediately
      return newState
    })
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
              width='1920'
              height='1080'
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
              <button
                className={isPoseNetActive ? 'active' : ''}
                onClick={handlePoseNetToggle}>
                PoseNet
              </button>
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
