<script lang="ts">
	import fetchAPI from "../../lib/fetchAPI";
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

	let texts: { [index: string]: string }[] = $state([]);
	async function recieve() {
		const { selectedText } = await chrome.tabs.sendMessage(await id, {
			action: "stopSelecting",
			id,
		});
		const res = await fetchAPI(selectedText);
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
		<div class="content">
			<ul>
				{#each texts as text}
					<li>{text.message}</li>
				{/each}
			</ul>
		</div>
	</div>
</main>
