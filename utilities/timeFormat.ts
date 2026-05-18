export function toIsoDate(ddmmyyyy: string): string {
    const [dd, mm, yyyy] = ddmmyyyy.split("/");
    return `${yyyy}-${mm}-${dd}`;
}

export function formatDate(isoDate: string): string {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}

export function formatTime(createdAt: string): string {
    const d = new Date(createdAt);

    const vnOffset = 7 * 60 * 60 * 1000;
    const vnDate = new Date(d.getTime() + vnOffset);

    const time = `${String(vnDate.getUTCHours()).padStart(2, "0")}:${String(vnDate.getUTCMinutes()).padStart(2, "0")}`;
    const date = `${String(vnDate.getUTCDate()).padStart(2, "0")}/${String(vnDate.getUTCMonth() + 1).padStart(2, "0")}/${vnDate.getUTCFullYear()}`;

    return `${time} • ${date}`;
}