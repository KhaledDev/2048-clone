import { move, addRandomTile, hasWon, isGameOver } from './grid.js';

export const STATUS = {
    PLAYING: 'playing',
    WON: 'won',
    OVER: 'over',
};

export class Game {
    constructor(size = 4) {
        this.size = size;
        this.reset();
    }

    reset() {
        this.tiles = [];
        this.tiles = addRandomTile(this.tiles, this.size);
        this.tiles = addRandomTile(this.tiles, this.size);
        this.score = 0;
        this.status = STATUS.PLAYING;
        return this.getState();
    }

    move(direction) {
        if (this.status !== STATUS.PLAYING) return { ...this.getState(), moved: false };

        const result = move(this.tiles, direction, this.size);
        if (!result.moved) return { ...this.getState(), moved: false };

        const beforeSpawn = result.tiles;
        const afterSpawn = addRandomTile(beforeSpawn, this.size);
        const newTileId = afterSpawn.length > beforeSpawn.length ? afterSpawn[afterSpawn.length - 1].id : null;

        this.tiles = afterSpawn;
        this.score += result.score;

        if (hasWon(this.tiles)) {
            this.status = STATUS.WON;
        } else if (isGameOver(this.tiles, this.size)) {
            this.status = STATUS.OVER;
        }

        return {
            ...this.getState(),
            moved: true,
            scoreGained: result.score,
            survivors: result.survivors,
            merges: result.merges,
            newTileId,
        };
    }

    getState() {
        return {
            tiles: this.tiles,
            score: this.score,
            status: this.status,
            size: this.size,
        };
    }
}
