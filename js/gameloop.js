import { Game } from './game.js';
import { Renderer } from './renderer.js';
import { bindInput } from './input.js';
import { getBestScore, updateBestScore } from './storage.js';

function main() {
    const game = new Game(4);
    const renderer = new Renderer({
        boardEl: document.getElementById('board'),
        scoreEl: document.getElementById('score'),
        bestEl: document.getElementById('best-score'),
        statusEl: document.getElementById('status'),
        size: 4,
    });

    let best = getBestScore();
    renderer.renderState(game.getState(), { best });

    bindInput((direction) => {
        const result = game.move(direction);
        if (result.moved === false) return;

        best = updateBestScore(result.score);
        renderer.renderMove(result, { best });
    });

    document.getElementById('new-game').addEventListener('click', () => {
        const state = game.reset();
        renderer.renderState(state, { best });
    });
}

main();
