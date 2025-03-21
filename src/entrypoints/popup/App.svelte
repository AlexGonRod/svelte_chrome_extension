<script lang="ts">
	import { onMount } from "svelte";
	import Button from "../../components/Button.svelte";
	import Loader from "../../components/Loader.svelte";
	import CopyClipboard from "../../components/CopyClipboard.svelte";
	let id = $state(getTab());
	let loading = $state(false);
	const pressBack = document.addEventListener("keydown", (e) => e.key === 'Escape')

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
		
		loading = false
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
		loading = true;
		const res = await fetchAPI(selectedTexts);
		texts = res;
		loading = false
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

			if (!response?.ready || pressBack ) {
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
			loading = true;
			const res = await fetchAPI(lastCapture, "image");
			texts = res;
			loading = false;

			// Limpiamos el storage
			await chrome.storage.local.remove("lastCapture");
		}
	});
</script>

<main>
	<div class="header">
		<div class="logo-container">
			<div class="logo">
				<!-- SVG del logo -->
				<svg
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M4 6H20L18 18H6L4 6Z"
						stroke="white"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M8 20H16"
						stroke="white"
						stroke-width="2"
						stroke-linecap="round"
					/>
				</svg>
			</div>
			<span class="logo-text">Dropprice</span>
		</div>
	</div>

	<div class="main-container">
		<div class="tool-button" id="select-tool">
			<Button onclick={send}>Seleccionar Elemento</Button>
			<div class="tool-shortcut">
				<i>⌘</i>
			</div>
		</div>
		<div class="tool-button" id="stop-tool">
			<Button onclick={recieve}>Detener Selección</Button>
			<div class="tool-shortcut">
				<i>⏹</i>
			</div>
		</div>
		<div class="tool-button" id="capture-tool">
			<Button onclick={capture}>Capturar</Button>
			<div class="tool-shortcut">
				<i>+</i>
			</div>
		</div>

		{#if texts && texts?.messages?.length > 0 && !loading}
			<div class="tool-button" id="copy-tool">
				<CopyClipboard tag={"li"} />
				<div class="tool-shortcut">
					<i>+</i>
				</div>
			</div>
		{/if}
		<div class="content">
			{#if loading}
				<Loader />
			{:else}
				<ul>
					{#if texts.error}
						<li><p>{texts.error}</p></li>
					{/if}
					{#each texts.messages as text}
						<li>{text.message}</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</main>
