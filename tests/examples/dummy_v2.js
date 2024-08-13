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

  let part

  const loader = new GLTFLoader()
  loader.load(
    '/wooden_dummy/test/blender.glb',
    function (gltf) {
      const model = gltf.scene
      model.scale.set(0.01, 0.01, 0.01)

      model.traverse((object) => {
        if (object.isSkinnedMesh) {
          console.log('SkinnedMesh found:', object.name)
        }
        if (object.isBone) {
          console.log('Bone found:', object.name)
        }
        if (object.name === 'head') {
          part = object
        }
      })

      const skeletonHelper = new THREE.SkeletonHelper(model)
      scene.add(skeletonHelper)

      scene.add(model)
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
    if (part) {
      console.log('PART FOUND')
      part.position.x += 1
    }
    renderer.render(scene, camera)
  }
  animate()
}
