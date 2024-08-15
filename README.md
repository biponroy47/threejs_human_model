# Three.js Human Model


#### Initial Comments

This serves as the 3D human body component for the golf swing analysis tool I intend to build. I'm currently in the testing phase for the model and testing the Three.js library for animating it. The purpose of this component is to transcribe a video of the user's golf swing into its raw movements using a simple dummy, allowing them to compare it to that of a professional golf player.

#### 1st Update

I found several 3D models online, and I've decided to go with the one displayed below as it is already rigged with a human skeleton (which I hope will simplify the animation process). After some tinkering, I was able to import the model using Three.js and display it on a live web server; however, it was difficult to maneuver the rig and identify the necessary limbs. While the model below looks nice and realistic, it has too many unnecessary segments.


![Human Model](https://github.com/biponroy47/threejs_human_model/blob/main//images/general_human.png?raw=true) 

#### 2nd Update

After some research, I've decided to implement my own rig so it better fits with the TensorFlow BlasePose model. I found a simple 3D base mesh of a wooden dummy that would be a good fit, and I am now learning Blender for the first time to achieve this. Below is a photo of the loaded model before attaching the rig. 

![Dummy Base Mesh](https://github.com/biponroy47/threejs_human_model/blob/main//images/wooden_dummy.png?raw=true) 

I've also begun to explore OpenCV out of curiosity, specifically the OpenPose model. After a brief comparison, OpenPose appears to perform better than MediaPipe in terms of accuracy and smoothness. It appears the model is only available in C++ and Python, so I may transition my project to a more Python friendly web stack or simply create a standalone desktop application in the near future. But for the time being, I'm sticking with MediaPipe, and below is an image of all the COCO keypoints the 3D model will mirror to animate the golf swing.

![MediaPipe](https://github.com/biponroy47/threejs_human_model/blob/main//images/blasepose_points.png?raw=true) 

#### 3rd Update

So now I've implemented the human armature into my model using Blender. After a few exporting issues, I now have a visible rendered dummy. However, it appears I did not correctly rig my model. When moving a bone, it appears the bones move correctly, but they are not attached to the model. Below is a photo of the imported model; the green line horizontal to the head is the path of the head bone I tried to move. As you can see, it simply floated away, and the model remained idle.

![Imported Rig](https://github.com/biponroy47/threejs_human_model/blob/main//images/imported_rig.png?raw=true) 

#### 4th Update

After some thought, I decided that using the same 3D wooden dummy wasn't ideal. Not only is the build unrealistic, it also doesn't account for varying physical builds. For that reason, I've decided that I'll have to generate custom 3D human models for each user. I'm inclined to believe someone's already solved this problem, so hopefully I don't have to create a script to generate the base mesh and automate the rigging process as well. Other developers have mentioned using videogrammetry tools to produce the base mesh and auto-rigging libraries like Mixamo, so I likely won't have to "reinvent the wheel.".

On a separate note, I've begun to test Tensorflow libraries on a local development server. I've successfully integrated the MoveNet model, and it appears to function correctly upon each video's initial playback. While the model correctly draws the floating keypoints at the moment, I do plan to connect the keypoints together to resemble the individual bones and the overall human skeleton. My goal here is to implement PoseNet, BlazePose, and BodyPix as well, so the user can analyze their golf swing using separate models or a combination within the same canvas. I may also add more models, such as OpenCV OpenPose, PyTorch MMPose, and others, so users have more flexibility. Below is a photo of the current test site during a successful analysis of two stock videos.

![MoveNet ](https://github.com/biponroy47/threejs_human_model/blob/main//images/movenet.png?raw=true) 