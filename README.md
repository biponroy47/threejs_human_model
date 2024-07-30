# Three.js Human Model

This serves as the 3D human body component for the Golf Swing Analysis Tool I intend to build. I am currently in the testing phase for the model and testing the capabilities of the Three.js library. For the sake of simplicity, I've decided to use a pre-built human model that is already rigged with a skeleton for the animations. 

I have yet to figure out how to animate the body parts, and the current model appears to have several unnecessary vertices. I'll likely need to create my own in the near future with a matching number of vertices as the TensorFlow BlazePose model, and likely a separate one for the golf clubs as well.

Below is an image of the 3D model currently. I will now attempt to instruct it to perform a golf swing, or hopefully movements that resemble one at the very least.


![Test Render](https://github.com/biponroy47/threejs_human_model/blob/main//images/preview.png?raw=true)