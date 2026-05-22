const API_URL = "http://localhost:3000/analyser";
const fileInput = document.getElementById("imageUpload");
const previewImg = document.getElementById("preview");
const cameraBtn = document.getElementById("cameraBtn");
const cameraPreview = document.getElementById("cameraPreview");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultBox = document.getElementById("result");
const scoreText = document.getElementById("score");

let stream;

// 📸 Gestion Caméra
cameraBtn.addEventListener("click", async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraPreview.srcObject = stream;
        cameraPreview.style.display = "block";
        previewImg.style.display = "none";
        addCameraControls();
    } catch (error) {
        alert("Erreur caméra : " + error.message);
    }
});

function addCameraControls() {
    // Si les boutons existent déjà, on ne les recrée pas
    if (document.getElementById("cameraControls")) return;

    const controls = document.createElement("div");
    controls.id = "cameraControls";
    controls.innerHTML = `
        <button id="captureBtn">📷 Capturer</button>
        <button id="closeCameraBtn">❌ Fermer</button>
    `;
    cameraPreview.insertAdjacentElement("afterend", controls);

    // Écouteurs d'événements propres attachés sans onclick HTML
    document.getElementById("captureBtn").addEventListener("click", capturePhoto);
    document.getElementById("closeCameraBtn").addEventListener("click", closeCamera);
}

// Aperçu immédiat lors de la sélection d'un fichier local
fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            previewImg.src = reader.result;
            previewImg.style.display = "block";
            cameraPreview.style.display = "none";
            closeCamera(); // Ferme la flux caméra si actif
        };
        reader.readAsDataURL(file);
    }
});

function capturePhoto() {
    const canvas = document.createElement("canvas");
    canvas.width = cameraPreview.videoWidth;
    canvas.height = cameraPreview.videoHeight;
    canvas.getContext("2d").drawImage(cameraPreview, 0, 0);
    
    previewImg.src = canvas.toDataURL("image/jpeg");
    previewImg.style.display = "block";
    closeCamera();
}

function closeCamera() {
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
    }
    cameraPreview.style.display = "none";
    const c = document.getElementById("cameraControls");
    if (c) c.remove();
}

// 🚀 Logique d'analyse au clic
analyzeBtn.addEventListener("click", async () => {
    let base64Image = null;

    if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onloadend = () => {
            // Extrait uniquement la partie Base64 pure (après la virgule)
            base64Image = reader.result.split(",")[1];
            sendToServer(base64Image);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else if (previewImg.src && previewImg.src.startsWith("data:")) {
        base64Image = previewImg.src.split(",")[1];
        sendToServer(base64Image);
    } else {
        alert("Veuillez choisir une image ou prendre une photo.");
    }
});

async function sendToServer(base64Data) {
    resultBox.style.display = "block";
    scoreText.innerHTML = "Analyse en cours...";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Data })
        });

        if (!response.ok) {
            throw new Error(`Statut HTTP : ${response.status}`);
        }

        const data = await response.json();
        
        // 1. Convertir le Markdown de l'IA en vrai HTML propre
        const htmlFormate = marked.parse(data.resultat);
        
        // 2. L'injecter dans la page avec une structure CSS dédiée
        scoreText.innerHTML = `
            <div class="ia-response-container">
                <h2>✨ Résultat de votre Analyse IA</h2>
                <div class="ia-content">
                    ${htmlFormate}
                </div>
            </div>
        `;
    } catch (error) {
        scoreText.innerText = "Erreur serveur : " + error.message;
    }
}