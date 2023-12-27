export type BaseUnionMember = {
    type: string;
};

export type Union =
    | {
          type: "one";
      }
    | {
          type: "two";
      };

export class GenericClass<U extends BaseUnionMember> {
    public arrowFunction = <MemberType extends U["type"]>(
        member: Extract<U, { type: MemberType }>,
    ) => {};

    public classFunction<MemberType extends U["type"]>(
        member: Extract<U, { type: MemberType }>,
    ) {}
}

export class ResolvedSubclass extends GenericClass<Union> {}
