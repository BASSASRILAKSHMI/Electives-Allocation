# requirements: pip install fastapi uvicorn transformers pillow torch torchvision
from fastapi import FastAPI, UploadFile, File
from PIL import Image
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
import torch
import io

app = FastAPI()

# Load model and processor once (to avoid reloading for every request)
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-large-printed")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-large-printed")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

@app.post("/ocr")
async def ocr_image(file: UploadFile = File(...)):
    """OCR endpoint that extracts text from an uploaded image."""
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")

    pixel_values = processor(images=image, return_tensors="pt").pixel_values.to(device)
    generated_ids = model.generate(pixel_values, max_length=512, num_beams=4)
    generated_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]

    return {"text": generated_text}
