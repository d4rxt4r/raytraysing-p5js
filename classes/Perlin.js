import { int, randomInt } from '../utils/math.js';

export default class Perlin {
    #pointCount = 256;
    #randFloats;
    #permX;
    #permY;
    #permZ;

    constructor() {
        this.#randFloats = Array.from({ length: this.#pointCount }, () => Math.random());;
        this.#permX = this.#perlinGeneratePerm();
        this.#permY = this.#perlinGeneratePerm();
        this.#permZ = this.#perlinGeneratePerm();
    }

    noise(p) {
        const i = int(4 * p.x) & 255;
        const j = int(4 * p.y) & 255;
        const k = int(4 * p.z) & 255;

        return this.#randFloats[this.#permX[i] ^ this.#permY[j] ^ this.#permZ[k]];
    }

    #permute(p, n) {
        for (let i = n - 1; i > 0; i--) {
            const target = randomInt(0, i);
            const tmp = p[i];
            p[i] = p[target];
            p[target] = tmp;
        }
    }

    #perlinGeneratePerm() {
        const p = [...Array(this.#pointCount).keys()];
        this.#permute(p, this.#pointCount);
        return p;
    }
}