import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

export function dummy_v2() {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1000
  )
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  const light = new THREE.PointLight(0xffffff, 250, 100)
  light.position.set(-2, 4, 5)
  scene.add(light)

  let model

  const loader = new GLTFLoader()
  loader.load(
    '/wooden_dummy/test/blender.glb',
    function (gltf) {
      model = gltf.scene
      model.scale.set(0.01, 0.01, 0.01)

      model.traverse((object) => {
        if (object.isBone) {
          console.log(object.name)
        }
      })

      scene.add(model)
      renderer.render(scene, camera)
    },
    undefined,
    function (error) {
      console.error(error)
    }
  )
  camera.position.x = 0.5
  camera.position.y = 2
  camera.position.z = 3
  //camera.lookAt(0, 0, 0)

  const gridHelper = new THREE.GridHelper(1000, 1000)
  scene.add(gridHelper)

  const axesHelper = new THREE.AxesHelper(500)
  scene.add(axesHelper)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = true

  function animate() {
    requestAnimationFrame(animate)
    const head = model.getObjectByName('upper_armL')
    renderer.render(scene, camera)
  }
  animate()
}
