import { App, PluginSettingTab, Setting } from "obsidian";
import DailyNotesAutoCreatePlugin from "./main";

export interface DailyNotesSettings {
	mySetting: string;
}

export const DEFAULT_SETTINGS: DailyNotesSettings = {
	mySetting: "default",
};

export class DailyNotesSettingTab extends PluginSettingTab {
	plugin: DailyNotesAutoCreatePlugin;

	constructor(app: App, plugin: DailyNotesAutoCreatePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Settings #1")
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder("Enter your secret")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.saveSettings();
					}),
			);
	}
}
