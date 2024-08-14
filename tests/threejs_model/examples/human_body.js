// link to model
// https://sketchfab.com/3d-models/human-body-f022e4a3641943328b2fbfdf0f7c3e1e

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function human_body() {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    100,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  const renderer = new THREE.WebGLRenderer({ antialias: true })

  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // Add a simple light
  const light = new THREE.DirectionalLight(0xffffff, 2)
  light.position.set(1, 1, 1).normalize()
  scene.add(light)

  // Load the GLTF model
  const loader = new GLTFLoader()
  loader.load(
    '/public/human_body/scene.gltf',
    function (gltf) {
      scene.add(gltf.scene)
      renderer.render(scene, camera)
    },
    undefined,
    function (error) {
      console.error(error)
    }
  )

  // Position the camera
  camera.position.z = 5
  camera.position.y = 5
  camera.lookAt(0, 0, 0)

  // Add OrbitControls for zooming in and out
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = true

  // Add a grid helper to the scene
  const gridHelper = new THREE.GridHelper(100, 100)
  scene.add(gridHelper)

  // Add an axes helper to the scene
  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  // Animate the scene
  function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
}
