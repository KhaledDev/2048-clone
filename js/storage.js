const BEST_SCORE_KEY = '2048-best-score';

export function getBestScore() {
    const raw = localStorage.getItem(BEST_SCORE_KEY);
    return raw ? Number(raw) : 0;
}

export function setBestScore(score) {
    localStorage.setItem(BEST_SCORE_KEY, String(score));
}

export function updateBestScore(score) {
    const best = getBestScore();
    if (score > best) {
        setBestScore(score);
        return score;
    }
    return best;
}
