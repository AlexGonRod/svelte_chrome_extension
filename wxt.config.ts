import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		permissions: ['storage', 'tabs', "scripting", "activeTab", "downloads",
			"clipboardWrite",
			"clipboardRead"],
		web_accessible_resources: [
			{
				resources: ["html2canvas.min.js"],
				matches: ["*://*/*"],
			}
		],
	},
	srcDir: 'src',
	modules: ['@wxt-dev/module-svelte'],
});
