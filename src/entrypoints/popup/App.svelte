<script lang="ts">
	import { onMount } from "svelte";
	import Button from "../../components/Button.svelte";
	import CopyClipboard from "../../components/CopyClipboard.svelte";
	let id = $state(getTab());

	async function getTab(): Promise<number> {
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});
		const id = tab.id !== undefined ? tab.id : -1;
		return id;
	}
	async function send() {
		const tabId = await id;
		if (!tabId) return;
		await chrome.tabs.sendMessage(tabId, {
			action: "startSelecting",
			id,
		});
	}

	let texts: any = $state([]);
	async function recieve() {
		const tabId = await id;
		if (!tabId) return;
		const { selectedTexts } = await chrome.tabs.sendMessage(tabId, {
			action: "stopSelecting",
			id,
		});
		const res = await fetchAPI(null, selectedTexts);
		texts = res;
	}

	async function capture() {
		try {
			const tabId = await id;
			if (!tabId) return;

			const response = await new Promise((resolve) => {
				chrome.tabs.sendMessage(
					tabId,
					{ action: "checkReady" },
					(response) => {
						if (chrome.runtime.lastError) {
							resolve({ ready: false });
							// return;
						}
						resolve(response || { ready: true });
					},
				);
			});

			// Verificar si hay una captura activa
			console.log("response: ", response);
			if (!response.ready) {
				console.log("[popup.js] Ya hay una captura en progreso");
				// Opcionalmente, puedes cancelar la captura actual
				await new Promise((resolve) => {
					chrome.tabs.sendMessage(
						tabId,
						{ action: "cancelCapture" },
						resolve,
					);
				});
			}

			chrome.tabs.sendMessage(
				tabId,
				{ action: "startCapture" },
				(response) => {
					if (chrome.runtime.lastError) {
						console.error(
							"[popup.js] Error:",
							chrome.runtime.lastError,
						);
						// return;
					}
					console.log("[popup.js] Iniciando captura");
				},
			);
		} catch (error) {
			console.error("[popup.js] Error:", error);
		}
	}
	onMount(async () => {
		// Intentamos recuperar la última captura
		const { lastCapture } = await chrome.storage.local.get("lastCapture");
		if (lastCapture) {
			const img = document.createElement("img");
			img.src = lastCapture;
			document.body.appendChild(img);
			// Limpiamos el storage
			await chrome.storage.local.remove("lastCapture");
		}
	});

</script>

<main>
	<div class="container">
		<h1>Dropprice</h1>
		<Button classes="btn-select-element" onclick={send}
			>Seleccionar Elemento</Button
		>
		<Button classes="btn-stop-select" onclick={recieve}
			>Detener Selección</Button
		>
		<Button classes="btn-stop-select" onclick={capture}>Capturar</Button>

		{#if texts && texts?.messages?.length > 0}
			<div class="btns">
				<CopyClipboard tag={"li"} />
			</div>
		{/if}
		<div class="content">
			<ul>
				{#if texts.error}
					<li><p>{texts.error}</p></li>
				{/if}
				{#each texts.messages as text}
					<li>{text.message}</li>
				{/each}
			</ul>
		</div>
	</div>
</main>
