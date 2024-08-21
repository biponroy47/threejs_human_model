import { useRef, useEffect } from 'react'
import useState from 'react-usestateref'
import './VideoUploadPlayer.css'
import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'

const VideoUploadPlayer = ({ videoIndex }) => {
  const [videoSrc, setVideoSrc, videoRef] = useState(null)
  const [, setVideoWidth, videoWidthRef] = useState(0)
  const [, setVideoHeight, videoHeightRef] = useState(0)
  const [detector, setDetector] = useState({ movenet: null, posenet: null })
  const moveNetCanvasRef = useRef(null)
  const poseNetCanvasRef = useRef(null)
  const [, setIsMoveNetActive, isMoveNetActiveRef] = useState(false)
  const [, setIsPoseNetActive, isPoseNetActiveRef] = useState(false)
  const animationIdMoveNetRef = useRef(null)
  const animationIdPoseNetRef = useRef(null)

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file && file.type.startsWith('video/')) {
      const videoURL = URL.createObjectURL(file)
      setVideoSrc(videoURL)

      const tempVideo = document.createElement('video')
      tempVideo.src = videoURL
      tempVideo.addEventListener('loadedmetadata', () => {
        setVideoWidth(tempVideo.videoWidth)
        setVideoHeight(tempVideo.videoHeight)
      })
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
          inputResolution: {
            width: 257,
            height: 257,
          },
          multiplier: 0.75,
        }
      )
      setDetector({ movenet: movenetDetector, posenet: posenetDetector })
      console.log('Models loaded')
    }
    loadModels()
  }, [])

  const handleOffClick = () => {
    setIsMoveNetActive(false)
    setIsPoseNetActive(false)
    stopMoveNetDetection()
    stopPoseNetDetection()
  }

  const handleMoveNetToggle = () => {
    const newState = !isMoveNetActiveRef.current
    setIsMoveNetActive(newState)
    if (newState) {
      startMoveNetDetection()
    } else {
      stopMoveNetDetection()
    }
  }

  const handlePoseNetToggle = () => {
    const newState = !isPoseNetActiveRef.current
    setIsPoseNetActive(newState)
    if (newState) {
      startPoseNetDetection()
    } else {
      stopPoseNetDetection()
    }
  }

  const startDetection = async (
    modelType,
    canvasRef,
    detector,
    activeRef,
    animationIdRef,
    drawFunction
  ) => {
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')

    const detect = async () => {
      if (!activeRef.current) {
        console.log(`${modelType} is no longer active, stopping detection loop`)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const poses = await detector.estimatePoses(video)
      console.log(`${modelType} poses:`, poses)
      drawFunction(
        poses,
        ctx,
        modelType === 'MoveNet' ? 'red' : 'blue',
        canvasRef
      )

      animationIdRef.current = requestAnimationFrame(detect)
    }

    detect()
  }

  const startMoveNetDetection = () =>
    startDetection(
      'MoveNet',
      moveNetCanvasRef,
      detector.movenet,
      isMoveNetActiveRef,
      animationIdMoveNetRef,
      drawMoveNetPoses
    )
  const startPoseNetDetection = () =>
    startDetection(
      'PoseNet',
      poseNetCanvasRef,
      detector.posenet,
      isPoseNetActiveRef,
      animationIdPoseNetRef,
      drawPoseNetPoses
    )

  const stopDetection = (canvasRef, animationIdRef) => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
      animationIdRef.current = null
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }

  const stopMoveNetDetection = () =>
    stopDetection(moveNetCanvasRef, animationIdMoveNetRef)
  const stopPoseNetDetection = () =>
    stopDetection(poseNetCanvasRef, animationIdPoseNetRef)

  const drawMoveNetPoses = (poses, ctx, color, canvasRef) => {
    const baseSize = 5
    const baseLineWidth = 2
    const scaleX = canvasRef.current.width / videoWidthRef.current
    const scaleY = canvasRef.current.height / videoHeightRef.current
    const dotSize = baseSize * Math.min(scaleX, scaleY)
    const lineWidth = baseLineWidth * Math.min(scaleX, scaleY)

    const drawKeypoint = (keypoint) => {
      const { x, y } = keypoint
      ctx.beginPath()
      ctx.arc(x * scaleX, y * scaleY, dotSize, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
    }

    const drawSkeleton = (keypoints) => {
      const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
        poseDetection.SupportedModels.MoveNet
      )
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = color
      adjacentKeyPoints.forEach(([i, j]) => {
        const kp1 = keypoints[i]
        const kp2 = keypoints[j]
        if (kp1.score > 0.3 && kp2.score > 0.3) {
          ctx.beginPath()
          ctx.moveTo(kp1.x * scaleX, kp1.y * scaleY)
          ctx.lineTo(kp2.x * scaleX, kp2.y * scaleY)
          ctx.stroke()
        }
      })
    }

    poses.forEach((pose) => {
      pose.keypoints.forEach((keypoint) => {
        if (keypoint.score > 0.3) {
          drawKeypoint(keypoint)
        }
      })
      drawSkeleton(pose.keypoints)
    })
  }

  const drawPoseNetPoses = (poses, ctx, color, canvasRef) => {
    const baseSize = 5
    const baseLineWidth = 2
    const scaleX = canvasRef.current.width / videoWidthRef.current
    const scaleY = canvasRef.current.height / videoHeightRef.current
    const dotSize = baseSize * Math.min(scaleX, scaleY)
    const lineWidth = baseLineWidth * Math.min(scaleX, scaleY)

    const drawKeypoint = (keypoint) => {
      const { x, y } = keypoint
      ctx.beginPath()
      ctx.arc(x * scaleX, y * scaleY, dotSize, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.fill()
    }

    const drawSkeleton = (keypoints) => {
      const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(
        poseDetection.SupportedModels.PoseNet
      )
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = color
      adjacentKeyPoints.forEach(([i, j]) => {
        const kp1 = keypoints[i]
        const kp2 = keypoints[j]
        if (kp1.score > 0.5 && kp2.score > 0.5) {
          ctx.beginPath()
          ctx.moveTo(kp1.x * scaleX, kp1.y * scaleY)
          ctx.lineTo(kp2.x * scaleX, kp2.y * scaleY)
          ctx.stroke()
        }
      })
    }

    poses.forEach((pose) => {
      pose.keypoints.forEach((keypoint) => {
        if (keypoint.score > 0.5) {
          drawKeypoint(keypoint)
        }
      })
      drawSkeleton(pose.keypoints)
    })
  }

  return (
    <div
      className={`video-upload-container ${
        videoRef.current ? 'uploaded' : ''
      }`}>
      <h2>Upload and Play Video {videoIndex}</h2>
      <input
        type='file'
        accept='video/*'
        onChange={handleFileUpload}
      />
      {videoRef.current && (
        <>
          <div className='video-container'>
            <video
              ref={videoRef}
              src={videoSrc}
              controls
              className='video-element'
              autoPlay
              loop
              width={videoWidthRef.current}
              height={videoHeightRef.current}
            />
          </div>
          <div className='button-row'>
            <div className='button-with-label'>
              <button onClick={handleOffClick}>OFF</button>
            </div>
            <div className='button-with-label'>
              <button
                className={isMoveNetActiveRef.current ? 'active' : ''}
                onClick={handleMoveNetToggle}>
                MoveNet
              </button>
            </div>
            <div className='button-with-label'>
              <button
                className={isPoseNetActiveRef.current ? 'active' : ''}
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
            ref={moveNetCanvasRef}
            className='pose-overlay'
          />
          <canvas
            ref={poseNetCanvasRef}
            className='pose-overlay'
          />
        </>
      )}
    </div>
  )
}

export default VideoUploadPlayer
