import { useEffect, useState } from "react";

export function useDebounce<T extends string>(value: T, delay: number = 2000) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler: NodeJS.Timeout = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);


        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;

}