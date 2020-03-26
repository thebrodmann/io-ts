/**
 * @since 3.0.0
 */
import { drawTree } from 'fp-ts/es6/Tree';
/**
 * @since 3.0.0
 */
export function toString(e) {
    return e.map(drawTree).join('\n');
}
