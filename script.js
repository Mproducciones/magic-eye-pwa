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
            
            // Iniciar con la cámara actual
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: this.currentCamera,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            this.cameraView.srcObject = this.cameraStream;
            
            // Actualizar estado del botón
            this.updateCameraButton();
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

    // Select Area Activity - Selection Management
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
        
        console.log('Selection started at:', x, y);
        this.drawSelection();
    }

    updateSelection(e) {
        if (!this.isSelecting) return;
        e.preventDefault();
        
        const rect = this.selectionCanvas.getBoundingClientRect();
        const scaleX = this.selectionCanvas.width / rect.width;
        const scaleY = this.selectionCanvas.height / rect.height;
        
        const x = ((e.clientX || (e.touches && e.touches[0].clientX)) - rect.left) * scaleX;
        const y = ((e.clientY || (e.touches && e.touches[0].clientY)) - rect.top) * scaleY;
        
        this.selectionEnd = { x, y };
        this.drawSelection();
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
        const handleSize = 12;
        
        ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize); // NW
        ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize); // NE
        ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize); // SW
        ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize); // SE
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
        
        // Hacer zoom al centro de la foto (área del ojo)
        this.zoomToEye();
        
        // Activar modo de selección de cartas
        this.activateCardSelectionMode();
    }

    zoomToEye() {
        // Calcular el centro de la foto (donde estaría el ojo)
        const centerX = this.zoomCanvas.width / 2;
        const centerY = this.zoomCanvas.height / 2;
        
        // Aplicar zoom al centro
        this.zoomScale = 3; // Zoom moderado al ojo
        this.zoomOffsetX = 0;
        this.zoomOffsetY = 0;
        
        // Centrar en el ojo
        const zoomCtx = this.zoomCanvas.getContext('2d');
        zoomCtx.save();
        zoomCtx.scale(this.zoomScale, this.zoomScale);
        zoomCtx.drawImage(this.photoCanvas, 0, 0);
        zoomCtx.restore();
        
        console.log('Zoomed to eye center:', centerX, centerY);
    }

    activateCardSelectionMode() {
        this.isCardSelectionMode = true;
        this.cardTouchAreas = [];
        
        // Crear áreas de toque para las cartas (4x13 grid)
        const cardWidth = 80;
        const cardHeight = 120;
        const spacing = 10;
        const startX = 50;
        const startY = 100;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 13; col++) {
                const cardIndex = row * 13 + col;
                const x = startX + col * (cardWidth + spacing);
                const y = startY + row * (cardHeight + spacing);
                
                this.cardTouchAreas.push({
                    x: x,
                    y: y,
                    width: cardWidth,
                    height: cardHeight,
                    card: this.cards[cardIndex],
                    index: cardIndex
                });
            }
        }
        
        // Ocultar input de predicción y mostrar instrucciones
        this.predictionText.style.display = 'none';
        this.revealBtn.style.display = 'none';
        
        // Añadir instrucciones
        const instructions = document.createElement('div');
        instructions.id = 'cardInstructions';
        instructions.innerHTML = '<p>Toca una carta para seleccionarla</p>';
        instructions.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 25px;
            font-size: 16px;
            z-index: 100;
            backdrop-filter: blur(10px);
        `;
        this.zoomActivity.appendChild(instructions);
        
        console.log('Card selection mode activated');
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
        const x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
        const y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;
        
        // Verificar si el toque está en un área de carta
        for (let area of this.cardTouchAreas) {
            if (x >= area.x && x <= area.x + area.width &&
                y >= area.y && y <= area.y + area.height) {
                this.selectCard(area.card, area);
                break;
            }
        }
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
            // Dibujar la carta sobre el área seleccionada
            ctx.save();
            
            // Aplicar zoom actual
            ctx.scale(this.zoomScale, this.zoomScale);
            
            // Dibujar la carta en el área seleccionada con efecto mágico
            const cardWidth = this.selectedArea.width;
            const cardHeight = this.selectedArea.height;
            
            // Efecto de aparición gradual
            ctx.globalAlpha = 0;
            const fadeIn = setInterval(() => {
                ctx.clearRect(0, 0, this.zoomCanvas.width, this.zoomCanvas.height);
                
                // Redibujar la foto con zoom
                ctx.drawImage(this.photoCanvas, 0, 0);
                
                // Dibujar la carta con transparencia creciente
                ctx.globalAlpha += 0.1;
                ctx.drawImage(img, this.selectedArea.x, this.selectedArea.y, cardWidth, cardHeight);
                
                if (ctx.globalAlpha >= 1) {
                    clearInterval(fadeIn);
                }
            }, 50);
            
            ctx.restore();
        };
        img.src = card.image;
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
