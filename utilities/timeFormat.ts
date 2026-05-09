export function toIsoDate(ddmmyyyy: string): string {
    const [dd, mm, yyyy] = ddmmyyyy.split("/");
    return `${yyyy}-${mm}-${dd}`;
}

export function formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}

export function formatTime(createdAt: string) {
    const d = new Date(createdAt);
    d.setHours(d.getHours() + 7);
    const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    const date = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    return `${time} • ${date}`;
}