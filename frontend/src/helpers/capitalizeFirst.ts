export function capitalizeFirst(v: string) {
    const t = v.charAt(0).toUpperCase() + v.slice(1);
    return t; 
}