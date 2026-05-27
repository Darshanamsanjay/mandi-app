const fs = require('fs');
const path = require('path');

const brainDir = 'C:/Users/darsh/.gemini/antigravity/brain/f9321a68-ce00-4ddd-b2c5-a30180c4dd80/';
const assetsDir = path.join(__dirname, 'src', 'assets');

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const images = [
  'tomato_premium_1779878406974.png',
  'potato_premium_1779878430683.png',
  'onion_premium_1779878452775.png',
  'banana_premium_1779878475197.png',
  'milk_premium_1779878496163.png',
  'carrot_premium_1779878526703.png',
  'mandi_panorama_1779879197228.png',
  'broccoli_premium_1779880034949.png',
  'bellpepper_premium_1779880049849.png',
  'apple_premium_1779880065433.png',
  'avocado_premium_1779880080534.png',
  'dragonfruit_premium_1779880107813.png',
  'eggs_premium_1779880124844.png',
  'paneer_premium_1779880145022.png',
  'tofu_premium_1779880159365.png',
  'quinoa_premium_1779880182826.png',
  'chickenbowl_premium_1779880198330.png',
  'media__1779881570094.png' // kingfisher
];

let copied = 0;
images.forEach(img => {
  const src = path.join(brainDir, img);
  const dest = path.join(assetsDir, img);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied ${img} to src/assets/`);
    copied++;
  } else {
    console.error(`❌ Missing file: ${src}`);
  }
});

console.log(`\n🎉 Done! Successfully copied ${copied} images to src/assets. You can now deploy!`);
