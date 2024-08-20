import { useRef, useEffect } from 'react'
import useState from 'react-usestateref'
import './VideoUploadPlayer.css'
import * as tf from '@tensorflow/tfjs'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'

const VideoUploadPlayer = ({ videoIndex }) => {
  const [videoSrc, setVideoSrc, videoRef] = useState(null)
  const [videoWidth, setVideoWidth, videoWidthRef] = useState(0)
  const [videoHeight, setVideoHeight, videoHeightRef] = useState(0)
  const [detector, setDetector] = useState({ movenet: null, posenet: null })
  const moveNetCanvasRef = useRef(null)
  const poseNetCanvasRef = useRef(null)
  const [isMoveNetActive, setIsMoveNetActive, isMoveNetActiveRef] =
    useState(false)
  const [isPoseNetActive, setIsPoseNetActive, isPoseNetActiveRef] =
    useState(false)
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
            width: videoWidth,
            height: videoHeight,
          },
          multiplier: 0.5,
        }
      )
      setDetector({ movenet: movenetDetector, posenet: posenetDetector })
    }
    loadModels()
  }, [videoHeight, videoWidth])

  const handleOffClick = () => {
    setIsMoveNetActive(false)
    setIsPoseNetActive(false)
  }

  //MoveNet ------------------------------------------------------------------
  const handleMoveNetToggle = async () => {
    const newState = !isMoveNetActive
    setIsMoveNetActive(newState)
    if (newState) {
      startMoveNetDetection()
    } else {
      stopMoveNetDetection()
    }
  }

  const startMoveNetDetection = async () => {
    if (videoRef.current && detector.movenet) {
      const video = videoRef.current
      const canvas = moveNetCanvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')

      const detect = async () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const movenetPoses = await detector.movenet.estimatePoses(video)
        drawPoses(
          movenetPoses,
          ctx,
          'red',
          moveNetCanvasRef,
          poseDetection.SupportedModels.MoveNet
        )
        animationIdMoveNetRef.current = requestAnimationFrame(detect)
      }

      if (isMoveNetActiveRef.current === false) {
        return
      } else {
        detect()
      }
    }
  }

  const stopMoveNetDetection = () => {
    if (animationIdMoveNetRef.current) {
      cancelAnimationFrame(animationIdMoveNetRef.current)
      const ctx = moveNetCanvasRef.current.getContext('2d')
      ctx.clearRect(
        0,
        0,
        moveNetCanvasRef.current.width,
        moveNetCanvasRef.current.height
      )
    }
  }

  //PoseNet ------------------------------------------------------------------
  const handlePoseNetToggle = () => {
    const newState = !isPoseNetActive
    setIsPoseNetActive(newState)
    if (newState) {
      startPoseNetDetection()
    } else {
      stopPoseNetDetection()
    }
  }

  const startPoseNetDetection = async () => {
    if (videoRef.current && detector.posenet) {
      const video = videoRef.current
      const canvas = poseNetCanvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      const detect = async () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        const posenetPoses = await detector.posenet.estimatePoses(video)
        drawPoses(
          posenetPoses,
          ctx,
          'blue',
          poseNetCanvasRef,
          poseDetection.SupportedModels.PoseNet
        )
        animationIdPoseNetRef.current = requestAnimationFrame(detect)
      }
      if (!isPoseNetActiveRef.current) {
        return
      } else {
        detect()
      }
    }
  }

  const stopPoseNetDetection = () => {
    if (animationIdPoseNetRef.current) {
      cancelAnimationFrame(animationIdPoseNetRef.current)
      const ctx = poseNetCanvasRef.current.getContext('2d')
      ctx.clearRect(
        0,
        0,
        poseNetCanvasRef.current.width,
        poseNetCanvasRef.current.height
      )
    }
  }

  useEffect(() => {
    return () => {
      stopMoveNetDetection()
      stopPoseNetDetection()
    }
  }, [])

  //DRAW FUNCTION
  const drawPoses = (poses, ctx, color, canvasRef, modelType) => {
    const baseSize = 20
    const baseLineWidth = 10
    const scaleX = canvasRef.current.width / videoWidthRef.current
    const scaleY = canvasRef.current.height / videoHeightRef.current
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
      const adjacentKeyPoints = poseDetection.util.getAdjacentPairs(modelType)
      ctx.lineWidth = lineWidth
      ctx.strokeStyle = color
      adjacentKeyPoints.forEach(([i, j]) => {
        const kp1 = keypoints[i]
        const kp2 = keypoints[j]
        if (kp1.score > 0.0 && kp2.score > 0.0) {
          ctx.beginPath()
          ctx.moveTo(kp1.x, kp1.y)
          ctx.lineTo(kp2.x, kp2.y)
          ctx.stroke()
        }
      })
    }

    poses.forEach((pose) => {
      pose.keypoints.forEach((keypoint) => {
        if (keypoint.score > 0.0) {
          drawKeypoint(keypoint, ctx)
        }
      })
      drawSkeleton(pose.keypoints, ctx)
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
