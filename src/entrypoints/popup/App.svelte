<script lang="ts">
	import { fetchAPI } from "../../lib/fetchAPI";
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
		const result = await chrome.tabs.sendMessage(await id, {
			action: "startSelecting",
			id,
		});
	}

	let texts: any = $state([]);
	async function recieve() {
		const { selectedTexts } = await chrome.tabs.sendMessage(await id, {
			action: "stopSelecting",
			id,
		});
		const res = await fetchAPI(selectedTexts);
		texts = res;
	}
</script>

<main>
	<div class="container">
		<h1>Dropprice</h1>
		<button class="btn-select-element" onclick={send}
			>Seleccionar Elemento</button
		>
		<button class="btn-stop-select" onclick={recieve}
			>Detener Selección</button
		>

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
