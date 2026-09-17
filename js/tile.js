let nextId = 1;

export function createTile(row, col, value) {
    return { id: nextId++, row, col, value };
}
