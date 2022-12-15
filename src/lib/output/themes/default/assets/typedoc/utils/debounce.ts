export const debounce = (fn: () => void, wait: number = 100) => {
    let timeout: ReturnType<typeof setTimeout>;
    return () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(), wait);
    };
};
