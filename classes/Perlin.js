import { int, randomInt } from '../utils/math.js';
import { Vector, vec3, randVec3 } from '../utils/vector.js';

const { scale, dot, normalize } = Vector;


export default class Perlin {
    #pointCount = 256;
    #randVec;
    #permX;
    #permY;
    #permZ;

    constructor() {
        this.#randVec = Array.from({ length: this.#pointCount }, () => {
            return normalize(randVec3(-1, 1));
        });
        this.#permX = this.#perlinGeneratePerm();
        this.#permY = this.#perlinGeneratePerm();
        this.#permZ = this.#perlinGeneratePerm();
    }

    noise(p) {
        let u = p.x - Math.floor(p.x);
        let v = p.y - Math.floor(p.y);
        let w = p.z - Math.floor(p.z);

        const i = int(Math.floor(p.x));
        const j = int(Math.floor(p.y));
        const k = int(Math.floor(p.z));
        const c = [[[], [], []], [[], [], []], [[], [], []]];

        for (let di = 0; di < 2; di++)
            for (let dj = 0; dj < 2; dj++)
                for (let dk = 0; dk < 2; dk++)
                    c[di][dj][dk] = this.#randVec[
                        this.#permX[(i + di) & 255] ^
                        this.#permY[(j + dj) & 255] ^
                        this.#permZ[(k + dk) & 255]
                    ];

        return this.#perlinInterp(c, u, v, w);
    }

    turb(p, depth) {
        let tempP = p;
        let weight = 1;
        let accum = 0;

        for (let i = 0; i < depth; i++) {
            accum += weight * this.noise(tempP);
            weight *= 0.5;
            tempP = scale(tempP, 2);
        }

        return Math.abs(accum);
    }

    #perlinInterp(c, u, v, w) {
        const uu = u * u * (3 - 2 * u);
        const vv = v * v * (3 - 2 * v);
        const ww = w * w * (3 - 2 * w);
        let accum = 0;

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                for (let k = 0; k < 2; k++) {
                    const weightV = vec3(u - i, v - j, w - k);
                    accum += (i * uu + (1 - i) * (1 - uu))
                        * (j * vv + (1 - j) * (1 - vv))
                        * (k * ww + (1 - k) * (1 - ww))
                        * dot(c[i][j][k], weightV);
                }
            }
        }
        return accum;
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