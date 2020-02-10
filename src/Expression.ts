/**
 * @since 3.0.0
 */
import * as C from 'fp-ts/lib/Const'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'
import * as ts from 'typescript'
import { Literal, fold } from './Literal'
import * as S from './Schemable'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export interface Expression<A> {
  readonly expression: () => C.Const<ts.Expression, A>
}

// -------------------------------------------------------------------------------------
// constructors
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export function $ref(id: string): Expression<unknown> {
  return {
    expression: () => C.make(ts.createCall(ts.createIdentifier(id), undefined, [schemable]))
  }
}

const toLiteralExpression = fold<ts.Expression>(
  s => ts.createStringLiteral(s),
  n => ts.createNumericLiteral(String(n)),
  b => ts.createLiteral(b),
  () => ts.createNull()
)

function toLiteralsExpression(values: Array<Literal>): ts.Expression {
  return ts.createArrayLiteral(values.map(toLiteralExpression))
}

const schemable = ts.createIdentifier('S')

/**
 * @since 3.0.0
 */
export function literal<A extends Literal>(value: A): Expression<A> {
  return {
    expression: () =>
      C.make(ts.createCall(ts.createPropertyAccess(schemable, 'literal'), undefined, [toLiteralExpression(value)]))
  }
}

/**
 * @since 3.0.0
 */
export function literals<A extends Literal>(values: NonEmptyArray<A>): Expression<A> {
  return {
    expression: () =>
      C.make(ts.createCall(ts.createPropertyAccess(schemable, 'literals'), undefined, [toLiteralsExpression(values)]))
  }
}

/**
 * @since 3.0.0
 */
export function literalsOr<A extends Literal, B>(
  values: NonEmptyArray<A>,
  expression: Expression<B>
): Expression<A | B> {
  return {
    expression: () =>
      C.make(
        ts.createCall(ts.createPropertyAccess(schemable, 'literalsOr'), undefined, [
          toLiteralsExpression(values),
          expression.expression()
        ])
      )
  }
}

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const string: Expression<string> = {
  expression: () => C.make(ts.createPropertyAccess(schemable, 'string'))
}

/**
 * @since 3.0.0
 */
export const number: Expression<number> = {
  expression: () => C.make(ts.createPropertyAccess(schemable, 'number'))
}

/**
 * @since 3.0.0
 */
export const boolean: Expression<boolean> = {
  expression: () => C.make(ts.createPropertyAccess(schemable, 'boolean'))
}

/**
 * @since 3.0.0
 */
export const UnknownArray: Expression<Array<unknown>> = {
  expression: () => C.make(ts.createPropertyAccess(schemable, 'UnknownArray'))
}

/**
 * @since 3.0.0
 */
export const UnknownRecord: Expression<Record<string, unknown>> = {
  expression: () => C.make(ts.createPropertyAccess(schemable, 'UnknownRecord'))
}

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export function type<A>(properties: { [K in keyof A]: Expression<A[K]> }): Expression<A> {
  const expressions: Record<string, Expression<unknown>> = properties
  return {
    expression: () =>
      C.make(
        ts.createCall(ts.createPropertyAccess(schemable, 'type'), undefined, [
          ts.createObjectLiteral(
            Object.keys(expressions).map(k => ts.createPropertyAssignment(k, expressions[k].expression()))
          )
        ])
      )
  }
}

/**
 * @since 3.0.0
 */
export function partial<A>(properties: { [K in keyof A]: Expression<A[K]> }): Expression<Partial<A>> {
  const expressions: Record<string, Expression<unknown>> = properties
  return {
    expression: () =>
      C.make(
        ts.createCall(ts.createPropertyAccess(schemable, 'partial'), undefined, [
          ts.createObjectLiteral(
            Object.keys(expressions).map(k => ts.createPropertyAssignment(k, expressions[k].expression()))
          )
        ])
      )
  }
}

/**
 * @since 3.0.0
 */
export function record<A>(codomain: Expression<A>): Expression<Record<string, A>> {
  return {
    expression: () =>
      C.make(ts.createCall(ts.createPropertyAccess(schemable, 'record'), undefined, [codomain.expression()]))
  }
}

/**
 * @since 3.0.0
 */
export function array<A>(items: Expression<A>): Expression<Array<A>> {
  return {
    expression: () =>
      C.make(ts.createCall(ts.createPropertyAccess(schemable, 'array'), undefined, [items.expression()]))
  }
}

/**
 * @since 3.0.0
 */
export function tuple2<A, B>(itemA: Expression<A>, itemB: Expression<B>): Expression<[A, B]> {
  return {
    expression: () =>
      C.make(
        ts.createCall(ts.createPropertyAccess(schemable, 'tuple2'), undefined, [itemA.expression(), itemB.expression()])
      )
  }
}

/**
 * @since 3.0.0
 */
export function tuple3<A, B, C>(
  itemA: Expression<A>,
  itemB: Expression<B>,
  itemC: Expression<C>
): Expression<[A, B, C]> {
  return {
    expression: () =>
      C.make(
        ts.createCall(ts.createPropertyAccess(schemable, 'tuple3'), undefined, [
          itemA.expression(),
          itemB.expression(),
          itemC.expression()
        ])
      )
  }
}

/**
 * @since 3.0.0
 */
export function intersection<A, B>(expressionA: Expression<A>, expressionB: Expression<B>): Expression<A & B> {
  return {
    expression: () =>
      C.make(
        ts.createCall(ts.createPropertyAccess(schemable, 'intersection'), undefined, [
          expressionA.expression(),
          expressionB.expression()
        ])
      )
  }
}

/**
 * @since 3.0.0
 */
export function sum<T extends string>(
  tag: T
): <A>(members: { [K in keyof A]: Expression<A[K] & Record<T, K>> }) => Expression<A[keyof A]> {
  return (members: Record<string, Expression<unknown>>) => {
    return {
      expression: () =>
        C.make(
          ts.createCall(
            ts.createCall(ts.createPropertyAccess(schemable, 'sum'), undefined, [ts.createStringLiteral(tag)]),
            undefined,
            [
              ts.createObjectLiteral(
                Object.keys(members).map(k => ts.createPropertyAssignment(k, members[k].expression()))
              )
            ]
          )
        )
    }
  }
}

/**
 * @since 3.0.0
 */
export function lazy<A>(id: string, f: () => Expression<A>): Expression<A> {
  let $ref: string
  return {
    expression: () => {
      if (!$ref) {
        $ref = id
        return C.make(
          ts.createCall(ts.createPropertyAccess(schemable, 'lazy'), undefined, [
            ts.createArrowFunction(undefined, undefined, [], undefined, undefined, f().expression())
          ])
        )
      }
      return C.make(ts.createCall(ts.createIdentifier(id), undefined, [schemable]))
    }
  }
}

/**
 * @since 3.0.0
 */
export function union<A extends [unknown, ...Array<unknown>]>(
  members: { [K in keyof A]: Expression<A[K]> }
): Expression<A[number]> {
  return {
    expression: () =>
      C.make(
        ts.createCall(ts.createPropertyAccess(schemable, 'union'), undefined, [
          ts.createArrayLiteral(members.map(member => member.expression()))
        ])
      )
  }
}

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * @since 3.0.0
 */
export const URI = 'Expression'

/**
 * @since 3.0.0
 */
export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly Expression: Expression<A>
  }
}

/**
 * @since 3.0.0
 */
export const expression: S.Schemable<URI> & S.WithUnion<URI> = {
  URI,
  literal,
  literals,
  literalsOr,
  string,
  number,
  boolean,
  UnknownArray,
  UnknownRecord,
  type,
  partial,
  record,
  array,
  tuple2,
  tuple3,
  intersection,
  sum,
  lazy,
  union
}
