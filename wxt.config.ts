import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		permissions: ['storage', 'tabs',
			"clipboardWrite",
			"clipboardRead"],
	},
	srcDir: 'src',
	modules: ['@wxt-dev/module-svelte'],
});
