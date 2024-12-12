const generateForm = document.querySelector(".form-gen");
const generateBtn = generateForm.querySelector(".gen-btn");
const imageGallery = document.querySelector(".img-pics");

const OPENAI_API_KEY ="API-KEY-GENERATED";
let isImageGenerating = false;

const addWatermark = (imageSrc, watermarkText) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.crossOrigin = "Anonymous"; 
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      ctx.font = "20px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.textAlign = "right";
      ctx.fillText(watermarkText, canvas.width - 20, canvas.height - 20);

      resolve(canvas.toDataURL("image/jpeg"));
    };
  });
};

const updateImageCard = (imgDataArray) => {
  imgDataArray.forEach((imgObject, index) => {
    const imgCard = imageGallery.querySelectorAll(".img-card")[index];
    const imgElement = imgCard.querySelector("img");
    const downloadBtn = imgCard.querySelector(".download-btn");
    
    const aiGeneratedImage = `data:image/jpeg;base64,${imgObject.b64_json}`;

    addWatermark(aiGeneratedImage, "AI-Generated").then((watermarkedImage) => {
      imgElement.src = watermarkedImage;

      imgElement.onload = () => {
        imgCard.classList.remove("loading");
        downloadBtn.setAttribute("href", watermarkedImage);
        downloadBtn.setAttribute("download", `${new Date().getTime()}.jpg`);
      };
    });
  });
};

const generateAiImages = async (userPrompt, userImgQuantity) => {
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: userPrompt,
        n: userImgQuantity,
        size: "512x512",
        response_format: "b64_json"
      }),
    });

    if (!response.ok) throw new Error("Failed to generate AI images.");

    const { data } = await response.json(); 
    updateImageCard([...data]);
  } catch (error) {
    alert(error.message);
  } finally {
    generateBtn.removeAttribute("disabled");
    generateBtn.innerText = "Generate";
    isImageGenerating = false;
  }
};

const handleImageGeneration = (e) => {
  e.preventDefault();
  if (isImageGenerating) return;

  const userPrompt = e.srcElement[0].value;
  const userImgQuantity = parseInt(e.srcElement[1].value);
  
  generateBtn.setAttribute("disabled", true);
  generateBtn.innerText = "Generating";
  isImageGenerating = true;
  
  const imgCardMarkup = Array.from({ length: userImgQuantity }, () => 
      `<div class="img-card loading">
        <img src="loader.svg" alt="AI generated image">
        <a class="download-btn" href="#">
          <img src="download.svg" alt="download icon">
        </a>
      </div>`
  ).join("");

  imageGallery.innerHTML = imgCardMarkup;
  generateAiImages(userPrompt, userImgQuantity);
};

generateForm.addEventListener("submit", handleImageGeneration);






















