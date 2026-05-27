const fs = require('fs');
const path = require('path');

const srcVideo = 'C:/Users/darsh/Downloads/verticalmp_.mp4';
const publicDir = path.join(__dirname, 'public');
const destVideo = path.join(publicDir, 'login-video.mp4');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

if (fs.existsSync(srcVideo)) {
  fs.copyFileSync(srcVideo, destVideo);
  console.log('✅ Video successfully copied to the public folder! You are ready to deploy.');
} else {
  console.error(`❌ Could not find the video at ${srcVideo}`);
}
