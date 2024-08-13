# Three.js Human Model


#### Initial Comments

This serves as the 3D human body component for the Golf Swing Analysis Tool I intend to build. I'm currently in the testing phase for the model and testing the Three.js library for animating this model. The purpose of this component is to transcribe a video of the users golf swing into it's raw movements using a simple dummy allowing them to compoare it to one of a professional golf player.

#### 1st Update

I found several 3D models online and I've decided to go with the one displayed below as it is already rigged with a human skeleton (which I hope will simplify the animation process). After some tinkering, I was able to import the model using Three.js and display it on a live web server, however it was difficult to maneuver the rig and identify the necessary limbs. While the model below looks nice and realistic, it has too many uneccessary segments.


![Human Model](https://github.com/biponroy47/threejs_human_model/blob/main//images/general_human.png?raw=true) 

#### 2nd Update

After some research, I've decided to implement my own rig so it better fits with the TensorFlow BlasePose model. I found a simple 3D base mesh of a wooden dummy  that would be a good fit and I am now learning Blender for the first time to achieve this. Below is a photo of the loaded model before attaching the rig. 

![Dummy Base Mesh](https://github.com/biponroy47/threejs_human_model/blob/main//images/wooden_dummy.png?raw=true) 

I've also begun to explore OpenCV out of curiosity, specifically the OpenPose model. After a brief comparision, OpenPose appears to perform better than MediaPipe in terms of accuracy and smoothness. It appears the model is only available in C++ and Python, so I may transition my project to a more Python friendly web stack or simply create a standalone desktop application in the near future. But for the time being, I'm sticking with MediaPipe and below is an image of the all the COCO keypoints the 3D model will mirror to animate the golf swing.

![MediaPipe ](https://github.com/biponroy47/threejs_human_model/blob/main//images/blasepose_points.png?raw=true) 

#### 3rd Update

So now I've implemented the human armature into my model using blender. After a few exporting issues, I now have a visible rendered dummy. However it appears I did not correctly rig my model. When moving a bone, it appears the bones move correctly but they are not attached to the model. Below is a photo of the imported model, the green line horizontal to the head is the path of the head bone I tried to move. As you can see it simply floated away and the model remained idle.

![Imported Rig ](https://github.com/biponroy47/threejs_human_model/blob/main//images/imported_rig.png?raw=true) 