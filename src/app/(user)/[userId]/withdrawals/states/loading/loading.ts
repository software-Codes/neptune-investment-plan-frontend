export class LoadingStateManager {
    private static states = new Map<string, boolean>();

    static setLoading(key: string, loading: boolean): void {
        this.states.set(key, loading)
    }

    static isLoading(key: string): boolean {
        return this.states.get(key) || false;
    }

    static getGlobalLoading(): boolean {
        return Array.from(this.states.values()).some(loading => loading)
    }

}