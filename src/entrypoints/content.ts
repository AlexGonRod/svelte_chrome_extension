export default defineContentScript({
	matches: ['<all_urls>'],
	main() {
		let isSelecting = false;
		let selectedItems = new Set<HTMLElement>()
		let selectedTexts = new Set<string>()
		chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
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
			return true
		});

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
	}
});
