import { App, PluginSettingTab, Setting, TFolder, Vault } from "obsidian";
import EpubPlugin from "./EpubPlugin";
import { HIGHLIGHT_COLORS } from "./highlightTypes";

export interface EpubPluginSettings {
	scrolledView: boolean;
	notePath: string;
	useSameFolder: boolean;
	tags: string;
	defaultHighlightColor: string;
	autoSaveHighlights: boolean;
	showHighlightToolbar: boolean;
}

export const DEFAULT_SETTINGS: EpubPluginSettings = {
	scrolledView: false,
	notePath: '/',
	useSameFolder: true,
	tags: 'notes/booknotes',
	defaultHighlightColor: HIGHLIGHT_COLORS.YELLOW,
	autoSaveHighlights: true,
	showHighlightToolbar: true
}

export class EpubSettingTab extends PluginSettingTab {
	plugin: EpubPlugin;

	constructor(app: App, plugin: EpubPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'EPUB Settings' });

		new Setting(containerEl)
			.setName("Scrolled View")
			.setDesc("This enables seamless scrolling between pages.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.scrolledView)
				.onChange(async (value) => {
					this.plugin.settings.scrolledView = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Same Folder")
			.setDesc("When toggle on, the epub note file will be created in the same folder.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.useSameFolder)
				.onChange(async (value) => {
					this.plugin.settings.useSameFolder = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Note Folder")
			.setDesc("Choose the default epub note folder. When the Same Folder toggled on, this setting is ineffective.")
			.addDropdown(dropdown => dropdown
				.addOptions(getFolderOptions(this.app))
				.setValue(this.plugin.settings.notePath)
				.onChange(async (value) => {
					this.plugin.settings.notePath = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Tags")
			.setDesc("Tags added to new note metadata.")
			.addText(text => {
				text.inputEl.size = 50;
				text
					.setValue(this.plugin.settings.tags)
					.onChange(async (value) => {
						this.plugin.settings.tags = value;
						await this.plugin.saveSettings();
					})
			});

		containerEl.createEl('h3', { text: 'Highlight Settings' });

		new Setting(containerEl)
			.setName("Highlight Color")
			.setDesc("Yellow highlight color is used for all highlights.")
			.addText(text => {
				text.setValue("Yellow")
					.setDisabled(true)
					.inputEl.style.textAlign = 'center';
			});

		new Setting(containerEl)
			.setName("Auto Save Highlights")
			.setDesc("Automatically save highlights when created.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoSaveHighlights)
				.onChange(async (value) => {
					this.plugin.settings.autoSaveHighlights = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName("Show Highlight Toolbar")
			.setDesc("Show highlight toolbar when text is selected.")
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showHighlightToolbar)
				.onChange(async (value) => {
					this.plugin.settings.showHighlightToolbar = value;
					await this.plugin.saveSettings();
				}));
	}
}

function getFolderOptions(app: App) {
	const options: Record<string, string> = {};

	Vault.recurseChildren(app.vault.getRoot(), (f) => {
		if (f instanceof TFolder) {
			options[f.path] = f.path;
		}
	});

	return options;
}