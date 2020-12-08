export function cloneHelper<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}
