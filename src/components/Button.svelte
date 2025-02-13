<script lang="ts">
	let { children, onclick, ...rest } = $props();
</script>

<button {...rest} {onclick}>{@render children()}</button>
