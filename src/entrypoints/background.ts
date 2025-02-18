export default defineBackground(() => {
	chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
		if (request.type === 'takeScreenshot') {
			console.log("[background.js] Iniciando captura de pantalla");

			// Guardamos el tabId del sender
			const sourceTabId = sender.tab?.id;
			const lastImageExist = await chrome.storage.local.get("lastCapture");
			if (lastImageExist) await chrome.storage.local.set({})

			chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl) => {
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
						const reader = new FileReader();
						reader.onloadend = () => {
							// Intentamos enviar al popup
							chrome.runtime.sendMessage({
								type: 'captureComplete',
								imageData: reader.result
							}).catch(() => {
								// Si falla, guardamos en storage y/o notificamos al tab
								if (sourceTabId) {
									chrome.storage.local.set({
										lastCapture: reader.result
									});

									chrome.tabs.sendMessage(sourceTabId, {
										type: 'captureComplete',
										imageData: reader.result
									}).catch(console.error);
								}
							});
						};
						reader.readAsDataURL(blob);
					})
					.catch(error => {
						console.error("[background.js] Error procesando la imagen:", error);
					});
			});

			return true;
		}
	});
});