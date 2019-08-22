export namespace TypeTools {
  // Courtesy of https://stackoverflow.com/questions/46376468/how-to-get-type-of-array-type-values
  export type ArrayElementType<T extends Array<any>> = T extends (infer U)[] ? U : never;

  // Courtesy of https://stackoverflow.com/questions/45894524/getting-type-of-a-property-of-a-typescript-class-using-keyof-operator
  export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];
}
