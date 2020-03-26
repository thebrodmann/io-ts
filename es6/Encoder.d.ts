/**
 * @since 3.0.0
 */
import { Contravariant1 } from 'fp-ts/es6/Contravariant';
import * as S from './Schemable';
/**
 * @since 3.0.0
 */
export interface Encoder<A> {
    readonly encode: (a: A) => unknown;
}
/**
 * @since 3.0.0
 */
export declare const id: Encoder<unknown>;
/**
 * @since 3.0.0
 */
export declare function nullable<A>(or: Encoder<A>): Encoder<null | A>;
/**
 * @since 3.0.0
 */
export declare function type<A>(properties: {
    [K in keyof A]: Encoder<A[K]>;
}): Encoder<A>;
/**
 * @since 3.0.0
 */
export declare function partial<A>(properties: {
    [K in keyof A]: Encoder<A[K]>;
}): Encoder<Partial<A>>;
/**
 * @since 3.0.0
 */
export declare function record<A>(codomain: Encoder<A>): Encoder<Record<string, A>>;
/**
 * @since 3.0.0
 */
export declare function array<A>(items: Encoder<A>): Encoder<Array<A>>;
/**
 * @since 3.0.0
 */
export declare function tuple<A extends ReadonlyArray<unknown>>(...components: {
    [K in keyof A]: Encoder<A[K]>;
}): Encoder<A>;
/**
 * @since 3.0.0
 */
export declare function intersection<A, B>(left: Encoder<A>, right: Encoder<B>): Encoder<A & B>;
/**
 * @since 3.0.0
 */
export declare function sum<T extends string>(tag: T): <A>(members: {
    [K in keyof A]: Encoder<A[K] & Record<T, K>>;
}) => Encoder<A[keyof A]>;
/**
 * @since 3.0.0
 */
export declare function lazy<A>(f: () => Encoder<A>): Encoder<A>;
/**
 * @since 3.0.0
 */
export declare const URI = "Encoder";
/**
 * @since 3.0.0
 */
export declare type URI = typeof URI;
declare module 'fp-ts/es6/HKT' {
    interface URItoKind<A> {
        readonly Encoder: Encoder<A>;
    }
}
/**
 * @since 3.0.0
 */
export declare const encoder: Contravariant1<URI> & S.Schemable<URI>;
declare const contramap: <A, B>(f: (b: B) => A) => (fa: Encoder<A>) => Encoder<B>;
export { 
/**
 * @since 3.0.0
 */
contramap };
