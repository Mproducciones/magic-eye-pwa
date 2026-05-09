// Magic Photo Revelation - Réplica Exacta del APK
// Sistema de Actividades: Splash → Main → SelectArea → Zoom → Result

class MagicPhotoRevelation {
    constructor() {
        this.currentActivity = null;
        this.cameraStream = null;
        this.photoData = null;
        this.selectedArea = null;
        this.zoomScale = 1;
        this.zoomOffsetX = 0;
        this.zoomOffsetY = 0;
        this.isDragging = false;
        this.isSelecting = false;
        this.selectionStart = { x: 0, y: 0 };
        this.selectionEnd = { x: 0, y: 0 };
        
        // Camera switching
        this.currentCamera = 'environment'; // 'user' for front, 'environment' for back
        this.availableCameras = [];
        
        // Card system
        this.cards = [];
        this.selectedCard = null;
        this.cardTouchAreas = [];
        this.isCardSelectionMode = false;
        
        // Free drawing system
        this.freeDrawPath = [];
        this.isDrawing = false;
        
        // Eye detection system
        this.leftEyePosition = { x: 0, y: 0 };
        this.rightEyePosition = { x: 0, y: 0 };
        this.eyesDetected = false;
        
        this.initializeCards();
        this.initializeElements();
        this.setupEventListeners();
        this.startApp();
    }

    initializeCards() {
        // Inicializar las 52 cartas de poker
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13'];
        const cardNames = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        for (let suit of suits) {
            for (let i = 0; i < values.length; i++) {
                this.cards.push({
                    suit: suit,
                    value: values[i],
                    name: cardNames[i],
                    image: `cards/${suit}_${values[i]}.png`,
                    loaded: false
                });
            }
        }
        
        console.log('Initialized', this.cards.length, 'cards');
    }

    initializeElements() {
        // Activities
        this.splashActivity = document.getElementById('splashActivity');
        this.mainActivity = document.getElementById('mainActivity');
        this.selectAreaActivity = document.getElementById('selectAreaActivity');
        this.zoomActivity = document.getElementById('zoomActivity');
        this.resultView = document.getElementById('resultView');

        // Main Activity Elements
        this.cameraView = document.getElementById('cameraView');
        this.captureBtn = document.getElementById('captureBtn');
        this.switchCameraBtn = document.getElementById('switchCameraBtn');

        // Select Area Elements
        this.photoCanvas = document.getElementById('photoCanvas');
        this.selectionCanvas = document.getElementById('selectionCanvas');
        this.backBtn = document.getElementById('backBtn');
        this.confirmAreaBtn = document.getElementById('confirmAreaBtn');
        this.zoomBtn = document.getElementById('zoomBtn');

        // Zoom Activity Elements
        this.zoomCanvas = document.getElementById('zoomCanvas');
        this.zoomInBtn = document.getElementById('zoomInBtn');
        this.zoomOutBtn = document.getElementById('zoomOutBtn');
        this.resetZoomBtn = document.getElementById('resetZoomBtn');
        this.backToSelectBtn = document.getElementById('backToSelectBtn');
        this.predictionText = document.getElementById('predictionText');
        this.revealBtn = document.getElementById('revealBtn');

        // Result Elements
        this.resultCanvas = document.getElementById('resultCanvas');
        this.newPhotoBtn = document.getElementById('newPhotoBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.shareBtn = document.getElementById('shareBtn');
    }

    setupEventListeners() {
        // Main Activity
        this.captureBtn.addEventListener('click', () => this.capturePhoto());
        this.switchCameraBtn.addEventListener('click', () => this.switchCamera());

        // Select Area Activity
        this.backBtn.addEventListener('click', () => this.backToMain());
        this.confirmAreaBtn.addEventListener('click', () => this.confirmSelection());
        this.zoomBtn.addEventListener('click', () => this.goToZoom());

        // Selection Canvas Events
        this.selectionCanvas.addEventListener('mousedown', (e) => this.startSelection(e));
        this.selectionCanvas.addEventListener('mousemove', (e) => this.updateSelection(e));
        this.selectionCanvas.addEventListener('mouseup', (e) => this.endSelection(e));
        this.selectionCanvas.addEventListener('touchstart', (e) => this.startSelection(e));
        this.selectionCanvas.addEventListener('touchmove', (e) => this.updateSelection(e));
        this.selectionCanvas.addEventListener('touchend', (e) => this.endSelection(e));

        // Zoom Activity
        this.zoomInBtn.addEventListener('click', () => this.changeZoom(1.2));
        this.zoomOutBtn.addEventListener('click', () => this.changeZoom(0.8));
        this.resetZoomBtn.addEventListener('click', () => this.resetZoom());
        this.backToSelectBtn.addEventListener('click', () => this.backToSelectArea());
        this.revealBtn.addEventListener('click', () => this.revealPrediction());

        // Zoom Canvas Events
        this.zoomCanvas.addEventListener('mousedown', (e) => this.handleZoomCanvasClick(e));
        this.zoomCanvas.addEventListener('mousemove', (e) => this.drag(e));
        this.zoomCanvas.addEventListener('mouseup', () => this.endDrag());
        this.zoomCanvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.zoomCanvas.addEventListener('touchstart', (e) => this.handleZoomCanvasTouch(e));
        this.zoomCanvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.zoomCanvas.addEventListener('touchend', () => this.endDrag());

        // Result View
        this.newPhotoBtn.addEventListener('click', () => this.newPhoto());
        this.saveBtn.addEventListener('click', () => this.savePhoto());
        this.shareBtn.addEventListener('click', () => this.sharePhoto());

        // Prediction Text Enter Key
        this.predictionText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.revealPrediction();
        });
    }

    // Activity Management
    switchActivity(activityName) {
        // Hide all activities
        this.splashActivity.style.display = 'none';
        this.mainActivity.style.display = 'none';
        this.selectAreaActivity.style.display = 'none';
        this.zoomActivity.style.display = 'none';
        this.resultView.style.display = 'none';

        // Show selected activity
        switch(activityName) {
            case 'splash':
                this.splashActivity.style.display = 'flex';
                break;
            case 'main':
                this.mainActivity.style.display = 'block';
                break;
            case 'selectArea':
                this.selectAreaActivity.style.display = 'block';
                break;
            case 'zoom':
                this.zoomActivity.style.display = 'block';
                break;
            case 'result':
                this.resultView.style.display = 'block';
                break;
        }

        this.currentActivity = activityName;
    }

    async startApp() {
        this.switchActivity('splash');
        
        // Simular carga del APK
        await this.delay(2000);
        
        // Iniciar cámara y cambiar a MainActivity
        await this.startCamera();
        this.switchActivity('main');
    }

    async startCamera() {
        try {
            // Detectar cámaras disponibles
            await this.detectCameras();
            
            // Iniciar con la cámara actual - máxima calidad posible
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: this.currentCamera,
                    width: { ideal: 4096, max: 4096 },
                    height: { ideal: 2160, max: 2160 },
                    facingMode: "environment",
                    aspectRatio: 16/9
                }
            });
            this.cameraView.srcObject = this.cameraStream;
            
            // Actualizar estado del botón
            this.updateCameraButton();
            
            console.log('Camera started with maximum quality');
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('No se puede acceder a la cámara');
            this.switchCameraBtn.disabled = true;
        }
    }

    async detectCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.availableCameras = devices.filter(device => device.kind === 'videoinput');
            
            console.log('Available cameras:', this.availableCameras.length);
            
            // Si solo hay una cámara, deshabilitar el botón
            if (this.availableCameras.length <= 1) {
                this.switchCameraBtn.disabled = true;
            }
        } catch (error) {
            console.error('Error detecting cameras:', error);
            this.switchCameraBtn.disabled = true;
        }
    }

    async switchCamera() {
        if (this.availableCameras.length <= 1) {
            console.log('No additional cameras available');
            return;
        }

        try {
            // Detener cámara actual
            if (this.cameraStream) {
                this.cameraStream.getTracks().forEach(track => track.stop());
            }

            // Cambiar a la otra cámara
            this.currentCamera = this.currentCamera === 'environment' ? 'user' : 'environment';
            
            // Iniciar nueva cámara
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: this.currentCamera,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            
            this.cameraView.srcObject = this.cameraStream;
            
            // Actualizar botón
            this.updateCameraButton();
            
            console.log('Switched to:', this.currentCamera === 'environment' ? 'Back Camera' : 'Front Camera');
            
        } catch (error) {
            console.error('Error switching camera:', error);
            alert('Error al cambiar de cámara');
            
            // Intentar revertir a la cámara anterior
            this.currentCamera = this.currentCamera === 'environment' ? 'user' : 'environment';
            this.startCamera();
        }
    }

    updateCameraButton() {
        if (this.currentCamera === 'environment') {
            this.switchCameraBtn.innerHTML = '🤳'; // Front camera icon
            this.switchCameraBtn.title = 'Cambiar a cámara frontal';
        } else {
            this.switchCameraBtn.innerHTML = '📷'; // Back camera icon
            this.switchCameraBtn.title = 'Cambiar a cámara trasera';
        }
    }

    // Main Activity - Capture Photo
    capturePhoto() {
        const ctx = this.photoCanvas.getContext('2d');
        this.photoCanvas.width = this.cameraView.videoWidth;
        this.photoCanvas.height = this.cameraView.videoHeight;
        ctx.drawImage(this.cameraView, 0, 0);
        
        // Configurar canvas de selección con mismo tamaño
        this.selectionCanvas.width = this.photoCanvas.width;
        this.selectionCanvas.height = this.photoCanvas.height;
        
        // Guardar foto y cambiar a SelectAreaActivity
        this.photoData = this.photoCanvas.toDataURL('image/jpeg');
        this.switchActivity('selectArea');
        
        // Dibujar foto en el canvas de zoom también
        const zoomCtx = this.zoomCanvas.getContext('2d');
        this.zoomCanvas.width = this.photoCanvas.width;
        this.zoomCanvas.height = this.photoCanvas.height;
        zoomCtx.drawImage(this.photoCanvas, 0, 0);
        
        console.log('Photo captured, switching to SelectAreaActivity');
        console.log('Canvas sizes - Photo:', this.photoCanvas.width, 'x', this.photoCanvas.height);
        console.log('Canvas sizes - Selection:', this.selectionCanvas.width, 'x', this.selectionCanvas.height);
    }

    // Select Area Activity - Free Drawing with Finger
    startSelection(e) {
        e.preventDefault();
        this.isSelecting = true;
        
        const rect = this.selectionCanvas.getBoundingClientRect();
        const scaleX = this.selectionCanvas.width / rect.width;
        const scaleY = this.selectionCanvas.height / rect.height;
        
        const x = ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left) * scaleX;
        const y = ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top) * scaleY;
        
        this.selectionStart = { x, y };
        this.selectionEnd = { x, y };
        
        // Iniciar trazo libre
        this.freeDrawPath = [{x, y}];
        this.isDrawing = true;
        
        console.log('Free drawing started at:', x, y);
        this.drawFreeSelection();
    }

    updateSelection(e) {
        if (!this.isSelecting || !this.isDrawing) return;
        e.preventDefault();
        
        const rect = this.selectionCanvas.getBoundingClientRect();
        const scaleX = this.selectionCanvas.width / rect.width;
        const scaleY = this.selectionCanvas.height / rect.height;
        
        const x = ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left) * scaleX;
        const y = ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top) * scaleY;
        
        // Añadir punto al trazo libre
        this.freeDrawPath.push({x, y});
        
        console.log('Free drawing updated at:', x, y);
        this.drawFreeSelection();
    }

    endSelection(e) {
        if (!this.isSelecting) return;
        e.preventDefault();
        this.isSelecting = false;
        
        const width = Math.abs(this.selectionEnd.x - this.selectionStart.x);
        const height = Math.abs(this.selectionEnd.y - this.selectionStart.y);
        
        if (width > 30 && height > 30) {
            this.selectedArea = {
                x: Math.min(this.selectionStart.x, this.selectionEnd.x),
                y: Math.min(this.selectionStart.y, this.selectionEnd.y),
                width: width,
                height: height
            };
            
            console.log('Area selected:', this.selectedArea);
            
            // Mostrar feedback visual
            const info = document.querySelector('.selection-info p');
            if (info) {
                info.textContent = `✅ Área seleccionada: ${Math.round(width)}x${Math.round(height)}px`;
                info.style.color = '#4CAF50';
            }
            
            // Mantener la selección visible por 2 segundos
            setTimeout(() => {
                this.clearSelection();
                if (info) {
                    info.textContent = 'Dibuja un rectángulo para seleccionar el área';
                    info.style.color = 'white';
                }
            }, 2000);
        } else {
            // Área demasiado pequeña
            const info = document.querySelector('.selection-info p');
            if (info) {
                info.textContent = '❌ El área es muy pequeña, intenta de nuevo';
                info.style.color = '#f44336';
            }
            this.clearSelection();
        }
    }

    drawFreeSelection() {
        const ctx = this.selectionCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.selectionCanvas.width, this.selectionCanvas.height);
        
        if (!this.isDrawing) return;
        
        // Dibujar trazo libre con efecto de pincel
        ctx.strokeStyle = '#8a2be2';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.setLineDash([]);
        
        ctx.beginPath();
        ctx.moveTo(this.freeDrawPath[0].x, this.freeDrawPath[0].y);
        
        for (let i = 1; i < this.freeDrawPath.length; i++) {
            ctx.lineTo(this.freeDrawPath[i].x, this.freeDrawPath[i].y);
        }
        
        ctx.stroke();
        
        // Dibujar puntos de control del trazo
        ctx.fillStyle = '#8a2be2';
        for (let point of this.freeDrawPath) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawSelection() {
        const ctx = this.selectionCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.selectionCanvas.width, this.selectionCanvas.height);
        
        if (!this.isSelecting) return;
        
        const x = Math.min(this.selectionStart.x, this.selectionEnd.x);
        const y = Math.min(this.selectionStart.y, this.selectionEnd.y);
        const width = Math.abs(this.selectionEnd.x - this.selectionStart.x);
        const height = Math.abs(this.selectionEnd.y - this.selectionStart.y);
        
        // Draw selection rectangle
        ctx.strokeStyle = '#8a2be2';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.fillStyle = 'rgba(138, 43, 226, 0.2)';
        
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        
        // Draw corner handles
        ctx.setLineDash([]);
        ctx.fillStyle = '#8a2be2';
        const handleSize = 10;
        
        // Top-left
        ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
        // Top-right
        ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize);
        // Bottom-left
        ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
        // Bottom-right
        ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
    }

    clearSelection() {
        const ctx = this.selectionCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.selectionCanvas.width, this.selectionCanvas.height);
    }

    confirmSelection() {
        if (!this.selectedArea) {
            alert('Por favor selecciona un área primero');
            return;
        }
        this.goToZoom();
    }

    goToZoom() {
        if (!this.selectedArea) {
            alert('Por favor selecciona un área primero');
            return;
        }
        
        this.switchActivity('zoom');
        
        // Detectar ojos y hacer zoom binocular
        this.detectEyesAndZoom();
        
        // Pequeña pausa para simular comportamiento nativo
        setTimeout(() => {
            // Activar modo de selección de cartas
            this.activateCardSelectionMode();
        }, 500);
    }

    detectEyesAndZoom() {
        // Analizar la foto para detectar ambos ojos
        this.detectEyes();
        
        if (this.eyesDetected) {
            // Zoom binocular centrado entre los ojos
            this.zoomToBothEyes();
        } else {
            // Zoom normal al centro
            this.zoomToEye();
        }
    }

    detectEyes() {
        // Simular detección de ojos usando análisis de la foto
        const ctx = this.photoCanvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, this.photoCanvas.width, this.photoCanvas.height);
        const data = imageData.data;
        
        // Buscar patrones de ojos (áreas brillantes y redondas)
        const eyeCandidates = [];
        
        // Dividir la cara en zonas superiores e inferiores
        const faceWidth = this.photoCanvas.width;
        const faceHeight = this.photoCanvas.height;
        const upperFaceY = faceHeight * 0.3;
        const lowerFaceY = faceHeight * 0.7;
        
        // Escanear por posibles ojos
        for (let y = upperFaceY; y < lowerFaceY; y += 20) {
            for (let x = faceWidth * 0.2; x < faceWidth * 0.8; x += 30) {
                const centerX = x + 15;
                const centerY = y + 10;
                
                // Analizar brillo y color en esta área
                let brightness = 0;
                let pixelCount = 0;
                
                for (let dy = -10; dy <= 10; dy++) {
                    for (let dx = -15; dx <= 15; dx++) {
                        const pixelX = Math.floor(centerX + dx);
                        const pixelY = Math.floor(centerY + dy);
                        
                        if (pixelX >= 0 && pixelX < faceWidth && pixelY >= 0 && pixelY < faceHeight) {
                            const index = (pixelY * faceWidth + pixelX) * 4;
                            const r = data[index];
                            const g = data[index + 1];
                            const b = data[index + 2];
                            
                            brightness += (r + g + b) / 3;
                            pixelCount++;
                        }
                    }
                }
                
                const avgBrightness = brightness / pixelCount;
                
                // Si es suficientemente brillante y redondeado, podría ser un ojo
                if (avgBrightness > 180 && pixelCount > 50) {
                    eyeCandidates.push({
                        x: centerX,
                        y: centerY,
                        brightness: avgBrightness,
                        confidence: Math.min(pixelCount / 100, 1)
                    });
                }
            }
        }
        
        // Ordenar por confianza y tomar los 2 mejores
        eyeCandidates.sort((a, b) => b.confidence - a.confidence);
        
        if (eyeCandidates.length >= 2) {
            this.leftEyePosition = eyeCandidates[0];
            this.rightEyePosition = eyeCandidates[1];
            this.eyesDetected = true;
            
            console.log('Eyes detected:', this.leftEyePosition, this.rightEyePosition);
        } else {
            this.eyesDetected = false;
            console.log('No eyes detected, using center zoom');
        }
    }

    zoomToBothEyes() {
        // Calcular punto medio entre los ojos
        const midX = (this.leftEyePosition.x + this.rightEyePosition.x) / 2;
        const midY = (this.leftEyePosition.y + this.rightEyePosition.y) / 2;
        
        // Zoom con animación suave al punto medio
        this.animateZoomTo(4, midX, midY);
        
        console.log('Zooming to both eyes center:', midX, midY);
    }

    zoomToEye() {
        // Calcular el centro de la foto (donde estaría el ojo) - como en APK
        const centerX = this.zoomCanvas.width / 2;
        const centerY = this.zoomCanvas.height / 2;
        
        // Aplicar zoom al centro con animación suave - como en app nativa
        this.animateZoomTo(3, centerX, centerY);
        
        console.log('Zooming to eye center:', centerX, centerY);
    }

    animateZoomTo(targetScale, centerX, centerY) {
        const startScale = this.zoomScale;
        const duration = 800; // ms
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function para animación suave
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            this.zoomScale = startScale + (targetScale - startScale) * easeProgress;
            
            // Aplicar zoom centrado
            const zoomCtx = this.zoomCanvas.getContext('2d');
            zoomCtx.clearRect(0, 0, this.zoomCanvas.width, this.zoomCanvas.height);
            zoomCtx.save();
            zoomCtx.scale(this.zoomScale, this.zoomScale);
            
            // Calcular offset para mantener el centro
            const scaledWidth = this.photoCanvas.width * this.zoomScale;
            const scaledHeight = this.photoCanvas.height * this.zoomScale;
            this.zoomOffsetX = (this.zoomCanvas.width - scaledWidth) / 2;
            this.zoomOffsetY = (this.zoomCanvas.height - scaledHeight) / 2;
            
            zoomCtx.drawImage(this.photoCanvas, this.zoomOffsetX / this.zoomScale, this.zoomOffsetY / this.zoomScale);
            zoomCtx.restore();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    activateCardSelectionMode() {
        this.isCardSelectionMode = true;
        this.cardTouchAreas = [];
        
        // Obtener dimensiones del canvas
        const canvasWidth = this.zoomCanvas.width;
        const canvasHeight = this.zoomCanvas.height;
        
        // Dividir pantalla en zonas de cartas según colores
        this.createCardZones(canvasWidth, canvasHeight);
        
        // Ocultar input de predicción y mostrar instrucciones
        this.predictionText.style.display = 'none';
        this.revealBtn.style.display = 'none';
        
        // Añadir instrucciones mejoradas para flujo nativo
        const instructions = document.createElement('div');
        instructions.id = 'cardInstructions';
        instructions.innerHTML = `
            <p>🎴 Toca la zona del color que quieres</p>
            <p style="font-size: 12px; opacity: 0.8;">Rojo: 1-6 | Negro: 7-12</p>
            <p style="font-size: 10px; opacity: 0.6;">Diamantes: 1-6 | Corazones: 7-12</p>
        `;
        instructions.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(45deg, rgba(220, 20, 60, 0.95), rgba(180, 20, 60, 0.95));
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-size: 16px;
            z-index: 100;
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 4px 20px rgba(220, 20, 60, 0.4);
            text-align: center;
        `;
        this.zoomActivity.appendChild(instructions);
        
        // Dibujar zonas visuales para ayudar al usuario
        this.drawCardZones();
        
        console.log('Card selection mode activated with zones');
        console.log('Canvas size:', canvasWidth, 'x', canvasHeight);
        console.log('Card zones created:', this.cardTouchAreas.length);
    }

    createCardZones(canvasWidth, canvasHeight) {
        // Zona roja (cartas 1-6)
        this.createZone('red', canvasWidth * 0.25, canvasHeight * 0.5, 'hearts', 1, 6);
        
        // Zona negra (cartas 7-12)
        this.createZone('black', canvasWidth * 0.75, canvasHeight * 0.5, 'spades', 7, 12);
        
        // Zona roja (diamantes 1-6)
        this.createZone('red', canvasWidth * 0.25, canvasHeight * 0.5, 'diamonds', 1, 6);
        
        // Zona negra (corazones 7-12)
        this.createZone('black', canvasWidth * 0.75, canvasHeight * 0.5, 'clubs', 7, 12);
    }

    createZone(color, x, y, suit, startValue, endValue) {
        const zoneWidth = 200;
        const zoneHeight = canvasHeight * 0.4;
        const spacing = 10;
        
        for (let i = startValue; i <= endValue; i++) {
            const cardIndex = this.cards.findIndex(card => 
                card.suit === suit && parseInt(card.value) === i
            );
            
            if (cardIndex !== -1) {
                const card = this.cards[cardIndex];
                const row = Math.floor((i - startValue) / 4);
                const col = (i - startValue) % 4;
                
                const cardX = x + col * (zoneWidth + spacing);
                const cardY = y + row * (zoneHeight + spacing);
                
                this.cardTouchAreas.push({
                    x: cardX,
                    y: cardY,
                    width: zoneWidth,
                    height: zoneHeight,
                    card: card,
                    index: cardIndex,
                    zone: color,
                    value: i
                });
            }
        }
    }

    drawCardZones() {
        const ctx = this.zoomCanvas.getContext('2d');
        
        // Dibujar fondo semi-transparente
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, this.zoomCanvas.width, this.zoomCanvas.height);
        
        // Dibujar zonas de cartas
        for (let area of this.cardTouchAreas) {
            // Color de fondo según zona
            if (area.zone === 'red') {
                ctx.fillStyle = 'rgba(255, 200, 200, 0.2)';
            } else if (area.zone === 'black') {
                ctx.fillStyle = 'rgba(50, 50, 50, 0.2)';
            }
            
            ctx.fillRect(area.x, area.y, area.width, area.height);
            
            // Borde de zona
            ctx.strokeStyle = area.zone === 'red' ? 'rgba(255, 100, 100, 0.8)' : 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.strokeRect(area.x, area.y, area.width, area.height);
            
            // Etiqueta de zona
            ctx.fillStyle = 'white';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(area.zone.toUpperCase(), area.x + area.width/2, area.y + 20);
        }
        
        // Añadir números de carta para referencia
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '10px Arial';
        ctx.setLineDash([]);
        
        for (let i = 0; i < this.cardTouchAreas.length; i++) {
            const area = this.cardTouchAreas[i];
            ctx.fillText(area.value, area.x + area.width/2, area.y + 12);
        }
    }

    // Zoom Activity - Zoom and Pan
    changeZoom(factor) {
        const newScale = this.zoomScale * factor;
        if (newScale >= 0.5 && newScale <= 5) {
            this.zoomScale = newScale;
            this.applyZoom();
        }
    }

    resetZoom() {
        this.zoomScale = 1;
        this.zoomOffsetX = 0;
        this.zoomOffsetY = 0;
        this.applyZoom();
    }

    applyZoom() {
        this.zoomCanvas.style.transform = `scale(${this.zoomScale}) translate(${this.zoomOffsetX}px, ${this.zoomOffsetY}px)`;
    }

    startDrag(e) {
        if (e.button === 0) {
            this.isDragging = true;
            const x = e.clientX || (e.touches && e.touches[0].clientX);
            const y = e.clientY || (e.touches && e.touches[0].clientY);
            this.dragStartX = x - this.zoomOffsetX;
            this.dragStartY = y - this.zoomOffsetY;
            this.zoomCanvas.style.cursor = 'grabbing';
        }
    }

    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        const x = e.clientX || (e.touches && e.touches[0].clientX);
        const y = e.clientY || (e.touches && e.touches[0].clientY);
        
        this.zoomOffsetX = x - this.dragStartX;
        this.zoomOffsetY = y - this.dragStartY;
        this.applyZoom();
    }

    endDrag() {
        this.isDragging = false;
        this.zoomCanvas.style.cursor = 'grab';
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.changeZoom(delta);
    }

    handleZoomCanvasClick(e) {
        if (this.isCardSelectionMode) {
            this.handleCardSelection(e);
        } else {
            this.startDrag(e);
        }
    }

    handleZoomCanvasTouch(e) {
        e.preventDefault();
        if (this.isCardSelectionMode && e.touches.length === 1) {
            this.handleCardSelection(e);
        } else if (e.touches.length === 1) {
            this.startDrag(e);
        } else if (e.touches.length === 2) {
            // Pinch to zoom
            const distance = this.getTouchDistance(e.touches);
            this.zoomCanvas.dataset.initialDistance = distance;
            this.zoomCanvas.dataset.initialScale = this.zoomScale;
        }
    }

    handleCardSelection(e) {
        e.preventDefault();
        
        const rect = this.zoomCanvas.getBoundingClientRect();
        const scaleX = this.zoomCanvas.width / rect.width;
        const scaleY = this.zoomCanvas.height / rect.height;
        
        let x, y;
        if (e.touches && e.touches.length > 0) {
            // Touch event - más preciso para móviles
            x = (e.touches[0].clientX - rect.left) * scaleX;
            y = (e.touches[0].clientY - rect.top) * scaleY;
        } else {
            // Mouse event
            x = (e.clientX - rect.left) * scaleX;
            y = (e.clientY - rect.top) * scaleY;
        }
        
        // Feedback visual del toque
        this.showTouchFeedback(x, y);
        
        // Verificar si el toque está en un área de carta
        for (let area of this.cardTouchAreas) {
            if (x >= area.x && x <= area.x + area.width &&
                y >= area.y && y <= area.y + area.height) {
                console.log('Card selected:', area.card.name, 'of', area.card.suit, 'from zone:', area.zone);
                this.selectCard(area.card, area);
                return;
            }
        }
        
        console.log('No card area touched at:', x, y);
    }

    showTouchFeedback(x, y) {
        // Mostrar feedback visual del toque
        const ctx = this.zoomCanvas.getContext('2d');
        
        // Dibujar círculo de feedback
        ctx.save();
        ctx.strokeStyle = 'rgba(138, 43, 226, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
        
        // Eliminar feedback después de 200ms
        setTimeout(() => {
            this.drawCardGrid();
        }, 200);
    }

    selectCard(card, area) {
        this.selectedCard = card;
        console.log('Card selected:', card.name, 'of', card.suit);
        
        // Dibujar la carta seleccionada sobre el área seleccionada originalmente
        this.drawSelectedCard(card);
        
        // Salir del modo de selección de cartas
        this.exitCardSelectionMode();
        
        // Ir a la vista de resultado
        setTimeout(() => {
            this.goToResult();
        }, 1000);
    }

    drawSelectedCard(card) {
        const ctx = this.zoomCanvas.getContext('2d');
        
        // Cargar la imagen de la carta
        const img = new Image();
        img.onload = () => {
            // Efecto mágico mejorado - como en APK nativa
            this.performMagicReveal(card, img);
        };
        img.src = card.image;
    }

    performMagicReveal(card, img) {
        // Vibración al seleccionar carta - como en APK nativa
        if ('vibrate' in navigator) {
            navigator.vibrate([100, 50, 100]);
        }
        
        // Sonido mágico al seleccionar carta
        this.playMagicSound();
        
        const ctx = this.zoomCanvas.getContext('2d');
        
        // Crear efecto de partículas mágicas más elaborado
        const particles = [];
        for (let i = 0; i < 30; i++) {
            particles.push({
                x: this.selectedArea.x + this.selectedArea.width / 2,
                y: this.selectedArea.y + this.selectedArea.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 4 + 2,
                alpha: 1,
                color: `hsl(${Math.random() * 60 + 260}, 100%, 70%)`,
                type: Math.random() > 0.5 ? 'sparkle' : 'glow'
            });
        }
        
        // Animación de revelación mágica mejorada
        let frame = 0;
        const maxFrames = 80;
        
        const animate = () => {
            ctx.clearRect(0, 0, this.zoomCanvas.width, this.zoomCanvas.height);
            
            // Redibujar la foto con zoom
            ctx.save();
            ctx.scale(this.zoomScale, this.zoomScale);
            ctx.drawImage(this.photoCanvas, 0, 0);
            ctx.restore();
            
            // Actualizar partículas con física mejorada
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.alpha -= 0.015;
                particle.size *= 0.985;
                particle.vy += 0.1; // Gravedad
                
                if (particle.type === 'sparkle') {
                    // Efecto de destello
                    ctx.save();
                    ctx.globalAlpha = particle.alpha;
                    ctx.fillStyle = particle.color;
                    ctx.shadowColor = particle.color;
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else {
                    // Efecto de brillo
                    ctx.save();
                    ctx.globalAlpha = particle.alpha * 0.5;
                    ctx.fillStyle = particle.color;
                    ctx.shadowColor = particle.color;
                    ctx.shadowBlur = 20;
                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
            });
            
            // Dibujar la carta con efecto de aparición mejorado
            const progress = frame / maxFrames;
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            ctx.save();
            ctx.globalAlpha = easeProgress;
            ctx.scale(this.zoomScale, this.zoomScale);
            
            // Efectos mágicos mejorados
            ctx.shadowColor = 'rgba(138, 43, 226, 0.9)';
            ctx.shadowBlur = 30 * easeProgress;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            // Añadir brillo adicional
            const gradient = ctx.createRadialGradient(
                this.selectedArea.x + this.selectedArea.width / 2,
                this.selectedArea.y + this.selectedArea.height / 2,
                0,
                this.selectedArea.x + this.selectedArea.width / 2,
                this.selectedArea.y + this.selectedArea.height / 2,
                Math.max(this.selectedArea.width, this.selectedArea.height)
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.4)');
            gradient.addColorStop(1, 'rgba(138, 43, 226, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(
                this.selectedArea.x - 10,
                this.selectedArea.y - 10,
                this.selectedArea.width + 20,
                this.selectedArea.height + 20
            );
            
            ctx.drawImage(img, this.selectedArea.x, this.selectedArea.y, 
                      this.selectedArea.width, this.selectedArea.height);
            ctx.restore();
            
            frame++;
            
            if (frame < maxFrames) {
                requestAnimationFrame(animate);
            } else {
                // Revelación completa - vibración de éxito
                if ('vibrate' in navigator) {
                    navigator.vibrate([200, 100, 200]);
                }
                
                setTimeout(() => {
                    this.goToResult();
                }, 500);
            }
        };
        
        requestAnimationFrame(animate);
    }

    playMagicSound() {
        // Crear sonido mágico simple
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }

    exitCardSelectionMode() {
        this.isCardSelectionMode = false;
        
        // Eliminar instrucciones
        const instructions = document.getElementById('cardInstructions');
        if (instructions) {
            instructions.remove();
        }
        
        // Restaurar controles de predicción
        this.predictionText.style.display = 'block';
        this.revealBtn.style.display = 'block';
        
        console.log('Exited card selection mode');
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1 && this.isDragging) {
            this.drag(e);
        } else if (e.touches.length === 2) {
            const distance = this.getTouchDistance(e.touches);
            const initialDistance = parseFloat(this.zoomCanvas.dataset.initialDistance);
            const initialScale = parseFloat(this.zoomCanvas.dataset.initialScale);
            
            this.zoomScale = initialScale * (distance / initialDistance);
            this.zoomScale = Math.max(0.5, Math.min(5, this.zoomScale));
            this.applyZoom();
        }
    }

    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    revealPrediction() {
        const text = this.predictionText.value.trim();
        if (!text) {
            alert('Por favor escribe una predicción');
            return;
        }

        // Create prediction element
        const predictionElement = document.createElement('div');
        predictionElement.className = 'prediction-text';
        predictionElement.textContent = text;

        // Position prediction in selected area
        if (this.selectedArea) {
            const scaleX = this.zoomCanvas.width / this.zoomCanvas.clientWidth;
            const scaleY = this.zoomCanvas.height / this.zoomCanvas.clientHeight;
            
            predictionElement.style.left = `${this.selectedArea.x / scaleX}px`;
            predictionElement.style.top = `${this.selectedArea.y / scaleY}px`;
            predictionElement.style.width = `${this.selectedArea.width / scaleX}px`;
            predictionElement.style.height = `${this.selectedArea.height / scaleY}px`;
            predictionElement.style.display = 'flex';
            predictionElement.style.alignItems = 'center';
            predictionElement.style.justifyContent = 'center';
        } else {
            predictionElement.style.left = '50%';
            predictionElement.style.top = '50%';
            predictionElement.style.transform = 'translate(-50%, -50%)';
        }

        // Add to zoom activity
        this.zoomActivity.appendChild(predictionElement);

        // Copy to result canvas
        setTimeout(() => {
            this.goToResult();
        }, 2000);
    }

    // Result View
    goToResult() {
        // Draw result with selected card
        const ctx = this.resultCanvas.getContext('2d');
        this.resultCanvas.width = this.zoomCanvas.width;
        this.resultCanvas.height = this.zoomCanvas.height;
        
        // Apply zoom transform and draw
        ctx.save();
        ctx.scale(this.zoomScale, this.zoomScale);
        ctx.translate(this.zoomOffsetX / this.zoomScale, this.zoomOffsetY / this.zoomScale);
        ctx.drawImage(this.zoomCanvas, 0, 0);
        ctx.restore();

        // Añadir información de la carta seleccionada
        if (this.selectedCard) {
            const cardInfo = document.createElement('div');
            cardInfo.className = 'card-info';
            cardInfo.innerHTML = `
                <div class="card-name">${this.selectedCard.name} of ${this.selectedCard.suit}</div>
                <div class="magic-text">✨ Magical Revelation ✨</div>
            `;
            cardInfo.style.cssText = `
                position: absolute;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(45deg, rgba(138, 43, 226, 0.9), rgba(156, 39, 176, 0.9));
                color: white;
                padding: 20px 30px;
                border-radius: 20px;
                text-align: center;
                z-index: 100;
                backdrop-filter: blur(10px);
                border: 2px solid rgba(255, 255, 255, 0.3);
                box-shadow: 0 8px 32px rgba(138, 43, 226, 0.4);
            `;
            
            this.resultView.appendChild(cardInfo);
        }

        this.switchActivity('result');
    }

    // Navigation Methods
    backToMain() {
        this.stopCamera();
        this.startCamera();
        this.switchActivity('main');
        this.clearSelection();
        this.selectedArea = null;
    }

    backToSelectArea() {
        // Limpiar modo de selección de cartas
        if (this.isCardSelectionMode) {
            this.exitCardSelectionMode();
        }
        
        this.switchActivity('selectArea');
        this.predictionText.value = '';
        this.selectedCard = null;
    }

    newPhoto() {
        this.backToMain();
    }

    savePhoto() {
        const link = document.createElement('a');
        link.download = `magic-photo-${Date.now()}.jpg`;
        link.href = this.resultCanvas.toDataURL();
        link.click();
    }

    sharePhoto() {
        if (navigator.share) {
            this.resultCanvas.toBlob(blob => {
                const file = new File([blob], 'magic-photo.jpg', { type: 'image/jpeg' });
                navigator.share({
                    title: 'Magic Photo Revelation',
                    text: '¡Mira mi predicción mágica!',
                    files: [file]
                });
            });
        } else {
            alert('Compartir no está disponible en este navegador');
        }
    }

    // Utility Methods
    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize App
window.addEventListener('load', () => {
    new MagicPhotoRevelation();
});

// PWA Installation
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('Install prompt ready');
    
    // Mostrar botón de instalación personalizado
    showInstallButton();
});

function showInstallButton() {
    // Crear botón de instalación si no existe
    if (!document.getElementById('installBtn')) {
        const installBtn = document.createElement('button');
        installBtn.id = 'installBtn';
        installBtn.innerHTML = '📱 Instalar App';
        installBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(45deg, #8a2be2, #9c27b0);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(138, 43, 226, 0.4);
            transition: all 0.3s ease;
        `;
        
        installBtn.addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('PWA installed');
                        installBtn.style.display = 'none';
                    }
                    deferredPrompt = null;
                });
            }
        });
        
        installBtn.addEventListener('mouseenter', () => {
            installBtn.style.transform = 'scale(1.05)';
        });
        
        installBtn.addEventListener('mouseleave', () => {
            installBtn.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(installBtn);
    }
}

// Service Worker Registration con mejoras
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('Service Worker registrado:', registration);
                
                // Verificar actualizaciones
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('Nuevo Service Worker encontrado');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('Nuevo contenido disponible, recarga la página');
                            if (confirm('Hay una nueva versión disponible. ¿Actualizar ahora?')) {
                                window.location.reload();
                            }
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Error en Service Worker:', error);
            });
    });
}
