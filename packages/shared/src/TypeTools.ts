export namespace TypeTools {
  // Courtesy of https://stackoverflow.com/questions/46376468/how-to-get-type-of-array-type-values
  export type ArrayElementType<TArray extends any[]> = TArray extends (infer TElement)[]
    ? TElement
    : never;

  // Courtesy of https://stackoverflow.com/questions/45894524/getting-type-of-a-property-of-a-typescript-class-using-keyof-operator
  export type PropType<TObject, TProperty extends keyof TObject> = TObject[TProperty];
}
