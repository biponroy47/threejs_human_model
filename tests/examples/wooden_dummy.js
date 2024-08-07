import * as THREE from 'three'
import { OBJLoader } from 'three-stdlib'

export function wooden_dummy() {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75, // Adjusted FOV
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  const renderer = new THREE.WebGLRenderer({ antialias: true })

  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  const light = new THREE.DirectionalLight(0xffffff, 1)
  light.position.set(5, 10, 7.5)
  scene.add(light)

  const ambientLight = new THREE.AmbientLight(0x404040) // Soft white light
  scene.add(ambientLight)

  const loader = new OBJLoader()
  loader.load(
    // Path to the OBJ file
    'wooden_dummy/dummy_obj.obj', // Ensure the path is correct
    // Called when the resource is loaded
    function (object) {
      object.scale.set(0.05, 0.05, 0.05)
      scene.add(object)
    },
    // Called while loading is progressing
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    // Called when loading has errors
    function (error) {
      console.log('An error happened:', error)
    }
  )

  camera.position.set(0.1, 7, 10) // Adjusted camera position
  camera.lookAt(0, 3, 0) // Ensuring the camera looks at the model

  const gridHelper = new THREE.GridHelper(10, 10)
  scene.add(gridHelper)

  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
  }
  animate()
}
