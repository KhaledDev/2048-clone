import { ParticleSystem } from './particles.js';

const SLIDE_DURATION_MS = 120;

const STATUS_LABELS = {
    playing: '',
    won: 'You win!',
    over: 'Game over',
};

export class Renderer {
    constructor({ boardEl, scoreEl, bestEl, statusEl, size }) {
        this.boardEl = boardEl;
        this.scoreEl = scoreEl;
        this.bestEl = bestEl;
        this.statusEl = statusEl;
        this.size = size;
        this.tileEls = new Map();

        this.boardEl.style.setProperty('--size', size);
        this._buildBackgroundCells();

        this.particleCanvas = document.createElement('canvas');
        this.particleCanvas.className = 'particle-layer';
        this.boardEl.appendChild(this.particleCanvas);
        this.particles = new ParticleSystem(this.particleCanvas);
        this.particles.resize(this.boardEl.clientWidth, this.boardEl.clientHeight);
    }

    _buildBackgroundCells() {
        this.boardEl.querySelectorAll('.cell').forEach((el) => el.remove());
        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            this.boardEl.appendChild(cell);
        }
    }

    renderState(state, { best } = {}) {
        this.boardEl.querySelectorAll('.tile').forEach((el) => el.remove());
        this.tileEls.clear();

        for (const tile of state.tiles) {
            const el = this._createTileEl(tile);
            this.boardEl.appendChild(el);
            this.tileEls.set(tile.id, el);
        }

        this._renderMeta(state, best);
    }

    renderMove(moveResult, { best } = {}) {
        const { survivors, merges, tiles, newTileId } = moveResult;

        for (const tile of survivors) {
            this._setPosition(this.tileEls.get(tile.id), tile);
        }

        for (const merge of merges) {
            for (const target of merge.removedTargets) {
                this._setPosition(this.tileEls.get(target.id), target);
            }
        }

        window.setTimeout(() => {
            for (const merge of merges) {
                for (const id of merge.removedIds) {
                    this.tileEls.get(id)?.remove();
                    this.tileEls.delete(id);
                }
                const el = this._createTileEl(merge.mergedTile, 'merged');
                this.boardEl.appendChild(el);
                this.tileEls.set(merge.mergedTile.id, el);

                const color = getComputedStyle(el).backgroundColor;
                const { x, y } = this._cellCenterPx(merge.mergedTile.row, merge.mergedTile.col);
                this.particles.burst(x, y, color);
            }

            const spawned = newTileId && tiles.find((t) => t.id === newTileId);
            if (spawned) {
                const el = this._createTileEl(spawned, 'spawn');
                this.boardEl.appendChild(el);
                this.tileEls.set(spawned.id, el);
            }

            this._renderMeta(moveResult, best);
        }, SLIDE_DURATION_MS);
    }

    _cellCenterPx(row, col) {
        const styles = getComputedStyle(this.boardEl);
        const gap = parseFloat(styles.getPropertyValue('--gap'));
        const tileSize = parseFloat(styles.getPropertyValue('--tile-size'));
        return {
            x: gap + col * (tileSize + gap) + tileSize / 2,
            y: gap + row * (tileSize + gap) + tileSize / 2,
        };
    }

    _setPosition(el, tile) {
        if (!el) return;
        el.style.setProperty('--row', tile.row);
        el.style.setProperty('--col', tile.col);
    }

    _createTileEl(tile, animation) {
        const el = document.createElement('div');
        el.className = `tile tile-${tile.value > 2048 ? 'super' : tile.value}`;
        if (animation) el.classList.add(animation);
        el.textContent = tile.value;
        this._setPosition(el, tile);
        return el;
    }

    _renderMeta(state, best) {
        this.scoreEl.textContent = state.score;
        if (this.bestEl && best !== undefined) this.bestEl.textContent = best;
        this.statusEl.textContent = STATUS_LABELS[state.status] ?? '';
        this.boardEl.classList.toggle('game-over', state.status === 'over');
    }
}
