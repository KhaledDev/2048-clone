import { createTile } from './tile.js';

export function tilesToValueGrid(tiles, size) {
    const grid = Array.from({ length: size }, () => Array(size).fill(0));
    for (const tile of tiles) grid[tile.row][tile.col] = tile.value;
    return grid;
}

function getEmptyCells(tiles, size) {
    const occupied = new Set(tiles.map((t) => `${t.row},${t.col}`));
    const cells = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (!occupied.has(`${r},${c}`)) cells.push({ row: r, col: c });
        }
    }
    return cells;
}

export function addRandomTile(tiles, size) {
    const empty = getEmptyCells(tiles, size);
    if (empty.length === 0) return tiles;

    const { row, col } = empty[Math.floor(Math.random() * empty.length)];
    const value = Math.random() < 0.9 ? 2 : 4;
    return [...tiles, createTile(row, col, value)];
}

function buildTraversalLines(direction, size) {
    const horizontal = direction === 'left' || direction === 'right';
    const reversed = direction === 'right' || direction === 'down';

    const lines = [];
    for (let i = 0; i < size; i++) {
        const line = [];
        for (let j = 0; j < size; j++) {
            line.push(horizontal ? { row: i, col: j } : { row: j, col: i });
        }
        if (reversed) line.reverse();
        lines.push(line);
    }
    return lines;
}

export function move(tiles, direction, size) {
    const lines = buildTraversalLines(direction, size);
    const tileAt = new Map(tiles.map((t) => [`${t.row},${t.col}`, t]));

    const survivors = [];
    const merges = [];
    let score = 0;
    let moved = false;

    for (const line of lines) {
        const lineTiles = line.map((pos) => tileAt.get(`${pos.row},${pos.col}`)).filter(Boolean);

        let slot = 0;
        let i = 0;
        while (i < lineTiles.length) {
            const current = lineTiles[i];
            const next = lineTiles[i + 1];
            const target = line[slot];

            if (next && next.value === current.value) {
                const mergedTile = createTile(target.row, target.col, current.value * 2);
                score += mergedTile.value;
                merges.push({
                    removedIds: [current.id, next.id],
                    removedTargets: [
                        { id: current.id, row: target.row, col: target.col },
                        { id: next.id, row: target.row, col: target.col },
                    ],
                    mergedTile,
                });
                moved = true;
                i += 2;
            } else {
                if (current.row !== target.row || current.col !== target.col) moved = true;
                survivors.push({ ...current, row: target.row, col: target.col });
                i += 1;
            }
            slot++;
        }
    }

    const nextTiles = [...survivors, ...merges.map((m) => m.mergedTile)];
    return { tiles: nextTiles, survivors, merges, score, moved };
}

export function hasWon(tiles, target = 2048) {
    return tiles.some((t) => t.value >= target);
}

export function isGameOver(tiles, size) {
    if (tiles.length < size * size) return false;

    const grid = tilesToValueGrid(tiles, size);
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const value = grid[r][c];
            const right = grid[r][c + 1];
            const down = grid[r + 1] ? grid[r + 1][c] : undefined;
            if (value === right || value === down) return false;
        }
    }
    return true;
}
