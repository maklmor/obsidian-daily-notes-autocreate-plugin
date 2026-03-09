import { Plugin } from "obsidian";
import {
	DEFAULT_SETTINGS,
	DailyNotesSettings,
	DailyNotesSettingTab,
} from "./settings";
import { DailyNotesService } from "./daily-notes-service";

// Daily Notes Auto-Create Plugin

export default class DailyNotesAutoCreatePlugin extends Plugin {
	settings: DailyNotesSettings;
	dailyNotesService: DailyNotesService;

	async onload() {
		await this.loadSettings();
		this.dailyNotesService = new DailyNotesService(this.app);

		// Command: Open next daily note with auto-create
		this.addCommand({
			id: "daily-notes-next-auto",
			name: "Open next daily note (auto-create)",
			callback: async () => {
				await this.dailyNotesService.openNextDailyNoteAuto();
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new DailyNotesSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			(await this.loadData()) as Partial<DailyNotesSettings>,
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
