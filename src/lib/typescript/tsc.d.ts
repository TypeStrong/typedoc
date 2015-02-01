declare module ts {
    interface Map<T> {
        [index: string]: T;
    }
    interface TextRange {
        pos: number;
        end: number;
    }
    const enum SyntaxKind {
        Unknown = 0,
        EndOfFileToken = 1,
        SingleLineCommentTrivia = 2,
        MultiLineCommentTrivia = 3,
        NewLineTrivia = 4,
        WhitespaceTrivia = 5,
        NumericLiteral = 6,
        StringLiteral = 7,
        RegularExpressionLiteral = 8,
        NoSubstitutionTemplateLiteral = 9,
        TemplateHead = 10,
        TemplateMiddle = 11,
        TemplateTail = 12,
        OpenBraceToken = 13,
        CloseBraceToken = 14,
        OpenParenToken = 15,
        CloseParenToken = 16,
        OpenBracketToken = 17,
        CloseBracketToken = 18,
        DotToken = 19,
        DotDotDotToken = 20,
        SemicolonToken = 21,
        CommaToken = 22,
        LessThanToken = 23,
        GreaterThanToken = 24,
        LessThanEqualsToken = 25,
        GreaterThanEqualsToken = 26,
        EqualsEqualsToken = 27,
        ExclamationEqualsToken = 28,
        EqualsEqualsEqualsToken = 29,
        ExclamationEqualsEqualsToken = 30,
        EqualsGreaterThanToken = 31,
        PlusToken = 32,
        MinusToken = 33,
        AsteriskToken = 34,
        SlashToken = 35,
        PercentToken = 36,
        PlusPlusToken = 37,
        MinusMinusToken = 38,
        LessThanLessThanToken = 39,
        GreaterThanGreaterThanToken = 40,
        GreaterThanGreaterThanGreaterThanToken = 41,
        AmpersandToken = 42,
        BarToken = 43,
        CaretToken = 44,
        ExclamationToken = 45,
        TildeToken = 46,
        AmpersandAmpersandToken = 47,
        BarBarToken = 48,
        QuestionToken = 49,
        ColonToken = 50,
        EqualsToken = 51,
        PlusEqualsToken = 52,
        MinusEqualsToken = 53,
        AsteriskEqualsToken = 54,
        SlashEqualsToken = 55,
        PercentEqualsToken = 56,
        LessThanLessThanEqualsToken = 57,
        GreaterThanGreaterThanEqualsToken = 58,
        GreaterThanGreaterThanGreaterThanEqualsToken = 59,
        AmpersandEqualsToken = 60,
        BarEqualsToken = 61,
        CaretEqualsToken = 62,
        Identifier = 63,
        BreakKeyword = 64,
        CaseKeyword = 65,
        CatchKeyword = 66,
        ClassKeyword = 67,
        ConstKeyword = 68,
        ContinueKeyword = 69,
        DebuggerKeyword = 70,
        DefaultKeyword = 71,
        DeleteKeyword = 72,
        DoKeyword = 73,
        ElseKeyword = 74,
        EnumKeyword = 75,
        ExportKeyword = 76,
        ExtendsKeyword = 77,
        FalseKeyword = 78,
        FinallyKeyword = 79,
        ForKeyword = 80,
        FunctionKeyword = 81,
        IfKeyword = 82,
        ImportKeyword = 83,
        InKeyword = 84,
        InstanceOfKeyword = 85,
        NewKeyword = 86,
        NullKeyword = 87,
        ReturnKeyword = 88,
        SuperKeyword = 89,
        SwitchKeyword = 90,
        ThisKeyword = 91,
        ThrowKeyword = 92,
        TrueKeyword = 93,
        TryKeyword = 94,
        TypeOfKeyword = 95,
        VarKeyword = 96,
        VoidKeyword = 97,
        WhileKeyword = 98,
        WithKeyword = 99,
        ImplementsKeyword = 100,
        InterfaceKeyword = 101,
        LetKeyword = 102,
        PackageKeyword = 103,
        PrivateKeyword = 104,
        ProtectedKeyword = 105,
        PublicKeyword = 106,
        StaticKeyword = 107,
        YieldKeyword = 108,
        AnyKeyword = 109,
        BooleanKeyword = 110,
        ConstructorKeyword = 111,
        DeclareKeyword = 112,
        GetKeyword = 113,
        ModuleKeyword = 114,
        RequireKeyword = 115,
        NumberKeyword = 116,
        SetKeyword = 117,
        StringKeyword = 118,
        TypeKeyword = 119,
        QualifiedName = 120,
        ComputedPropertyName = 121,
        TypeParameter = 122,
        Parameter = 123,
        Property = 124,
        Method = 125,
        Constructor = 126,
        GetAccessor = 127,
        SetAccessor = 128,
        CallSignature = 129,
        ConstructSignature = 130,
        IndexSignature = 131,
        TypeReference = 132,
        FunctionType = 133,
        ConstructorType = 134,
        TypeQuery = 135,
        TypeLiteral = 136,
        ArrayType = 137,
        TupleType = 138,
        UnionType = 139,
        ParenthesizedType = 140,
        ArrayLiteralExpression = 141,
        ObjectLiteralExpression = 142,
        PropertyAccessExpression = 143,
        ElementAccessExpression = 144,
        CallExpression = 145,
        NewExpression = 146,
        TaggedTemplateExpression = 147,
        TypeAssertionExpression = 148,
        ParenthesizedExpression = 149,
        FunctionExpression = 150,
        ArrowFunction = 151,
        DeleteExpression = 152,
        TypeOfExpression = 153,
        VoidExpression = 154,
        PrefixUnaryExpression = 155,
        PostfixUnaryExpression = 156,
        BinaryExpression = 157,
        ConditionalExpression = 158,
        TemplateExpression = 159,
        YieldExpression = 160,
        OmittedExpression = 161,
        TemplateSpan = 162,
        Block = 163,
        VariableStatement = 164,
        EmptyStatement = 165,
        ExpressionStatement = 166,
        IfStatement = 167,
        DoStatement = 168,
        WhileStatement = 169,
        ForStatement = 170,
        ForInStatement = 171,
        ContinueStatement = 172,
        BreakStatement = 173,
        ReturnStatement = 174,
        WithStatement = 175,
        SwitchStatement = 176,
        LabeledStatement = 177,
        ThrowStatement = 178,
        TryStatement = 179,
        TryBlock = 180,
        FinallyBlock = 181,
        DebuggerStatement = 182,
        VariableDeclaration = 183,
        FunctionDeclaration = 184,
        ClassDeclaration = 185,
        InterfaceDeclaration = 186,
        TypeAliasDeclaration = 187,
        EnumDeclaration = 188,
        ModuleDeclaration = 189,
        ModuleBlock = 190,
        ImportDeclaration = 191,
        ExportAssignment = 192,
        ExternalModuleReference = 193,
        CaseClause = 194,
        DefaultClause = 195,
        HeritageClause = 196,
        CatchClause = 197,
        PropertyAssignment = 198,
        ShorthandPropertyAssignment = 199,
        EnumMember = 200,
        SourceFile = 201,
        Program = 202,
        SyntaxList = 203,
        Count = 204,
        FirstAssignment = 51,
        LastAssignment = 62,
        FirstReservedWord = 64,
        LastReservedWord = 99,
        FirstKeyword = 64,
        LastKeyword = 119,
        FirstFutureReservedWord = 100,
        LastFutureReservedWord = 108,
        FirstTypeNode = 132,
        LastTypeNode = 140,
        FirstPunctuation = 13,
        LastPunctuation = 62,
        FirstToken = 0,
        LastToken = 119,
        FirstTriviaToken = 2,
        LastTriviaToken = 5,
        FirstLiteralToken = 6,
        LastLiteralToken = 9,
        FirstTemplateToken = 9,
        LastTemplateToken = 12,
        FirstOperator = 21,
        LastOperator = 62,
        FirstBinaryOperator = 23,
        LastBinaryOperator = 62,
        FirstNode = 120,
    }
    const enum NodeFlags {
        Export = 1,
        Ambient = 2,
        Public = 16,
        Private = 32,
        Protected = 64,
        Static = 128,
        MultiLine = 256,
        Synthetic = 512,
        DeclarationFile = 1024,
        Let = 2048,
        Const = 4096,
        OctalLiteral = 8192,
        Modifier = 243,
        AccessibilityModifier = 112,
        BlockScoped = 6144,
    }
    const enum ParserContextFlags {
        StrictMode = 1,
        DisallowIn = 2,
        Yield = 4,
        GeneratorParameter = 8,
        ContainsError = 16,
        HasPropagatedChildContainsErrorFlag = 32,
    }
    interface Node extends TextRange {
        kind: SyntaxKind;
        flags: NodeFlags;
        parserContextFlags?: ParserContextFlags;
        id?: number;
        parent?: Node;
        symbol?: Symbol;
        locals?: SymbolTable;
        nextContainer?: Node;
        localSymbol?: Symbol;
        modifiers?: ModifiersArray;
    }
    interface NodeArray<T> extends Array<T>, TextRange {
        hasTrailingComma?: boolean;
    }
    interface ModifiersArray extends NodeArray<Node> {
        flags: number;
    }
    interface Identifier extends PrimaryExpression {
        text: string;
    }
    interface QualifiedName extends Node {
        left: EntityName;
        right: Identifier;
    }
    type EntityName = Identifier | QualifiedName;
    type DeclarationName = Identifier | LiteralExpression | ComputedPropertyName;
    interface Declaration extends Node {
        _declarationBrand: any;
        name?: DeclarationName;
    }
    interface ComputedPropertyName extends Node {
        expression: Expression;
    }
    interface TypeParameterDeclaration extends Declaration {
        name: Identifier;
        constraint?: TypeNode;
        expression?: Expression;
    }
    interface SignatureDeclaration extends Declaration {
        typeParameters?: NodeArray<TypeParameterDeclaration>;
        parameters: NodeArray<ParameterDeclaration>;
        type?: TypeNode;
    }
    interface VariableDeclaration extends Declaration {
        name: Identifier;
        type?: TypeNode;
        initializer?: Expression;
    }
    interface ParameterDeclaration extends Declaration {
        dotDotDotToken?: Node;
        name: Identifier;
        questionToken?: Node;
        type?: TypeNode | StringLiteralExpression;
        initializer?: Expression;
    }
    interface PropertyDeclaration extends Declaration, ClassElement {
        _propertyDeclarationBrand: any;
        questionToken?: Node;
        type?: TypeNode;
        initializer?: Expression;
    }
    type VariableOrParameterDeclaration = VariableDeclaration | ParameterDeclaration;
    type VariableOrParameterOrPropertyDeclaration = VariableOrParameterDeclaration | PropertyDeclaration;
    interface ObjectLiteralElement extends Declaration {
        _objectLiteralBrandBrand: any;
    }
    interface ShorthandPropertyAssignment extends ObjectLiteralElement {
        name: Identifier;
        questionToken?: Node;
    }
    interface PropertyAssignment extends ObjectLiteralElement {
        _propertyAssignmentBrand: any;
        name: DeclarationName;
        questionToken?: Node;
        initializer: Expression;
    }
    interface FunctionLikeDeclaration extends SignatureDeclaration {
        _functionLikeDeclarationBrand: any;
        asteriskToken?: Node;
        questionToken?: Node;
        body?: Block | Expression;
    }
    interface FunctionDeclaration extends FunctionLikeDeclaration, Statement {
        name: Identifier;
        body?: Block;
    }
    interface MethodDeclaration extends FunctionLikeDeclaration, ClassElement, ObjectLiteralElement {
        body?: Block;
    }
    interface ConstructorDeclaration extends FunctionLikeDeclaration, ClassElement {
        body?: Block;
    }
    interface AccessorDeclaration extends FunctionLikeDeclaration, ClassElement, ObjectLiteralElement {
        _accessorDeclarationBrand: any;
        body: Block;
    }
    interface IndexSignatureDeclaration extends SignatureDeclaration, ClassElement {
        _indexSignatureDeclarationBrand: any;
    }
    interface TypeNode extends Node {
        _typeNodeBrand: any;
    }
    interface FunctionOrConstructorTypeNode extends TypeNode, SignatureDeclaration {
        _functionOrConstructorTypeNodeBrand: any;
    }
    interface TypeReferenceNode extends TypeNode {
        typeName: EntityName;
        typeArguments?: NodeArray<TypeNode>;
    }
    interface TypeQueryNode extends TypeNode {
        exprName: EntityName;
    }
    interface TypeLiteralNode extends TypeNode, Declaration {
        members: NodeArray<Node>;
    }
    interface ArrayTypeNode extends TypeNode {
        elementType: TypeNode;
    }
    interface TupleTypeNode extends TypeNode {
        elementTypes: NodeArray<TypeNode>;
    }
    interface UnionTypeNode extends TypeNode {
        types: NodeArray<TypeNode>;
    }
    interface ParenthesizedTypeNode extends TypeNode {
        type: TypeNode;
    }
    interface Expression extends Node {
        _expressionBrand: any;
        contextualType?: Type;
    }
    interface UnaryExpression extends Expression {
        _unaryExpressionBrand: any;
    }
    interface PrefixUnaryExpression extends UnaryExpression {
        operator: SyntaxKind;
        operand: UnaryExpression;
    }
    interface PostfixUnaryExpression extends PostfixExpression {
        operand: LeftHandSideExpression;
        operator: SyntaxKind;
    }
    interface PostfixExpression extends UnaryExpression {
        _postfixExpressionBrand: any;
    }
    interface LeftHandSideExpression extends PostfixExpression {
        _leftHandSideExpressionBrand: any;
    }
    interface MemberExpression extends LeftHandSideExpression {
        _memberExpressionBrand: any;
    }
    interface PrimaryExpression extends MemberExpression {
        _primaryExpressionBrand: any;
    }
    interface DeleteExpression extends UnaryExpression {
        expression: UnaryExpression;
    }
    interface TypeOfExpression extends UnaryExpression {
        expression: UnaryExpression;
    }
    interface VoidExpression extends UnaryExpression {
        expression: UnaryExpression;
    }
    interface YieldExpression extends Expression {
        asteriskToken?: Node;
        expression: Expression;
    }
    interface BinaryExpression extends Expression {
        left: Expression;
        operator: SyntaxKind;
        right: Expression;
    }
    interface ConditionalExpression extends Expression {
        condition: Expression;
        whenTrue: Expression;
        whenFalse: Expression;
    }
    interface FunctionExpression extends PrimaryExpression, FunctionLikeDeclaration {
        name?: Identifier;
        body: Block | Expression;
    }
    interface LiteralExpression extends PrimaryExpression {
        text: string;
        isUnterminated?: boolean;
    }
    interface StringLiteralExpression extends LiteralExpression {
        _stringLiteralExpressionBrand: any;
    }
    interface TemplateExpression extends PrimaryExpression {
        head: LiteralExpression;
        templateSpans: NodeArray<TemplateSpan>;
    }
    interface TemplateSpan extends Node {
        expression: Expression;
        literal: LiteralExpression;
    }
    interface ParenthesizedExpression extends PrimaryExpression {
        expression: Expression;
    }
    interface ArrayLiteralExpression extends PrimaryExpression {
        elements: NodeArray<Expression>;
    }
    interface ObjectLiteralExpression extends PrimaryExpression, Declaration {
        properties: NodeArray<ObjectLiteralElement>;
    }
    interface PropertyAccessExpression extends MemberExpression {
        expression: LeftHandSideExpression;
        name: Identifier;
    }
    interface ElementAccessExpression extends MemberExpression {
        expression: LeftHandSideExpression;
        argumentExpression?: Expression;
    }
    interface CallExpression extends LeftHandSideExpression {
        expression: LeftHandSideExpression;
        typeArguments?: NodeArray<TypeNode>;
        arguments: NodeArray<Expression>;
    }
    interface NewExpression extends CallExpression, PrimaryExpression {
    }
    interface TaggedTemplateExpression extends MemberExpression {
        tag: LeftHandSideExpression;
        template: LiteralExpression | TemplateExpression;
    }
    type CallLikeExpression = CallExpression | NewExpression | TaggedTemplateExpression;
    interface TypeAssertion extends UnaryExpression {
        type: TypeNode;
        expression: UnaryExpression;
    }
    interface Statement extends Node, ModuleElement {
        _statementBrand: any;
    }
    interface Block extends Statement {
        statements: NodeArray<Statement>;
    }
    interface VariableStatement extends Statement {
        declarations: NodeArray<VariableDeclaration>;
    }
    interface ExpressionStatement extends Statement {
        expression: Expression;
    }
    interface IfStatement extends Statement {
        expression: Expression;
        thenStatement: Statement;
        elseStatement?: Statement;
    }
    interface IterationStatement extends Statement {
        statement: Statement;
    }
    interface DoStatement extends IterationStatement {
        expression: Expression;
    }
    interface WhileStatement extends IterationStatement {
        expression: Expression;
    }
    interface ForStatement extends IterationStatement {
        declarations?: NodeArray<VariableDeclaration>;
        initializer?: Expression;
        condition?: Expression;
        iterator?: Expression;
    }
    interface ForInStatement extends IterationStatement {
        declarations?: NodeArray<VariableDeclaration>;
        variable?: Expression;
        expression: Expression;
    }
    interface BreakOrContinueStatement extends Statement {
        label?: Identifier;
    }
    interface ReturnStatement extends Statement {
        expression?: Expression;
    }
    interface WithStatement extends Statement {
        expression: Expression;
        statement: Statement;
    }
    interface SwitchStatement extends Statement {
        expression: Expression;
        clauses: NodeArray<CaseOrDefaultClause>;
    }
    interface CaseClause extends Node {
        expression?: Expression;
        statements: NodeArray<Statement>;
    }
    interface DefaultClause extends Node {
        statements: NodeArray<Statement>;
    }
    type CaseOrDefaultClause = CaseClause | DefaultClause;
    interface LabeledStatement extends Statement {
        label: Identifier;
        statement: Statement;
    }
    interface ThrowStatement extends Statement {
        expression: Expression;
    }
    interface TryStatement extends Statement {
        tryBlock: Block;
        catchClause?: CatchClause;
        finallyBlock?: Block;
    }
    interface CatchClause extends Declaration {
        name: Identifier;
        type?: TypeNode;
        block: Block;
    }
    interface ModuleElement extends Node {
        _moduleElementBrand: any;
    }
    interface ClassDeclaration extends Declaration, ModuleElement {
        name: Identifier;
        typeParameters?: NodeArray<TypeParameterDeclaration>;
        heritageClauses?: NodeArray<HeritageClause>;
        members: NodeArray<ClassElement>;
    }
    interface ClassElement extends Declaration {
        _classElementBrand: any;
    }
    interface InterfaceDeclaration extends Declaration, ModuleElement {
        name: Identifier;
        typeParameters?: NodeArray<TypeParameterDeclaration>;
        heritageClauses?: NodeArray<HeritageClause>;
        members: NodeArray<Declaration>;
    }
    interface HeritageClause extends Node {
        token: SyntaxKind;
        types?: NodeArray<TypeReferenceNode>;
    }
    interface TypeAliasDeclaration extends Declaration, ModuleElement {
        name: Identifier;
        type: TypeNode;
    }
    interface EnumMember extends Declaration {
        name: DeclarationName;
        initializer?: Expression;
    }
    interface EnumDeclaration extends Declaration, ModuleElement {
        name: Identifier;
        members: NodeArray<EnumMember>;
    }
    interface ModuleDeclaration extends Declaration, ModuleElement {
        name: Identifier | LiteralExpression;
        body: ModuleBlock | ModuleDeclaration;
    }
    interface ModuleBlock extends Node, ModuleElement {
        statements: NodeArray<ModuleElement>;
    }
    interface ImportDeclaration extends Declaration, ModuleElement {
        name: Identifier;
        moduleReference: EntityName | ExternalModuleReference;
    }
    interface ExternalModuleReference extends Node {
        expression?: Expression;
    }
    interface ExportAssignment extends Statement, ModuleElement {
        exportName: Identifier;
    }
    interface FileReference extends TextRange {
        filename: string;
    }
    interface CommentRange extends TextRange {
        hasTrailingNewLine?: boolean;
    }
    interface SourceFile extends Declaration {
        statements: NodeArray<ModuleElement>;
        endOfFileToken: Node;
        filename: string;
        text: string;
        getLineAndCharacterFromPosition(position: number): LineAndCharacter;
        getPositionFromLineAndCharacter(line: number, character: number): number;
        getLineStarts(): number[];
        amdDependencies: string[];
        amdModuleName: string;
        referencedFiles: FileReference[];
        referenceDiagnostics: Diagnostic[];
        parseDiagnostics: Diagnostic[];
        grammarDiagnostics: Diagnostic[];
        getSyntacticDiagnostics(): Diagnostic[];
        semanticDiagnostics: Diagnostic[];
        hasNoDefaultLib: boolean;
        externalModuleIndicator: Node;
        nodeCount: number;
        identifierCount: number;
        symbolCount: number;
        isOpen: boolean;
        version: string;
        languageVersion: ScriptTarget;
        identifiers: Map<string>;
    }
    interface Program {
        getSourceFile(filename: string): SourceFile;
        getSourceFiles(): SourceFile[];
        getCompilerOptions(): CompilerOptions;
        getCompilerHost(): CompilerHost;
        getDiagnostics(sourceFile?: SourceFile): Diagnostic[];
        getGlobalDiagnostics(): Diagnostic[];
        getTypeChecker(fullTypeCheckMode: boolean): TypeChecker;
        getCommonSourceDirectory(): string;
    }
    interface SourceMapSpan {
        emittedLine: number;
        emittedColumn: number;
        sourceLine: number;
        sourceColumn: number;
        nameIndex?: number;
        sourceIndex: number;
    }
    interface SourceMapData {
        sourceMapFilePath: string;
        jsSourceMappingURL: string;
        sourceMapFile: string;
        sourceMapSourceRoot: string;
        sourceMapSources: string[];
        inputSourceFileNames: string[];
        sourceMapNames?: string[];
        sourceMapMappings: string;
        sourceMapDecodedMappings: SourceMapSpan[];
    }
    enum EmitReturnStatus {
        Succeeded = 0,
        AllOutputGenerationSkipped = 1,
        JSGeneratedWithSemanticErrors = 2,
        DeclarationGenerationSkipped = 3,
        EmitErrorsEncountered = 4,
        CompilerOptionsErrors = 5,
    }
    interface EmitResult {
        emitResultStatus: EmitReturnStatus;
        diagnostics: Diagnostic[];
        sourceMaps: SourceMapData[];
    }
    interface TypeChecker {
        getProgram(): Program;
        getDiagnostics(sourceFile?: SourceFile): Diagnostic[];
        getDeclarationDiagnostics(sourceFile: SourceFile): Diagnostic[];
        getGlobalDiagnostics(): Diagnostic[];
        getNodeCount(): number;
        getIdentifierCount(): number;
        getSymbolCount(): number;
        getTypeCount(): number;
        emitFiles(targetSourceFile?: SourceFile): EmitResult;
        getTypeOfSymbolAtLocation(symbol: Symbol, node: Node): Type;
        getDeclaredTypeOfSymbol(symbol: Symbol): Type;
        getPropertiesOfType(type: Type): Symbol[];
        getPropertyOfType(type: Type, propertyName: string): Symbol;
        getSignaturesOfType(type: Type, kind: SignatureKind): Signature[];
        getIndexTypeOfType(type: Type, kind: IndexKind): Type;
        getReturnTypeOfSignature(signature: Signature): Type;
        getSymbolsInScope(location: Node, meaning: SymbolFlags): Symbol[];
        getSymbolAtLocation(node: Node): Symbol;
        getShorthandAssignmentValueSymbol(location: Node): Symbol;
        getTypeAtLocation(node: Node): Type;
        typeToString(type: Type, enclosingDeclaration?: Node, flags?: TypeFormatFlags): string;
        symbolToString(symbol: Symbol, enclosingDeclaration?: Node, meaning?: SymbolFlags): string;
        getSymbolDisplayBuilder(): SymbolDisplayBuilder;
        getFullyQualifiedName(symbol: Symbol): string;
        getAugmentedPropertiesOfType(type: Type): Symbol[];
        getRootSymbols(symbol: Symbol): Symbol[];
        getContextualType(node: Expression): Type;
        getResolvedSignature(node: CallLikeExpression, candidatesOutArray?: Signature[]): Signature;
        getSignatureFromDeclaration(declaration: SignatureDeclaration): Signature;
        isImplementationOfOverload(node: FunctionLikeDeclaration): boolean;
        isUndefinedSymbol(symbol: Symbol): boolean;
        isArgumentsSymbol(symbol: Symbol): boolean;
        isEmitBlocked(sourceFile?: SourceFile): boolean;
        getEnumMemberValue(node: EnumMember): number;
        isValidPropertyAccess(node: PropertyAccessExpression | QualifiedName, propertyName: string): boolean;
        getAliasedSymbol(symbol: Symbol): Symbol;
    }
    interface SymbolDisplayBuilder {
        buildTypeDisplay(type: Type, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        buildSymbolDisplay(symbol: Symbol, writer: SymbolWriter, enclosingDeclaration?: Node, meaning?: SymbolFlags, flags?: SymbolFormatFlags): void;
        buildSignatureDisplay(signatures: Signature, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        buildParameterDisplay(parameter: Symbol, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        buildTypeParameterDisplay(tp: TypeParameter, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        buildTypeParameterDisplayFromSymbol(symbol: Symbol, writer: SymbolWriter, enclosingDeclaraiton?: Node, flags?: TypeFormatFlags): void;
        buildDisplayForParametersAndDelimiters(parameters: Symbol[], writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        buildDisplayForTypeParametersAndDelimiters(typeParameters: TypeParameter[], writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
        buildReturnTypeDisplay(signature: Signature, writer: SymbolWriter, enclosingDeclaration?: Node, flags?: TypeFormatFlags): void;
    }
    interface SymbolWriter {
        writeKeyword(text: string): void;
        writeOperator(text: string): void;
        writePunctuation(text: string): void;
        writeSpace(text: string): void;
        writeStringLiteral(text: string): void;
        writeParameter(text: string): void;
        writeSymbol(text: string, symbol: Symbol): void;
        writeLine(): void;
        increaseIndent(): void;
        decreaseIndent(): void;
        clear(): void;
        trackSymbol(symbol: Symbol, enclosingDeclaration?: Node, meaning?: SymbolFlags): void;
    }
    const enum TypeFormatFlags {
        None = 0,
        WriteArrayAsGenericType = 1,
        UseTypeOfFunction = 2,
        NoTruncation = 4,
        WriteArrowStyleSignature = 8,
        WriteOwnNameForAnyLike = 16,
        WriteTypeArgumentsOfSignature = 32,
        InElementType = 64,
    }
    const enum SymbolFormatFlags {
        None = 0,
        WriteTypeParametersOrArguments = 1,
        UseOnlyExternalAliasing = 2,
    }
    const enum SymbolAccessibility {
        Accessible = 0,
        NotAccessible = 1,
        CannotBeNamed = 2,
    }
    interface SymbolVisibilityResult {
        accessibility: SymbolAccessibility;
        aliasesToMakeVisible?: ImportDeclaration[];
        errorSymbolName?: string;
        errorNode?: Node;
    }
    interface SymbolAccessiblityResult extends SymbolVisibilityResult {
        errorModuleName?: string;
    }
    interface EmitResolver {
        getProgram(): Program;
        getLocalNameOfContainer(container: ModuleDeclaration | EnumDeclaration): string;
        getExpressionNamePrefix(node: Identifier): string;
        getExportAssignmentName(node: SourceFile): string;
        isReferencedImportDeclaration(node: ImportDeclaration): boolean;
        isTopLevelValueImportWithEntityName(node: ImportDeclaration): boolean;
        getNodeCheckFlags(node: Node): NodeCheckFlags;
        getEnumMemberValue(node: EnumMember): number;
        hasSemanticErrors(sourceFile?: SourceFile): boolean;
        isDeclarationVisible(node: Declaration): boolean;
        isImplementationOfOverload(node: FunctionLikeDeclaration): boolean;
        writeTypeOfDeclaration(declaration: AccessorDeclaration | VariableOrParameterDeclaration, enclosingDeclaration: Node, flags: TypeFormatFlags, writer: SymbolWriter): void;
        writeReturnTypeOfSignatureDeclaration(signatureDeclaration: SignatureDeclaration, enclosingDeclaration: Node, flags: TypeFormatFlags, writer: SymbolWriter): void;
        isSymbolAccessible(symbol: Symbol, enclosingDeclaration: Node, meaning: SymbolFlags): SymbolAccessiblityResult;
        isEntityNameVisible(entityName: EntityName, enclosingDeclaration: Node): SymbolVisibilityResult;
        getConstantValue(node: PropertyAccessExpression | ElementAccessExpression): number;
        isEmitBlocked(sourceFile?: SourceFile): boolean;
    }
    const enum SymbolFlags {
        FunctionScopedVariable = 1,
        BlockScopedVariable = 2,
        Property = 4,
        EnumMember = 8,
        Function = 16,
        Class = 32,
        Interface = 64,
        ConstEnum = 128,
        RegularEnum = 256,
        ValueModule = 512,
        NamespaceModule = 1024,
        TypeLiteral = 2048,
        ObjectLiteral = 4096,
        Method = 8192,
        Constructor = 16384,
        GetAccessor = 32768,
        SetAccessor = 65536,
        CallSignature = 131072,
        ConstructSignature = 262144,
        IndexSignature = 524288,
        TypeParameter = 1048576,
        TypeAlias = 2097152,
        ExportValue = 4194304,
        ExportType = 8388608,
        ExportNamespace = 16777216,
        Import = 33554432,
        Instantiated = 67108864,
        Merged = 134217728,
        Transient = 268435456,
        Prototype = 536870912,
        UnionProperty = 1073741824,
        Enum = 384,
        Variable = 3,
        Value = 107455,
        Type = 3152352,
        Namespace = 1536,
        Module = 1536,
        Accessor = 98304,
        Signature = 917504,
        FunctionScopedVariableExcludes = 107454,
        BlockScopedVariableExcludes = 107455,
        ParameterExcludes = 107455,
        PropertyExcludes = 107455,
        EnumMemberExcludes = 107455,
        FunctionExcludes = 106927,
        ClassExcludes = 3258879,
        InterfaceExcludes = 3152288,
        RegularEnumExcludes = 3258623,
        ConstEnumExcludes = 3259263,
        ValueModuleExcludes = 106639,
        NamespaceModuleExcludes = 0,
        MethodExcludes = 99263,
        GetAccessorExcludes = 41919,
        SetAccessorExcludes = 74687,
        TypeParameterExcludes = 2103776,
        TypeAliasExcludes = 3152352,
        ImportExcludes = 33554432,
        ModuleMember = 35653619,
        ExportHasLocal = 944,
        HasLocals = 1041936,
        HasExports = 1952,
        HasMembers = 6240,
        IsContainer = 1048560,
        PropertyOrAccessor = 98308,
        Export = 29360128,
    }
    interface Symbol {
        flags: SymbolFlags;
        name: string;
        id?: number;
        mergeId?: number;
        declarations?: Declaration[];
        parent?: Symbol;
        members?: SymbolTable;
        exports?: SymbolTable;
        exportSymbol?: Symbol;
        valueDeclaration?: Declaration;
        constEnumOnlyModule?: boolean;
    }
    interface SymbolLinks {
        target?: Symbol;
        type?: Type;
        declaredType?: Type;
        mapper?: TypeMapper;
        referenced?: boolean;
        exportAssignSymbol?: Symbol;
        unionType?: UnionType;
    }
    interface TransientSymbol extends Symbol, SymbolLinks {
    }
    interface SymbolTable {
        [index: string]: Symbol;
    }
    const enum NodeCheckFlags {
        TypeChecked = 1,
        LexicalThis = 2,
        CaptureThis = 4,
        EmitExtends = 8,
        SuperInstance = 16,
        SuperStatic = 32,
        ContextChecked = 64,
        EnumValuesComputed = 128,
    }
    interface NodeLinks {
        resolvedType?: Type;
        resolvedSignature?: Signature;
        resolvedSymbol?: Symbol;
        flags?: NodeCheckFlags;
        enumMemberValue?: number;
        isIllegalTypeReferenceInConstraint?: boolean;
        isVisible?: boolean;
        localModuleName?: string;
        assignmentChecks?: Map<boolean>;
    }
    const enum TypeFlags {
        Any = 1,
        String = 2,
        Number = 4,
        Boolean = 8,
        Void = 16,
        Undefined = 32,
        Null = 64,
        Enum = 128,
        StringLiteral = 256,
        TypeParameter = 512,
        Class = 1024,
        Interface = 2048,
        Reference = 4096,
        Tuple = 8192,
        Union = 16384,
        Anonymous = 32768,
        FromSignature = 65536,
        Intrinsic = 127,
        StringLike = 258,
        NumberLike = 132,
        ObjectType = 48128,
    }
    interface Type {
        flags: TypeFlags;
        id: number;
        symbol?: Symbol;
    }
    interface IntrinsicType extends Type {
        intrinsicName: string;
    }
    interface StringLiteralType extends Type {
        text: string;
    }
    interface ObjectType extends Type {
    }
    interface InterfaceType extends ObjectType {
        typeParameters: TypeParameter[];
        baseTypes: ObjectType[];
        declaredProperties: Symbol[];
        declaredCallSignatures: Signature[];
        declaredConstructSignatures: Signature[];
        declaredStringIndexType: Type;
        declaredNumberIndexType: Type;
    }
    interface TypeReference extends ObjectType {
        target: GenericType;
        typeArguments: Type[];
    }
    interface GenericType extends InterfaceType, TypeReference {
        instantiations: Map<TypeReference>;
        openReferenceTargets: GenericType[];
        openReferenceChecks: Map<boolean>;
    }
    interface TupleType extends ObjectType {
        elementTypes: Type[];
        baseArrayType: TypeReference;
    }
    interface UnionType extends Type {
        types: Type[];
        resolvedProperties: SymbolTable;
    }
    interface ResolvedType extends ObjectType, UnionType {
        members: SymbolTable;
        properties: Symbol[];
        callSignatures: Signature[];
        constructSignatures: Signature[];
        stringIndexType: Type;
        numberIndexType: Type;
    }
    interface TypeParameter extends Type {
        constraint: Type;
        target?: TypeParameter;
        mapper?: TypeMapper;
    }
    const enum SignatureKind {
        Call = 0,
        Construct = 1,
    }
    interface Signature {
        declaration: SignatureDeclaration;
        typeParameters: TypeParameter[];
        parameters: Symbol[];
        resolvedReturnType: Type;
        minArgumentCount: number;
        hasRestParameter: boolean;
        hasStringLiterals: boolean;
        target?: Signature;
        mapper?: TypeMapper;
        unionSignatures?: Signature[];
        erasedSignatureCache?: Signature;
        isolatedSignatureType?: ObjectType;
    }
    const enum IndexKind {
        String = 0,
        Number = 1,
    }
    interface TypeMapper {
        (t: Type): Type;
    }
    interface TypeInferences {
        primary: Type[];
        secondary: Type[];
    }
    interface InferenceContext {
        typeParameters: TypeParameter[];
        inferUnionTypes: boolean;
        inferences: TypeInferences[];
        inferredTypes: Type[];
        failedTypeParameterIndex?: number;
    }
    interface DiagnosticMessage {
        key: string;
        category: DiagnosticCategory;
        code: number;
        isEarly?: boolean;
    }
    interface DiagnosticMessageChain {
        messageText: string;
        category: DiagnosticCategory;
        code: number;
        next?: DiagnosticMessageChain;
    }
    interface Diagnostic {
        file: SourceFile;
        start: number;
        length: number;
        messageText: string;
        category: DiagnosticCategory;
        code: number;
        isEarly?: boolean;
    }
    enum DiagnosticCategory {
        Warning = 0,
        Error = 1,
        Message = 2,
    }
    interface CompilerOptions {
        allowNonTsExtensions?: boolean;
        charset?: string;
        codepage?: number;
        declaration?: boolean;
        diagnostics?: boolean;
        emitBOM?: boolean;
        help?: boolean;
        locale?: string;
        mapRoot?: string;
        module?: ModuleKind;
        noEmitOnError?: boolean;
        noErrorTruncation?: boolean;
        noImplicitAny?: boolean;
        noLib?: boolean;
        noLibCheck?: boolean;
        noResolve?: boolean;
        out?: string;
        outDir?: string;
        preserveConstEnums?: boolean;
        removeComments?: boolean;
        sourceMap?: boolean;
        sourceRoot?: string;
        suppressImplicitAnyIndexErrors?: boolean;
        target?: ScriptTarget;
        version?: boolean;
        watch?: boolean;
        [option: string]: string | number | boolean;
    }
    const enum ModuleKind {
        None = 0,
        CommonJS = 1,
        AMD = 2,
    }
    interface LineAndCharacter {
        line: number;
        character: number;
    }
    const enum ScriptTarget {
        ES3 = 0,
        ES5 = 1,
        ES6 = 2,
        Latest = 2,
    }
    interface ParsedCommandLine {
        options: CompilerOptions;
        filenames: string[];
        errors: Diagnostic[];
    }
    interface CommandLineOption {
        name: string;
        type: string | Map<number>;
        shortName?: string;
        description?: DiagnosticMessage;
        paramType?: DiagnosticMessage;
        error?: DiagnosticMessage;
    }
    const enum CharacterCodes {
        nullCharacter = 0,
        maxAsciiCharacter = 127,
        lineFeed = 10,
        carriageReturn = 13,
        lineSeparator = 8232,
        paragraphSeparator = 8233,
        nextLine = 133,
        space = 32,
        nonBreakingSpace = 160,
        enQuad = 8192,
        emQuad = 8193,
        enSpace = 8194,
        emSpace = 8195,
        threePerEmSpace = 8196,
        fourPerEmSpace = 8197,
        sixPerEmSpace = 8198,
        figureSpace = 8199,
        punctuationSpace = 8200,
        thinSpace = 8201,
        hairSpace = 8202,
        zeroWidthSpace = 8203,
        narrowNoBreakSpace = 8239,
        ideographicSpace = 12288,
        mathematicalSpace = 8287,
        ogham = 5760,
        _ = 95,
        $ = 36,
        _0 = 48,
        _1 = 49,
        _2 = 50,
        _3 = 51,
        _4 = 52,
        _5 = 53,
        _6 = 54,
        _7 = 55,
        _8 = 56,
        _9 = 57,
        a = 97,
        b = 98,
        c = 99,
        d = 100,
        e = 101,
        f = 102,
        g = 103,
        h = 104,
        i = 105,
        j = 106,
        k = 107,
        l = 108,
        m = 109,
        n = 110,
        o = 111,
        p = 112,
        q = 113,
        r = 114,
        s = 115,
        t = 116,
        u = 117,
        v = 118,
        w = 119,
        x = 120,
        y = 121,
        z = 122,
        A = 65,
        B = 66,
        C = 67,
        D = 68,
        E = 69,
        F = 70,
        G = 71,
        H = 72,
        I = 73,
        J = 74,
        K = 75,
        L = 76,
        M = 77,
        N = 78,
        O = 79,
        P = 80,
        Q = 81,
        R = 82,
        S = 83,
        T = 84,
        U = 85,
        V = 86,
        W = 87,
        X = 88,
        Y = 89,
        Z = 90,
        ampersand = 38,
        asterisk = 42,
        at = 64,
        backslash = 92,
        backtick = 96,
        bar = 124,
        caret = 94,
        closeBrace = 125,
        closeBracket = 93,
        closeParen = 41,
        colon = 58,
        comma = 44,
        dot = 46,
        doubleQuote = 34,
        equals = 61,
        exclamation = 33,
        greaterThan = 62,
        lessThan = 60,
        minus = 45,
        openBrace = 123,
        openBracket = 91,
        openParen = 40,
        percent = 37,
        plus = 43,
        question = 63,
        semicolon = 59,
        singleQuote = 39,
        slash = 47,
        tilde = 126,
        backspace = 8,
        formFeed = 12,
        byteOrderMark = 65279,
        tab = 9,
        verticalTab = 11,
    }
    interface CancellationToken {
        isCancellationRequested(): boolean;
    }
    interface CompilerHost {
        getSourceFile(filename: string, languageVersion: ScriptTarget, onError?: (message: string) => void): SourceFile;
        getDefaultLibFilename(options: CompilerOptions): string;
        getCancellationToken?(): CancellationToken;
        writeFile(filename: string, data: string, writeByteOrderMark: boolean, onError?: (message: string) => void): void;
        getCurrentDirectory(): string;
        getCanonicalFileName(fileName: string): string;
        useCaseSensitiveFileNames(): boolean;
        getNewLine(): string;
    }
}
declare module ts {
    const enum Ternary {
        False = 0,
        Maybe = 1,
        True = -1,
    }
    const enum Comparison {
        LessThan = -1,
        EqualTo = 0,
        GreaterThan = 1,
    }
    interface StringSet extends Map<any> {
    }
    function forEach<T, U>(array: T[], callback: (element: T) => U): U;
    function contains<T>(array: T[], value: T): boolean;
    function indexOf<T>(array: T[], value: T): number;
    function countWhere<T>(array: T[], predicate: (x: T) => boolean): number;
    function filter<T>(array: T[], f: (x: T) => boolean): T[];
    function map<T, U>(array: T[], f: (x: T) => U): U[];
    function concatenate<T>(array1: T[], array2: T[]): T[];
    function deduplicate<T>(array: T[]): T[];
    function sum(array: any[], prop: string): number;
    function lastOrUndefined<T>(array: T[]): T;
    function binarySearch(array: number[], value: number): number;
    function hasProperty<T>(map: Map<T>, key: string): boolean;
    function getProperty<T>(map: Map<T>, key: string): T;
    function isEmpty<T>(map: Map<T>): boolean;
    function clone<T>(object: T): T;
    function forEachValue<T, U>(map: Map<T>, callback: (value: T) => U): U;
    function forEachKey<T, U>(map: Map<T>, callback: (key: string) => U): U;
    function lookUp<T>(map: Map<T>, key: string): T;
    function mapToArray<T>(map: Map<T>): T[];
    function arrayToMap<T>(array: T[], makeKey: (value: T) => string): Map<T>;
    var localizedDiagnosticMessages: Map<string>;
    function getLocaleSpecificMessage(message: string): string;
    function createFileDiagnostic(file: SourceFile, start: number, length: number, message: DiagnosticMessage, ...args: any[]): Diagnostic;
    function createCompilerDiagnostic(message: DiagnosticMessage, ...args: any[]): Diagnostic;
    function chainDiagnosticMessages(details: DiagnosticMessageChain, message: DiagnosticMessage, ...args: any[]): DiagnosticMessageChain;
    function concatenateDiagnosticMessageChains(headChain: DiagnosticMessageChain, tailChain: DiagnosticMessageChain): DiagnosticMessageChain;
    function flattenDiagnosticChain(file: SourceFile, start: number, length: number, diagnosticChain: DiagnosticMessageChain, newLine: string): Diagnostic;
    function compareValues<T>(a: T, b: T): Comparison;
    function compareDiagnostics(d1: Diagnostic, d2: Diagnostic): number;
    function deduplicateSortedDiagnostics(diagnostics: Diagnostic[]): Diagnostic[];
    function normalizeSlashes(path: string): string;
    function getRootLength(path: string): number;
    var directorySeparator: string;
    function normalizePath(path: string): string;
    function getDirectoryPath(path: string): string;
    function isUrl(path: string): boolean;
    function isRootedDiskPath(path: string): boolean;
    function getNormalizedPathComponents(path: string, currentDirectory: string): string[];
    function getNormalizedAbsolutePath(filename: string, currentDirectory: string): string;
    function getNormalizedPathFromPathComponents(pathComponents: string[]): string;
    function getRelativePathToDirectoryOrUrl(directoryPathOrUrl: string, relativeOrAbsolutePath: string, currentDirectory: string, getCanonicalFileName: (fileName: string) => string, isAbsolutePathAnUrl: boolean): string;
    function getBaseFilename(path: string): string;
    function combinePaths(path1: string, path2: string): string;
    function fileExtensionIs(path: string, extension: string): boolean;
    function removeFileExtension(path: string): string;
    function escapeString(s: string): string;
    interface ObjectAllocator {
        getNodeConstructor(kind: SyntaxKind): new () => Node;
        getSymbolConstructor(): new (flags: SymbolFlags, name: string) => Symbol;
        getTypeConstructor(): new (checker: TypeChecker, flags: TypeFlags) => Type;
        getSignatureConstructor(): new (checker: TypeChecker) => Signature;
    }
    var objectAllocator: ObjectAllocator;
    const enum AssertionLevel {
        None = 0,
        Normal = 1,
        Aggressive = 2,
        VeryAggressive = 3,
    }
    module Debug {
        function shouldAssert(level: AssertionLevel): boolean;
        function assert(expression: boolean, message?: string, verboseDebugInfo?: () => string): void;
        function fail(message?: string): void;
    }
}
declare module ts {
    interface System {
        args: string[];
        newLine: string;
        useCaseSensitiveFileNames: boolean;
        write(s: string): void;
        readFile(fileName: string, encoding?: string): string;
        writeFile(fileName: string, data: string, writeByteOrderMark?: boolean): void;
        watchFile?(fileName: string, callback: (fileName: string) => void): FileWatcher;
        resolvePath(path: string): string;
        fileExists(path: string): boolean;
        directoryExists(path: string): boolean;
        createDirectory(directoryName: string): void;
        getExecutingFilePath(): string;
        getCurrentDirectory(): string;
        getMemoryUsage?(): number;
        exit(exitCode?: number): void;
    }
    interface FileWatcher {
        close(): void;
    }
    var sys: System;
}
declare module ts {
    var Diagnostics: {
        Unterminated_string_literal: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Identifier_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        _0_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_file_cannot_have_a_reference_to_itself: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Trailing_comma_not_allowed: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Asterisk_Slash_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Unexpected_token: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Catch_clause_parameter_cannot_have_a_type_annotation: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_rest_parameter_must_be_last_in_a_parameter_list: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_cannot_have_question_mark_and_initializer: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_required_parameter_cannot_follow_an_optional_parameter: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_index_signature_cannot_have_a_rest_parameter: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_index_signature_parameter_cannot_have_an_accessibility_modifier: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_index_signature_parameter_cannot_have_a_question_mark: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_index_signature_parameter_cannot_have_an_initializer: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_index_signature_must_have_a_type_annotation: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_index_signature_parameter_must_have_a_type_annotation: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_index_signature_parameter_type_must_be_string_or_number: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_class_or_interface_declaration_can_only_have_one_extends_clause: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_extends_clause_must_precede_an_implements_clause: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_class_can_only_extend_a_single_class: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_class_declaration_can_only_have_one_implements_clause: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Accessibility_modifier_already_seen: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        _0_modifier_must_precede_1_modifier: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        _0_modifier_already_seen: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        _0_modifier_cannot_appear_on_a_class_element: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_interface_declaration_cannot_have_an_implements_clause: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        super_must_be_followed_by_an_argument_list_or_member_access: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Only_ambient_modules_can_use_quoted_names: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Statements_are_not_allowed_in_ambient_contexts: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_function_implementation_cannot_be_declared_in_an_ambient_context: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_declare_modifier_cannot_be_used_in_an_already_ambient_context: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Initializers_are_not_allowed_in_ambient_contexts: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        _0_modifier_cannot_appear_on_a_module_element: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_declare_modifier_cannot_be_used_with_an_interface_declaration: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_declare_modifier_is_required_for_a_top_level_declaration_in_a_d_ts_file: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_rest_parameter_cannot_be_optional: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_rest_parameter_cannot_have_an_initializer: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_set_accessor_must_have_exactly_one_parameter: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_set_accessor_cannot_have_an_optional_parameter: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_set_accessor_parameter_cannot_have_an_initializer: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_set_accessor_cannot_have_rest_parameter: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_get_accessor_cannot_have_parameters: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Accessors_are_only_available_when_targeting_ECMAScript_5_and_higher: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Enum_member_must_have_initializer: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_export_assignment_cannot_be_used_in_an_internal_module: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Ambient_enum_elements_can_only_have_integer_literal_initializers: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Unexpected_token_A_constructor_method_accessor_or_property_was_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_declare_modifier_cannot_be_used_with_an_import_declaration: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Invalid_reference_directive_syntax: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Octal_literals_are_not_available_when_targeting_ECMAScript_5_and_higher: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_accessor_cannot_be_declared_in_an_ambient_context: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        _0_modifier_cannot_appear_on_a_constructor_declaration: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        _0_modifier_cannot_appear_on_a_parameter: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Only_a_single_variable_declaration_is_allowed_in_a_for_in_statement: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_parameters_cannot_appear_on_a_constructor_declaration: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_annotation_cannot_appear_on_a_constructor_declaration: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_accessor_cannot_have_type_parameters: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_set_accessor_cannot_have_a_return_type_annotation: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_index_signature_must_have_exactly_one_parameter: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        _0_list_cannot_be_empty: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_parameter_list_cannot_be_empty: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_argument_list_cannot_be_empty: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Invalid_use_of_0_in_strict_mode: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        with_statements_are_not_allowed_in_strict_mode: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        delete_cannot_be_called_on_an_identifier_in_strict_mode: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_continue_statement_can_only_be_used_within_an_enclosing_iteration_statement: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_break_statement_can_only_be_used_within_an_enclosing_iteration_or_switch_statement: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Jump_target_cannot_cross_function_boundary: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_return_statement_can_only_be_used_within_a_function_body: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Expression_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_constructor_implementation_cannot_be_declared_in_an_ambient_context: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_class_member_cannot_be_declared_optional: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_default_clause_cannot_appear_more_than_once_in_a_switch_statement: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Duplicate_label_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_continue_statement_can_only_jump_to_a_label_of_an_enclosing_iteration_statement: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_break_statement_can_only_jump_to_a_label_of_an_enclosing_statement: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_object_literal_cannot_have_multiple_properties_with_the_same_name_in_strict_mode: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_object_literal_cannot_have_multiple_get_Slashset_accessors_with_the_same_name: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_object_literal_cannot_have_property_and_accessor_with_the_same_name: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_export_assignment_cannot_have_modifiers: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Octal_literals_are_not_allowed_in_strict_mode: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_tuple_type_element_list_cannot_be_empty: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Variable_declaration_list_cannot_be_empty: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Digit_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Hexadecimal_digit_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Unexpected_end_of_text: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Invalid_character: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Declaration_or_statement_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Statement_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        case_or_default_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_or_signature_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Enum_member_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_reference_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Variable_declaration_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Argument_expression_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_assignment_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Expression_or_comma_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_declaration_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_parameter_declaration_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_argument_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        String_literal_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Line_break_not_permitted_here: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        or_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Modifiers_not_permitted_on_index_signature_members: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Declaration_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Import_declarations_in_an_internal_module_cannot_reference_an_external_module: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Cannot_compile_external_modules_unless_the_module_flag_is_provided: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Filename_0_differs_from_already_included_filename_1_only_in_casing: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        new_T_cannot_be_used_to_create_an_array_Use_new_Array_T_instead: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        var_let_or_const_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        let_declarations_are_only_available_when_targeting_ECMAScript_6_and_higher: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        const_declarations_are_only_available_when_targeting_ECMAScript_6_and_higher: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        const_declarations_must_be_initialized: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        const_declarations_can_only_be_declared_inside_a_block: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        let_declarations_can_only_be_declared_inside_a_block: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Tagged_templates_are_only_available_when_targeting_ECMAScript_6_and_higher: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Unterminated_template_literal: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Unterminated_regular_expression_literal: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_object_member_cannot_be_declared_optional: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        yield_expression_must_be_contained_within_a_generator_declaration: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Computed_property_names_are_not_allowed_in_enums: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Computed_property_names_are_not_allowed_in_an_ambient_context: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Computed_property_names_are_not_allowed_in_class_property_declarations: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Computed_property_names_are_only_available_when_targeting_ECMAScript_6_and_higher: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Computed_property_names_are_not_allowed_in_method_overloads: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Computed_property_names_are_not_allowed_in_interfaces: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Computed_property_names_are_not_allowed_in_type_literals: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_comma_expression_is_not_allowed_in_a_computed_property_name: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        extends_clause_already_seen: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        extends_clause_must_precede_implements_clause: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Classes_can_only_extend_a_single_class: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        implements_clause_already_seen: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Interface_declaration_cannot_have_implements_clause: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Binary_digit_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Octal_digit_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Unexpected_token_expected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Duplicate_identifier_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Initializer_of_instance_member_variable_0_cannot_reference_identifier_1_declared_in_the_constructor: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Static_members_cannot_reference_class_type_parameters: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Circular_definition_of_import_alias_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Cannot_find_name_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Module_0_has_no_exported_member_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        File_0_is_not_an_external_module: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Cannot_find_external_module_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_module_cannot_have_more_than_one_export_assignment: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_export_assignment_cannot_be_used_in_a_module_with_other_exported_elements: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_0_recursively_references_itself_as_a_base_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_class_may_only_extend_another_class: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_interface_may_only_extend_a_class_or_another_interface: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Constraint_of_a_type_parameter_cannot_reference_any_type_parameter_from_the_same_type_parameter_list: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Generic_type_0_requires_1_type_argument_s: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_0_is_not_generic: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Global_type_0_must_be_a_class_or_interface_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Global_type_0_must_have_1_type_parameter_s: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Cannot_find_global_type_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Named_properties_0_of_types_1_and_2_are_not_identical: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Interface_0_cannot_simultaneously_extend_types_1_and_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Excessive_stack_depth_comparing_types_0_and_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_0_is_not_assignable_to_type_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_0_is_missing_in_type_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_0_is_private_in_type_1_but_not_in_type_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Types_of_property_0_are_incompatible: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_0_is_optional_in_type_1_but_required_in_type_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Types_of_parameters_0_and_1_are_incompatible: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Index_signature_is_missing_in_type_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Index_signatures_are_incompatible: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        this_cannot_be_referenced_in_a_module_body: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        this_cannot_be_referenced_in_current_location: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        this_cannot_be_referenced_in_constructor_arguments: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        this_cannot_be_referenced_in_a_static_property_initializer: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        super_can_only_be_referenced_in_a_derived_class: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        super_cannot_be_referenced_in_constructor_arguments: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Super_calls_are_not_permitted_outside_constructors_or_in_nested_functions_inside_constructors: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        super_property_access_is_permitted_only_in_a_constructor_member_function_or_member_accessor_of_a_derived_class: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_0_does_not_exist_on_type_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Only_public_and_protected_methods_of_the_base_class_are_accessible_via_the_super_keyword: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_0_is_private_and_only_accessible_within_class_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_index_expression_argument_must_be_of_type_string_number_or_any: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_0_does_not_satisfy_the_constraint_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Argument_of_type_0_is_not_assignable_to_parameter_of_type_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Supplied_parameters_do_not_match_any_signature_of_call_target: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Untyped_function_calls_may_not_accept_type_arguments: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Value_of_type_0_is_not_callable_Did_you_mean_to_include_new: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Cannot_invoke_an_expression_whose_type_lacks_a_call_signature: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Only_a_void_function_can_be_called_with_the_new_keyword: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Cannot_use_new_with_an_expression_whose_type_lacks_a_call_or_construct_signature: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Neither_type_0_nor_type_1_is_assignable_to_the_other: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        No_best_common_type_exists_among_return_expressions: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_function_whose_declared_type_is_neither_void_nor_any_must_return_a_value_or_consist_of_a_single_throw_statement: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_arithmetic_operand_must_be_of_type_any_number_or_an_enum_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        The_operand_of_an_increment_or_decrement_operator_must_be_a_variable_property_or_indexer: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        The_left_hand_side_of_an_instanceof_expression_must_be_of_type_any_an_object_type_or_a_type_parameter: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        The_right_hand_side_of_an_instanceof_expression_must_be_of_type_any_or_of_a_type_assignable_to_the_Function_interface_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        The_left_hand_side_of_an_in_expression_must_be_of_types_any_string_or_number: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        The_right_hand_side_of_an_in_expression_must_be_of_type_any_an_object_type_or_a_type_parameter: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        The_left_hand_side_of_an_arithmetic_operation_must_be_of_type_any_number_or_an_enum_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        The_right_hand_side_of_an_arithmetic_operation_must_be_of_type_any_number_or_an_enum_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Invalid_left_hand_side_of_assignment_expression: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Operator_0_cannot_be_applied_to_types_1_and_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_parameter_name_cannot_be_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_parameter_property_is_only_allowed_in_a_constructor_implementation: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_rest_parameter_must_be_of_an_array_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_parameter_initializer_is_only_allowed_in_a_function_or_constructor_implementation: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_cannot_be_referenced_in_its_initializer: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Initializer_of_parameter_0_cannot_reference_identifier_1_declared_after_it: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Duplicate_string_index_signature: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Duplicate_number_index_signature: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_super_call_must_be_the_first_statement_in_the_constructor_when_a_class_contains_initialized_properties_or_has_parameter_properties: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Constructors_for_derived_classes_must_contain_a_super_call: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_get_accessor_must_return_a_value_or_consist_of_a_single_throw_statement: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Getter_and_setter_accessors_do_not_agree_in_visibility: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        get_and_set_accessor_must_have_the_same_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_signature_with_an_implementation_cannot_use_a_string_literal_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Specialized_overload_signature_is_not_assignable_to_any_non_specialized_signature: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Overload_signatures_must_all_be_exported_or_not_exported: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Overload_signatures_must_all_be_ambient_or_non_ambient: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Overload_signatures_must_all_be_public_private_or_protected: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Overload_signatures_must_all_be_optional_or_required: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Function_overload_must_be_static: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Function_overload_must_not_be_static: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Function_implementation_name_must_be_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Constructor_implementation_is_missing: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Function_implementation_is_missing_or_not_immediately_following_the_declaration: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Multiple_constructor_implementations_are_not_allowed: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Duplicate_function_implementation: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Overload_signature_is_not_compatible_with_function_implementation: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Individual_declarations_in_merged_declaration_0_must_be_all_exported_or_all_local: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Duplicate_identifier_arguments_Compiler_uses_arguments_to_initialize_rest_parameters: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Duplicate_identifier_i_Compiler_uses_i_to_initialize_rest_parameter: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Expression_resolves_to_variable_declaration_i_that_compiler_uses_to_initialize_rest_parameter: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Duplicate_identifier_this_Compiler_uses_variable_declaration_this_to_capture_this_reference: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Expression_resolves_to_variable_declaration_this_that_compiler_uses_to_capture_this_reference: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Duplicate_identifier_super_Compiler_uses_super_to_capture_base_class_reference: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Expression_resolves_to_super_that_compiler_uses_to_capture_base_class_reference: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Subsequent_variable_declarations_must_have_the_same_type_Variable_0_must_be_of_type_1_but_here_has_type_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        The_left_hand_side_of_a_for_in_statement_cannot_use_a_type_annotation: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        The_left_hand_side_of_a_for_in_statement_must_be_of_type_string_or_any: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Invalid_left_hand_side_in_for_in_statement: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        The_right_hand_side_of_a_for_in_statement_must_be_of_type_any_an_object_type_or_a_type_parameter: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Setters_cannot_return_a_value: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_constructor_signature_must_be_assignable_to_the_instance_type_of_the_class: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        All_symbols_within_a_with_block_will_be_resolved_to_any: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_0_of_type_1_is_not_assignable_to_string_index_type_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_0_of_type_1_is_not_assignable_to_numeric_index_type_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Numeric_index_type_0_is_not_assignable_to_string_index_type_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Class_name_cannot_be_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Class_0_incorrectly_extends_base_class_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Class_static_side_0_incorrectly_extends_base_class_static_side_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_name_0_in_extends_clause_does_not_reference_constructor_function_for_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Class_0_incorrectly_implements_interface_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_class_may_only_implement_another_class_or_interface: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Class_0_defines_instance_member_function_1_but_extended_class_2_defines_it_as_instance_member_accessor: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Class_0_defines_instance_member_function_1_but_extended_class_2_defines_it_as_instance_member_property: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Class_0_defines_instance_member_property_1_but_extended_class_2_defines_it_as_instance_member_function: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Class_0_defines_instance_member_accessor_1_but_extended_class_2_defines_it_as_instance_member_function: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Interface_name_cannot_be_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        All_declarations_of_an_interface_must_have_identical_type_parameters: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Interface_0_incorrectly_extends_interface_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Enum_name_cannot_be_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        In_an_enum_with_multiple_declarations_only_one_declaration_can_omit_an_initializer_for_its_first_enum_element: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_module_declaration_cannot_be_in_a_different_file_from_a_class_or_function_with_which_it_is_merged: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        A_module_declaration_cannot_be_located_prior_to_a_class_or_function_with_which_it_is_merged: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Ambient_external_modules_cannot_be_nested_in_other_modules: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Ambient_external_module_declaration_cannot_specify_relative_module_name: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Module_0_is_hidden_by_a_local_declaration_with_the_same_name: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Import_name_cannot_be_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Import_declaration_in_an_ambient_external_module_declaration_cannot_reference_external_module_through_relative_external_module_name: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Import_declaration_conflicts_with_local_declaration_of_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Duplicate_identifier_0_Compiler_reserves_name_1_in_top_level_scope_of_an_external_module: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Types_have_separate_declarations_of_a_private_property_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_0_is_protected_but_type_1_is_not_a_class_derived_from_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_0_is_protected_in_type_1_but_public_in_type_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_0_is_protected_and_only_accessible_within_class_1_and_its_subclasses: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_0_is_protected_and_only_accessible_through_an_instance_of_class_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        The_0_operator_is_not_allowed_for_boolean_types_Consider_using_1_instead: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Block_scoped_variable_0_used_before_its_declaration: {
            code: number;
            category: DiagnosticCategory;
            key: string;
            isEarly: boolean;
        };
        The_operand_of_an_increment_or_decrement_operator_cannot_be_a_constant: {
            code: number;
            category: DiagnosticCategory;
            key: string;
            isEarly: boolean;
        };
        Left_hand_side_of_assignment_expression_cannot_be_a_constant: {
            code: number;
            category: DiagnosticCategory;
            key: string;
            isEarly: boolean;
        };
        Cannot_redeclare_block_scoped_variable_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
            isEarly: boolean;
        };
        An_enum_member_cannot_have_a_numeric_name: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        The_type_argument_for_type_parameter_0_cannot_be_inferred_from_the_usage_Consider_specifying_the_type_arguments_explicitly: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_argument_candidate_1_is_not_a_valid_type_argument_because_it_is_not_a_supertype_of_candidate_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_alias_0_circularly_references_itself: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_alias_name_cannot_be_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        An_AMD_module_cannot_have_multiple_name_assignments: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Import_declaration_0_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_parameter_0_of_exported_class_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_parameter_0_of_exported_interface_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_parameter_0_of_constructor_signature_from_exported_interface_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_parameter_0_of_call_signature_from_exported_interface_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_parameter_0_of_public_static_method_from_exported_class_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_parameter_0_of_public_method_from_exported_class_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_parameter_0_of_method_from_exported_interface_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Type_parameter_0_of_exported_function_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Implements_clause_of_exported_class_0_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Extends_clause_of_exported_class_0_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Extends_clause_of_exported_interface_0_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Exported_variable_0_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Exported_variable_0_has_or_is_using_name_1_from_private_module_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Exported_variable_0_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Public_static_property_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Public_static_property_0_of_exported_class_has_or_is_using_name_1_from_private_module_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Public_static_property_0_of_exported_class_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Public_property_0_of_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Public_property_0_of_exported_class_has_or_is_using_name_1_from_private_module_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Public_property_0_of_exported_class_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_0_of_exported_interface_has_or_is_using_name_1_from_private_module_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_0_of_exported_interface_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_public_static_property_setter_from_exported_class_has_or_is_using_name_1_from_private_module_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_public_static_property_setter_from_exported_class_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_public_property_setter_from_exported_class_has_or_is_using_name_1_from_private_module_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_public_property_setter_from_exported_class_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_public_static_property_getter_from_exported_class_has_or_is_using_name_0_from_external_module_1_but_cannot_be_named: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_public_static_property_getter_from_exported_class_has_or_is_using_name_0_from_private_module_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_public_static_property_getter_from_exported_class_has_or_is_using_private_name_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_public_property_getter_from_exported_class_has_or_is_using_name_0_from_external_module_1_but_cannot_be_named: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_public_property_getter_from_exported_class_has_or_is_using_name_0_from_private_module_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_public_property_getter_from_exported_class_has_or_is_using_private_name_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_constructor_signature_from_exported_interface_has_or_is_using_name_0_from_private_module_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_constructor_signature_from_exported_interface_has_or_is_using_private_name_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_call_signature_from_exported_interface_has_or_is_using_name_0_from_private_module_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_call_signature_from_exported_interface_has_or_is_using_private_name_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_index_signature_from_exported_interface_has_or_is_using_name_0_from_private_module_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_index_signature_from_exported_interface_has_or_is_using_private_name_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_public_static_method_from_exported_class_has_or_is_using_name_0_from_external_module_1_but_cannot_be_named: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_public_static_method_from_exported_class_has_or_is_using_name_0_from_private_module_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_public_static_method_from_exported_class_has_or_is_using_private_name_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_public_method_from_exported_class_has_or_is_using_name_0_from_external_module_1_but_cannot_be_named: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_public_method_from_exported_class_has_or_is_using_name_0_from_private_module_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_public_method_from_exported_class_has_or_is_using_private_name_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_method_from_exported_interface_has_or_is_using_name_0_from_private_module_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_method_from_exported_interface_has_or_is_using_private_name_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_exported_function_has_or_is_using_name_0_from_external_module_1_but_cannot_be_named: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_exported_function_has_or_is_using_name_0_from_private_module_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Return_type_of_exported_function_has_or_is_using_private_name_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_constructor_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_constructor_from_exported_class_has_or_is_using_name_1_from_private_module_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_constructor_from_exported_class_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_constructor_signature_from_exported_interface_has_or_is_using_name_1_from_private_module_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_constructor_signature_from_exported_interface_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_call_signature_from_exported_interface_has_or_is_using_name_1_from_private_module_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_call_signature_from_exported_interface_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_public_static_method_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_public_static_method_from_exported_class_has_or_is_using_name_1_from_private_module_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_public_static_method_from_exported_class_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_public_method_from_exported_class_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_public_method_from_exported_class_has_or_is_using_name_1_from_private_module_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_public_method_from_exported_class_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_method_from_exported_interface_has_or_is_using_name_1_from_private_module_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_method_from_exported_interface_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_exported_function_has_or_is_using_name_1_from_external_module_2_but_cannot_be_named: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_exported_function_has_or_is_using_name_1_from_private_module_2: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_of_exported_function_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Exported_type_alias_0_has_or_is_using_private_name_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Enum_declarations_must_all_be_const_or_non_const: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        In_const_enum_declarations_member_initializer_must_be_constant_expression: {
            code: number;
            category: DiagnosticCategory;
            key: string;
            isEarly: boolean;
        };
        const_enums_can_only_be_used_in_property_or_index_access_expressions_or_the_right_hand_side_of_an_import_declaration_or_export_assignment: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Index_expression_arguments_in_const_enums_must_be_of_type_string: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        const_enum_member_initializer_was_evaluated_to_a_non_finite_value: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        const_enum_member_initializer_was_evaluated_to_disallowed_value_NaN: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        The_current_host_does_not_support_the_0_option: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Cannot_find_the_common_subdirectory_path_for_the_input_files: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Cannot_read_file_0_Colon_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Unsupported_file_encoding: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Unknown_compiler_option_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Could_not_write_file_0_Colon_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Option_mapRoot_cannot_be_specified_without_specifying_sourcemap_option: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Option_sourceRoot_cannot_be_specified_without_specifying_sourcemap_option: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Concatenate_and_emit_output_to_single_file: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Generates_corresponding_d_ts_file: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Specifies_the_location_where_debugger_should_locate_map_files_instead_of_generated_locations: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Specifies_the_location_where_debugger_should_locate_TypeScript_files_instead_of_source_locations: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Watch_input_files: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Redirect_output_structure_to_the_directory: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Do_not_erase_const_enum_declarations_in_generated_code: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Do_not_emit_outputs_if_any_type_checking_errors_were_reported: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Do_not_emit_comments_to_output: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Specify_ECMAScript_target_version_Colon_ES3_default_ES5_or_ES6_experimental: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Specify_module_code_generation_Colon_commonjs_or_amd: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Print_this_message: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Print_the_compiler_s_version: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Syntax_Colon_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        options: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        file: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Examples_Colon_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Options_Colon: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Version_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Insert_command_line_options_and_files_from_a_file: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        File_change_detected_Compiling: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        KIND: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        FILE: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        VERSION: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        LOCATION: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        DIRECTORY: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Compilation_complete_Watching_for_file_changes: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Generates_corresponding_map_file: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Compiler_option_0_expects_an_argument: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Unterminated_quoted_string_in_response_file_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Argument_for_module_option_must_be_commonjs_or_amd: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Argument_for_target_option_must_be_es3_es5_or_es6: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Locale_must_be_of_the_form_language_or_language_territory_For_example_0_or_1: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Unsupported_locale_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Unable_to_open_file_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Corrupted_locale_file_0: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Warn_on_expressions_and_declarations_with_an_implied_any_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        File_0_not_found: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        File_0_must_have_extension_ts_or_d_ts: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Suppress_noImplicitAny_errors_for_indexing_objects_lacking_index_signatures: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Variable_0_implicitly_has_an_1_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Parameter_0_implicitly_has_an_1_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Member_0_implicitly_has_an_1_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        new_expression_whose_target_lacks_a_construct_signature_implicitly_has_an_any_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        _0_which_lacks_return_type_annotation_implicitly_has_an_1_return_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Function_expression_which_lacks_return_type_annotation_implicitly_has_an_0_return_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Construct_signature_which_lacks_return_type_annotation_implicitly_has_an_any_return_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Property_0_implicitly_has_type_any_because_its_set_accessor_lacks_a_type_annotation: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Index_signature_of_object_type_implicitly_has_an_any_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Object_literal_s_property_0_implicitly_has_an_1_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Rest_parameter_0_implicitly_has_an_any_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Call_signature_which_lacks_return_type_annotation_implicitly_has_an_any_return_type: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        _0_implicitly_has_type_any_because_it_is_referenced_directly_or_indirectly_in_its_own_type_annotation: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        _0_implicitly_has_type_any_because_it_is_does_not_have_a_type_annotation_and_is_referenced_directly_or_indirectly_in_its_own_initializer: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        _0_implicitly_has_return_type_any_because_it_does_not_have_a_return_type_annotation_and_is_referenced_directly_or_indirectly_in_one_of_its_return_expressions: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Function_implicitly_has_return_type_any_because_it_does_not_have_a_return_type_annotation_and_is_referenced_directly_or_indirectly_in_one_of_its_return_expressions: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        You_cannot_rename_this_element: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        yield_expressions_are_not_currently_supported: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Generators_are_not_currently_supported: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
        Computed_property_names_are_not_currently_supported: {
            code: number;
            category: DiagnosticCategory;
            key: string;
        };
    };
}
declare module ts {
    interface ErrorCallback {
        (message: DiagnosticMessage): void;
    }
    interface CommentCallback {
        (pos: number, end: number): void;
    }
    interface Scanner {
        getStartPos(): number;
        getToken(): SyntaxKind;
        getTextPos(): number;
        getTokenPos(): number;
        getTokenText(): string;
        getTokenValue(): string;
        hasPrecedingLineBreak(): boolean;
        isIdentifier(): boolean;
        isReservedWord(): boolean;
        isUnterminated(): boolean;
        reScanGreaterToken(): SyntaxKind;
        reScanSlashToken(): SyntaxKind;
        reScanTemplateToken(): SyntaxKind;
        scan(): SyntaxKind;
        setText(text: string): void;
        setTextPos(textPos: number): void;
        lookAhead<T>(callback: () => T): T;
        tryScan<T>(callback: () => T): T;
    }
    function tokenToString(t: SyntaxKind): string;
    function computeLineStarts(text: string): number[];
    function getPositionFromLineAndCharacter(lineStarts: number[], line: number, character: number): number;
    function getLineAndCharacterOfPosition(lineStarts: number[], position: number): {
        line: number;
        character: number;
    };
    function positionToLineAndCharacter(text: string, pos: number): {
        line: number;
        character: number;
    };
    function isWhiteSpace(ch: number): boolean;
    function isLineBreak(ch: number): boolean;
    function isOctalDigit(ch: number): boolean;
    function skipTrivia(text: string, pos: number, stopAfterLineBreak?: boolean): number;
    function getLeadingCommentRanges(text: string, pos: number): CommentRange[];
    function getTrailingCommentRanges(text: string, pos: number): CommentRange[];
    function isIdentifierStart(ch: number, languageVersion: ScriptTarget): boolean;
    function isIdentifierPart(ch: number, languageVersion: ScriptTarget): boolean;
    function createScanner(languageVersion: ScriptTarget, skipTrivia: boolean, text?: string, onError?: ErrorCallback): Scanner;
}
declare module ts {
    interface ReferencePathMatchResult {
        fileReference?: FileReference;
        diagnosticMessage?: DiagnosticMessage;
        isNoDefaultLib?: boolean;
    }
    function getDeclarationOfKind(symbol: Symbol, kind: SyntaxKind): Declaration;
    interface StringSymbolWriter extends SymbolWriter {
        string(): string;
    }
    function getSingleLineStringWriter(): StringSymbolWriter;
    function releaseStringWriter(writer: StringSymbolWriter): void;
    function getFullWidth(node: Node): number;
    function hasFlag(val: number, flag: number): boolean;
    function containsParseError(node: Node): boolean;
    function getSourceFileOfNode(node: Node): SourceFile;
    function nodePosToString(node: Node): string;
    function getStartPosOfNode(node: Node): number;
    function isMissingNode(node: Node): boolean;
    function getTokenPosOfNode(node: Node, sourceFile?: SourceFile): number;
    function getSourceTextOfNodeFromSourceFile(sourceFile: SourceFile, node: Node): string;
    function getTextOfNodeFromSourceText(sourceText: string, node: Node): string;
    function getTextOfNode(node: Node): string;
    function escapeIdentifier(identifier: string): string;
    function unescapeIdentifier(identifier: string): string;
    function declarationNameToString(name: DeclarationName): string;
    function createDiagnosticForNode(node: Node, message: DiagnosticMessage, arg0?: any, arg1?: any, arg2?: any): Diagnostic;
    function createDiagnosticForNodeFromMessageChain(node: Node, messageChain: DiagnosticMessageChain, newLine: string): Diagnostic;
    function getErrorSpanForNode(node: Node): Node;
    function isExternalModule(file: SourceFile): boolean;
    function isDeclarationFile(file: SourceFile): boolean;
    function isConstEnumDeclaration(node: Node): boolean;
    function isConst(node: Node): boolean;
    function isLet(node: Node): boolean;
    function isPrologueDirective(node: Node): boolean;
    function getLeadingCommentRangesOfNode(node: Node, sourceFileOfNode?: SourceFile): CommentRange[];
    function getJsDocComments(node: Node, sourceFileOfNode: SourceFile): CommentRange[];
    var fullTripleSlashReferencePathRegEx: RegExp;
    function forEachReturnStatement<T>(body: Block, visitor: (stmt: ReturnStatement) => T): T;
    function isAnyFunction(node: Node): boolean;
    function isFunctionBlock(node: Node): boolean;
    function isObjectLiteralMethod(node: Node): boolean;
    function getContainingFunction(node: Node): FunctionLikeDeclaration;
    function getThisContainer(node: Node, includeArrowFunctions: boolean): Node;
    function getSuperContainer(node: Node): Node;
    function getInvokedExpression(node: CallLikeExpression): Expression;
    function isExpression(node: Node): boolean;
    function isExternalModuleImportDeclaration(node: Node): boolean;
    function getExternalModuleImportDeclarationExpression(node: Node): Expression;
    function isInternalModuleImportDeclaration(node: Node): boolean;
    function hasDotDotDotToken(node: Node): boolean;
    function hasQuestionToken(node: Node): boolean;
    function hasRestParameters(s: SignatureDeclaration): boolean;
    function isLiteralKind(kind: SyntaxKind): boolean;
    function isTextualLiteralKind(kind: SyntaxKind): boolean;
    function isTemplateLiteralKind(kind: SyntaxKind): boolean;
    function isInAmbientContext(node: Node): boolean;
    function isDeclaration(node: Node): boolean;
    function isStatement(n: Node): boolean;
    function isDeclarationOrFunctionExpressionOrCatchVariableName(name: Node): boolean;
    function getClassBaseTypeNode(node: ClassDeclaration): TypeReferenceNode;
    function getClassImplementedTypeNodes(node: ClassDeclaration): NodeArray<TypeReferenceNode>;
    function getInterfaceBaseTypeNodes(node: InterfaceDeclaration): NodeArray<TypeReferenceNode>;
    function getHeritageClause(clauses: NodeArray<HeritageClause>, kind: SyntaxKind): HeritageClause;
    function tryResolveScriptReference(program: Program, sourceFile: SourceFile, reference: FileReference): SourceFile;
    function getAncestor(node: Node, kind: SyntaxKind): Node;
    function getFileReferenceFromReferencePath(comment: string, commentRange: CommentRange): ReferencePathMatchResult;
    function isKeyword(token: SyntaxKind): boolean;
    function isTrivia(token: SyntaxKind): boolean;
    function isModifier(token: SyntaxKind): boolean;
}
declare module ts {
    function getNodeConstructor(kind: SyntaxKind): new () => Node;
    function forEachChild<T>(node: Node, cbNode: (node: Node) => T, cbNodes?: (nodes: Node[]) => T): T;
    function createCompilerHost(options: CompilerOptions): CompilerHost;
    function createSourceFile(filename: string, sourceText: string, languageVersion: ScriptTarget, version: string, isOpen?: boolean): SourceFile;
    function createProgram(rootNames: string[], options: CompilerOptions, host: CompilerHost): Program;
}
declare module ts {
    const enum ModuleInstanceState {
        NonInstantiated = 0,
        Instantiated = 1,
        ConstEnumOnly = 2,
    }
    function getModuleInstanceState(node: Node): ModuleInstanceState;
    function hasComputedNameButNotSymbol(declaration: Declaration): boolean;
    function bindSourceFile(file: SourceFile): void;
}
declare module ts {
    function getIndentString(level: number): string;
    function shouldEmitToOwnFile(sourceFile: SourceFile, compilerOptions: CompilerOptions): boolean;
    function isExternalModuleOrDeclarationFile(sourceFile: SourceFile): boolean;
    function getDeclarationDiagnostics(program: Program, resolver: EmitResolver, targetSourceFile: SourceFile): Diagnostic[];
    function emitFiles(resolver: EmitResolver, targetSourceFile?: SourceFile): EmitResult;
}
declare module ts {
    function createTypeChecker(program: Program, fullTypeCheck: boolean): TypeChecker;
}
declare module ts {
    var optionDeclarations: CommandLineOption[];
    function parseCommandLine(commandLine: string[]): ParsedCommandLine;
}
declare module ts {
    function executeCommandLine(args: string[]): void;
}
