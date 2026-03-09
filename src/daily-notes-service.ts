import { App, MarkdownView, TFile, Notice } from "obsidian";

export class DailyNotesService {
	private app: App;
	private dailyNotesFolder = "DailyNotes";
	private templatePath = "Templates/Template >> Daily note.md";

	constructor(app: App) {
		this.app = app;
	}

	/**
	 * Extract date from filename with format YYYY-MM-DD-ddd
	 */
	private parseFilename(filename: string): Date | null {
		// Match pattern like "2026-03-09-Mon.md"
		const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})/);
		if (!match) return null;

		const year = parseInt(match[1]!);
		const month = parseInt(match[2]!);
		const day = parseInt(match[3]!);
		return new Date(year, month - 1, day);
	}

	/**
	 * Format date to filename with YYYY-MM-DD-ddd format
	 */
	private formatDateToFilename(date: Date): string {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		const dayName = daysOfWeek[date.getDay()];

		return `${year}-${month}-${day}-${dayName}`;
	}

	/**
	 * Get the current daily note date from the active view
	 */
	getCurrentDailyNoteDate(): Date | null {
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (!activeView?.file) return null;

		return this.parseFilename(activeView.file.name);
	}

	/**
	 * Get the date for the next day
	 */
	getNextDayDate(fromDate: Date): Date {
		const nextDate = new Date(fromDate);
		nextDate.setDate(nextDate.getDate() + 1);
		return nextDate;
	}

	/**
	 * Build the full path for a daily note
	 */
	private buildDailyNotePath(date: Date): string {
		const filename = this.formatDateToFilename(date);
		return `${this.dailyNotesFolder}/${filename}.md`;
	}

	/**
	 * Check if a daily note exists
	 */
	private dailyNoteExists(date: Date): boolean {
		const path = this.buildDailyNotePath(date);
		return this.app.vault.getAbstractFileByPath(path) !== null;
	}

	/**
	 * Load template content
	 */
	private async getTemplateContent(): Promise<string> {
		const templateFile = this.app.vault.getAbstractFileByPath(
			this.templatePath,
		);

		if (!templateFile || !(templateFile instanceof TFile)) {
			return "";
		}

		return await this.app.vault.read(templateFile);
	}

	/**
	 * Create a new daily note with template
	 */
	private async createDailyNote(date: Date): Promise<TFile> {
		const path = this.buildDailyNotePath(date);
		const templateContent = await this.getTemplateContent();

		return await this.app.vault.create(path, templateContent);
	}

	/**
	 * Open a daily note file in the workspace
	 */
	private async openDailyNote(path: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(path);
		if (file instanceof TFile) {
			await this.app.workspace.getLeaf().openFile(file);
		}
	}

	/**
	 * Main function: Open next daily note, creating it if it doesn't exist
	 */
	async openNextDailyNoteAuto(): Promise<void> {
		const currentDate = this.getCurrentDailyNoteDate();

		if (!currentDate) {
			new Notice("Not currently viewing a daily note");
			return;
		}

		const nextDate = this.getNextDayDate(currentDate);
		const nextPath = this.buildDailyNotePath(nextDate);

		// Create the note if it doesn't exist
		if (!this.dailyNoteExists(nextDate)) {
			try {
				await this.createDailyNote(nextDate);
			} catch (error) {
				let errorMessage = "Unknown error";
				if (error instanceof Error) {
					errorMessage = error.message;
				}
				new Notice(`Failed to create daily note: ${errorMessage}`);
				return;
			}
		}

		// Open the daily note
		try {
			await this.openDailyNote(nextPath);
		} catch (error) {
			let errorMessage = "Unknown error";
			if (error instanceof Error) {
				errorMessage = error.message;
			}
			new Notice(`Failed to open daily note: ${errorMessage}`);
		}
	}
}
