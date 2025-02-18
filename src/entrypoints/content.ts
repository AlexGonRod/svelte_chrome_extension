export default defineContentScript({
	matches: ['<all_urls>'],
	main() {
		let isSelecting = false;
		let selectedItems = new Set<HTMLElement>()
		let selectedTexts = new Set<string>()
		chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
			let startX: number, startY: number, endX: number, endY: number
			let _isSelecting: boolean = false;
			let selectionOverlay: HTMLElement | null = null;
			let selectionBox: HTMLElement | null = null;
			let isCaptureModeActive: boolean = false;

			function handleClick(event: Event) {
				if (isSelecting) {
					event.preventDefault()
					const clickedElement = event.target as HTMLElement
					const textContent = clickedElement.textContent !== undefined ? clickedElement?.textContent?.trim() : ''

					if (clickedElement) {
						if (!selectedItems.has(clickedElement)) {
							selectedItems.add(clickedElement);
							textContent && selectedTexts.add(textContent);
							clickedElement.style.backgroundColor = "yellow"
						} else {
							selectedItems.delete(clickedElement);
							textContent && selectedTexts.delete(textContent);
							clickedElement.style.backgroundColor = ""
						}
					}
				}
			}

			function cleanupCapture() {
				removeSelectionElements();
				isCaptureModeActive = false;
				isSelecting = false;
				// Eliminar los event listeners
				document.removeEventListener('mousemove', handleMouseMove);
				document.removeEventListener('mouseup', handleMouseUp);
			}

			function createSelectionElements() {
				// Eliminar elementos existentes si los hay
				removeSelectionElements();

				// Crear overlay
				selectionOverlay = document.createElement('div');
				Object.assign(selectionOverlay.style, {
					position: 'fixed',
					top: '0',
					left: '0',
					width: '100%',
					height: '100%',
					zIndex: '999999',
					cursor: 'crosshair',
					background: 'rgba(0, 0, 0, 0.1)',
					pointerEvents: 'auto'
				});

				// Crear caja de selección
				selectionBox = document.createElement('div');
				Object.assign(selectionBox.style, {
					position: 'fixed',
					border: '2px solid red',
					backgroundColor: 'rgba(255, 0, 0, 0.1)',
					zIndex: '1000000',
					display: 'none',
					pointerEvents: 'none'
				});

				document.body.appendChild(selectionOverlay);
				document.body.appendChild(selectionBox);
			}

			function removeSelectionElements() {
				if (selectionOverlay) {
					selectionOverlay.remove();
					selectionOverlay = null;
				}
				if (selectionBox) {
					selectionBox.remove();
					selectionBox = null;
				}
			}

			function updateSelectionBox(left: number, top: number, width: number, height: number) {
				if (!selectionBox) return;

				Object.assign(selectionBox.style, {
					display: 'block',
					left: `${left}px`,
					top: `${top}px`,
					width: `${width}px`,
					height: `${height}px`
				});
			}

			function handleMouseDown(e: MouseEvent) {
				if (e.button !== 0) return; // Solo botón izquierdo
				_isSelecting = true;
				startX = e.clientX;
				startY = e.clientY;
				selectionBox.style.display = 'block';
				updateSelectionBox(startX, startY, 0, 0);
			}

			function handleMouseMove(e: MouseEvent) {
				if (!_isSelecting) return;

				endX = e.clientX;
				endY = e.clientY;

				const width = Math.abs(endX - startX);
				const height = Math.abs(endY - startY);
				const left = Math.min(startX, endX);
				const top = Math.min(startY, endY);

				updateSelectionBox(left, top, width, height);
			}

			function handleMouseUp(e: MouseEvent) {
				if (!_isSelecting) return;
				_isSelecting = false;

				const width = Math.abs(endX - startX);
				const height = Math.abs(endY - startY);

				if (width < 10 || height < 10) {
					cleanupCapture();
					return;
				}

				chrome.runtime.sendMessage({
					type: 'takeScreenshot',
					rect: {
						left: Math.min(startX, endX),
						top: Math.min(startY, endY),
						width: width,
						height: height
					},
					dpr: window.devicePixelRatio || 1
				});

				cleanupCapture(); // Limpiar después de enviar la captura
			}

			function initializeCapture() {

				isCaptureModeActive = true;
				createSelectionElements();

				selectionOverlay.addEventListener('mousedown', handleMouseDown);
				document.addEventListener('mousemove', handleMouseMove);
				document.addEventListener('mouseup', handleMouseUp);
			}

			if (message.action === 'startSelecting') {
				isSelecting = true;
				selectedItems.clear()
				selectedTexts.clear()
				document.addEventListener('click', handleClick, true);
			}
			if (message.action === "stopSelecting") {
				sendResponse({ success: true, selectedTexts: Array.from(selectedTexts) });
				selectedItems.forEach(e => e.style.backgroundColor = "")

				document.removeEventListener('click', handleClick, true);
				isSelecting = false
			}
			if (message.action === "checkReady") {
				if (isCaptureModeActive) {
					sendResponse({
						success: false,
						error: "Capture already in progress"
					});
					return true;
				}
				sendResponse({ ready: true });
				return true;
			}
			if (message.action === "startCapture") {

				console.log("[content.js] Iniciando captura");
				try {
					initializeCapture();
					sendResponse({ success: true });
				} catch (error) {
					console.error("[content.js] Error al iniciar captura:", error);
					sendResponse({ success: false, error: (error as any)?.message });
				}
				return true;
			}
			// Nuevo handler para cancelar la captura
			if (message.action === "cancelCapture") {
				cleanupCapture();
				sendResponse({ success: true });
				return true;
			}
			return true
		})
	}
})
