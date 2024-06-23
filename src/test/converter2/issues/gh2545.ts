abstract class Parent {
    /**
     * notAbstract docs
     */
    notAbstract(): string {
        return "hello";
    }
    /**
     * notAbstract2 docs
     */
    notAbstract2(): string {
        return "hello";
    }
    /**
     * isAbstract docs
     */
    abstract isAbstract(): string;
}

export class Child extends Parent {
    override notAbstract2(): string {
        return "foo";
    }
    override isAbstract(): string {
        return "bar";
    }
}
