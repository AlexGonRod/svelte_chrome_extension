<script lang="ts">
	let { children, onclick, ...rest } = $props();
</script>

<button {...rest} {onclick}>{@render children()}</button>

<style>
	button {
		height: 100%;
		cursor: pointer;
		background-color: inherit; 
		border: none;
		color: #111827;
		text-align: left;
		text-decoration: none;
		flex-grow: 1;;
		font-size: 15px;
	}
</style>
