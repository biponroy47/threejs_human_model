import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

export function rigged_body() {
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

  const light = new THREE.DirectionalLight(0xffffff, 4)
  light.position.set(0, 1, 1).normalize()
  scene.add(light)

  let armBone

  const loader = new GLTFLoader()
  loader.load(
    '/generalized_human_body/scene.gltf',
    function (gltf) {
      const model = gltf.scene
      scene.add(model)

      model.traverse((object) => {
        if (object.isBone) {
          console.log(object.name)
        }
      })
      model.traverse((object) => {})

      renderer.render(scene, camera)
    },
    undefined,
    function (error) {
      console.error(error)
    }
  )

  camera.position.z = 1.5
  camera.position.y = 1
  camera.lookAt(0, 1, 0)

  const gridHelper = new THREE.GridHelper(100, 100)
  scene.add(gridHelper)

  const axesHelper = new THREE.AxesHelper(5)
  scene.add(axesHelper)

  function animate() {
    requestAnimationFrame(animate)
    if (armBone) {
      let i = 1
      armBone.rotation.x = ++i
    }
    renderer.render(scene, camera)
  }
  animate()
}
