export default {
    adminLanguage: {
        get get(): number {
            return Number((window.localStorage.getItem("adminLanguage") ?? 1));
        },
        set: (langId: number) => {
            window.localStorage.setItem("adminLanguage", langId.toString());
        }
    },
    adminIsDarkTheme: {
        get get(): boolean {
            return Boolean(JSON.parse(window.localStorage.getItem("adminIsDarkTheme") ?? "false"));
        },
        set: (isDarkTheme: boolean) => {
            window.localStorage.setItem("adminIsDarkTheme", isDarkTheme.toString());
        }
    }
}