export default defineBackground(() => {

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.type === 'takeScreenshot') {
			console.log("[background.js] Iniciando captura de pantalla");

			chrome.tabs.captureVisibleTab(null, { format: 'png' }, (dataUrl) => {
				if (chrome.runtime.lastError) {
					console.error("[background.js] Error:", chrome.runtime.lastError);
					return;
				}

				fetch(dataUrl)
					.then(res => res.blob())
					.then(blob => createImageBitmap(blob))
					.then(bitmap => {
						const dpr = request.dpr || 1;
						const canvas = new OffscreenCanvas(
							request.rect.width * dpr,
							request.rect.height * dpr
						);
						const ctx = canvas.getContext('2d');

						ctx.drawImage(
							bitmap,
							request.rect.left * dpr,
							request.rect.top * dpr,
							request.rect.width * dpr,
							request.rect.height * dpr,
							0,
							0,
							request.rect.width * dpr,
							request.rect.height * dpr
						);

						return canvas.convertToBlob();
					})
					.then(blob => {
						// Convertir blob a data URL
						const reader = new FileReader();
						reader.onloadend = () => {
							chrome.runtime.sendMessage({
								type: 'captureComplete',
								imageData: reader.result
							});
						};
						reader.readAsDataURL(blob);
					})
					.catch(error => {
						console.error("[background.js] Error procesando la imagen:", error);
					});
			});

			return true; // Importante para mantener la conexión abierta
		}
	});

})
