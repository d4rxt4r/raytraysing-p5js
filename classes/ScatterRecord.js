import { Vector } from '../utils/vector.js';
import PDF from './PDF.js';
import Ray from './Ray.js';

export default class ScatterRecord {
   /**
    * @type {Vector}
    */
   attenuation;
   /**
    * @type {PDF}
    */
   pdf;
   /**
    * @type {boolean}
    */
   skipPDF;
   /**
    * @type {Ray}
    */
   skipPDFRay;
}
