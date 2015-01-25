/**
 * A class with protected members.
 */
class ClassWithProtectedMembers
{
    /**
     * A public property.
     */
    public publicProperty:string;

    /**
     * A protected property.
     */
    protected protectedProperty:string;

    /**
     * A private property.
     */
    private privateProperty:[boolean,string,string];

    /**
     * A public property.
     */
    public publicMethod() {}

    /**
     * A protected property.
     */
    protected protectedMethod() {}

    /**
     * A private property.
     */
    private privateMethod() {}
}


/**
 * A subclass with inherited protected members.
 */
class SubclassWithProtectedMembers extends ClassWithProtectedMembers {

}


/**
 * A variable with a tuple type.
 */
var tupleType:[string,ClassWithProtectedMembers] = ['test', new ClassWithProtectedMembers()];