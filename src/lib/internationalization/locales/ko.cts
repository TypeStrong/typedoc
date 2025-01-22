// Please DO NOT include machine generated translations here.
// If adding a new key, leave it commented out for a native speaker
// to update.

import localeUtils = require("../locale-utils.cjs");

export = localeUtils.buildIncompleteTranslation({
    // output_0_could_not_be_generated
    // output_0_generated_at_1

    no_entry_points_for_packages:
        "패키지 모드에 대한 진입점이 제공되지 않았으므로 문서를 생성할 수 없습니다",
    failed_to_find_packages:
        "패키지를 찾지 못했습니다. 적어도 하나의 디렉터리를 package.json을 포함하는 진입점으로 제공했는지 확인하세요",
    nested_packages_unsupported_0:
        "{0} 프로젝트의 entryPointStrategy가 패키지인데 중첩된 패키지는 지원되지 않습니다",
    previous_error_occurred_when_reading_options_for_0:
        "{0} 위치의 패키지 옵션을 읽는 중에 이전 오류가 발생했습니다",
    converting_project_at_0: "{0} 위치의 프로젝트 변환 중",
    failed_to_convert_packages:
        "하나 이상의 패키지를 변환하지 못했습니다. 결과가 병합되지 않을 것입니다",
    merging_converted_projects: "변환된 프로젝트 병합 중",

    no_entry_points_to_merge: "병합할 진입점이 제공되지 않았습니다",
    entrypoint_did_not_match_files_0:
        "진입점 글로브 {0}이(가) 어떤 파일과도 일치하지 않았습니다",
    frontmatter_children_0_should_be_an_array_of_strings_or_object_with_string_values:
        "{0}의 Frontmatter children은 문자열 배열이나 문자열 값을 갖는 객체여야 합니다",

    inline_inheritdoc_should_not_appear_in_block_tag_in_comment_at_0:
        "{0} 위치의 주석에서 인라인 @inheritDoc 태그는 블록 태그 안에 나타나서는 안 됩니다",
    at_most_one_remarks_tag_expected_in_comment_at_0:
        "주석에서 @remarks 태그는 최대 하나만 예상됩니다. {0}",
    at_most_one_returns_tag_expected_in_comment_at_0:
        "주석에서 @returns 태그는 최대 하나만 예상됩니다. {0}",
    at_most_one_inheritdoc_tag_expected_in_comment_at_0:
        "주석에서 @inheritDoc 태그는 최대 하나만 예상됩니다. {0}",
    content_in_summary_overwritten_by_inheritdoc_in_comment_at_0:
        "주석에서 요약 부분의 내용이 @inheritDoc 태그에 의해 덮어쓰여집니다. {0}",
    content_in_remarks_block_overwritten_by_inheritdoc_in_comment_at_0:
        "주석에서 @remarks 블록의 내용이 @inheritDoc 태그에 의해 덮어쓰여집니다. {0}",
    example_tag_literal_name:
        "예제 태그의 첫 번째 줄은 예제 이름으로 사용됩니다. 텍스트만 포함해야 합니다",
    inheritdoc_tag_properly_capitalized:
        "@inheritDoc 태그는 올바르게 대문자화되어야 합니다",
    invalid_intentionally_not_exported_symbols_0:
        "다음 심볼은 의도적으로 내보내지 않았지만 문서화에서 참조되지 않았거나 내보내졌습니다:\n\t{0}",
    defaulting_project_name:
        '--name 옵션이 지정되지 않았고 package.json도 발견되지 않았습니다. 프로젝트 이름을 "Documentation"으로 기본 설정합니다',
    // no_entry_points_provided:
    unable_to_find_any_entry_points:
        "어떤 진입점도 찾을 수 없습니다. 이전 경고를 확인하세요",
    watch_does_not_support_packages_mode:
        "워치 모드는 'packages' 스타일 진입점을 지원하지 않습니다",
    watch_does_not_support_merge_mode:
        "워치 모드는 'merge' 스타일 진입점을 지원하지 않습니다",
    help_options:
        "로드할 JSON 옵션 파일을 지정합니다. 지정하지 않으면 TypeDoc은 현재 디렉터리의 'typedoc.json'을 찾습니다",
    help_tsconfig:
        "로드할 TypeScript 구성 파일을 지정합니다. 지정하지 않으면 TypeDoc은 현재 디렉터리의 'tsconfig.json'을 찾습니다",
    help_compilerOptions:
        "TypeDoc이 사용할 TypeScript 컴파일러 옵션을 선택적으로 재정의합니다",
    help_lang: "생성 및 TypeDoc 메시지에 사용할 언어를 설정합니다",
    help_locales:
        "특정 로케일에 대한 번역을 추가합니다. 이 옵션은 주로 TypeDoc에서 공식 로케일 지원이 추가될 때까지 임시 방편으로 사용됩니다",
    help_packageOptions:
        "entryPointStrategy가 패키지로 설정된 경우 각 패키지에 설정될 옵션을 설정합니다",

    help_entryPoints: "문서화할 진입점입니다",
    help_entryPointStrategy:
        "진입점을 문서 모듈로 변환하는 데 사용할 전략입니다",
    help_alwaysCreateEntryPointModule:
        "설정 시 TypeDoc은 하나의 진입점만 제공되더라도 항상 'Module'을 생성합니다",
    help_projectDocuments:
        "생성된 문서의 루트에 추가될 문서입니다. 복수 파일을 매치하기 위한 글로브를 지원합니다",
    help_exclude: "진입점으로 지정된 디렉터리 확장 시 제외할 패턴을 정의합니다",
    help_externalPattern: "외부로 간주될 파일 패턴을 정의합니다",
    help_excludeExternals: "외부로 해결된 심볼이 문서화되지 않도록 방지합니다",
    help_excludeNotDocumented:
        "명시적으로 문서화되지 않은 심볼이 결과에 표시되지 않도록 방지합니다",
    help_excludeNotDocumentedKinds:
        "excludeNotDocumented로 제거될 리플렉션 유형을 지정합니다",
    help_excludeInternal:
        "@internal로 표시된 심볼이 문서화되지 않도록 방지합니다",
    help_excludeCategories: "문서에서 제외할 카테고리 내의 심볼을 제외합니다",
    help_excludePrivate:
        "비공개 변수와 메서드를 무시합니다. 기본값은 true입니다.",
    help_excludeProtected: "보호된 변수와 메서드를 무시합니다",
    help_excludeReferences:
        "심볼이 여러 번 내보내진 경우 첫 번째 내보내기를 제외하고 모두 무시합니다",
    help_externalSymbolLinkMappings:
        "문서에 포함되지 않은 심볼에 대한 사용자 정의 링크를 정의합니다",
    // help_out
    // help_html
    help_json: "프로젝트를 설명하는 JSON 파일의 위치와 파일 이름을 지정합니다",
    help_pretty: "출력 JSON을 탭으로 포맷팅할 지 여부를 지정합니다",
    help_emit:
        "TypeDoc이 생성할 내용을 지정합니다. 'docs', 'both', 'none' 중 하나를 선택합니다",
    help_theme: "문서를 렌더링할 테마 이름을 지정합니다",
    help_lightHighlightTheme:
        "라이트 모드에서 코드 하이라이팅 테마를 지정합니다",
    help_darkHighlightTheme: "다크 모드에서 코드 하이라이팅 테마를 지정합니다",
    help_highlightLanguages:
        "렌더링 시 코드 하이라이팅에 사용될 언어를 지정합니다",
    help_customCss: "테마에서 가져올 사용자 지정 CSS 파일의 경로",
    help_markdownItOptions:
        "TypeDoc이 사용하는 markdown-it에 전달할 옵션을 지정합니다",
    help_markdownItLoader:
        "markdown-it 인스턴스를 로드할 때 호출될 콜백을 지정합니다. TypeDoc이 사용할 파서 인스턴스를 전달받습니다",
    help_maxTypeConversionDepth: "변환될 타입의 최대 깊이를 설정합니다",
    help_name: "템플릿 헤더에 사용할 프로젝트 이름을 설정합니다",
    help_includeVersion: "프로젝트 이름에 패키지 버전을 추가합니다",
    help_disableSources: "문서화할 때 리플렉션의 소스 설정을 비활성화합니다",
    help_sourceLinkTemplate:
        "소스 URL 생성 시 사용할 링크 템플릿을 지정합니다. 설정하지 않으면 자동으로 git 원격 저장소에서 생성됩니다. {path}, {line}, {gitRevision} 플레이스홀더를 지원합니다",
    help_gitRevision:
        "GitHub/Bitbucket 소스 파일에 대한 링크를 생성할 때 사용할 특정 리비전을 지정합니다. disableSources가 설정된 경우에만 유효합니다",
    help_gitRemote:
        "GitHub/Bitbucket 소스 파일에 대한 링크를 생성할 때 사용할 특정 원격 저장소를 지정합니다. disableGit 또는 disableSources가 설정된 경우에만 유효합니다",
    help_disableGit:
        "모든 것을 sourceLinkTemplate로 링크할 수 있도록 가정합니다. 이 옵션을 사용하려면 sourceLinkTemplate이 설정되어 있어야 합니다. {path}는 basePath에서 시작됩니다",
    help_basePath: "파일 경로를 표시할 때 사용할 기본 경로를 지정합니다",
    help_excludeTags: "문서 주석에서 제거할 블록/수정자 태그를 지정합니다",
    // help_notRenderedTags
    help_readme:
        "인덱스 페이지에 표시할 readme 파일의 경로를 지정합니다. 'none'을 전달하여 인덱스 페이지를 비활성화하고 글로벌 페이지에서 문서화를 시작합니다",
    help_cname:
        "GitHub Pages의 사용자 정의 도메인에 유용한 CNAME 파일 텍스트를 설정합니다",
    help_sourceLinkExternal:
        "소스 링크를 외부 링크로 취급하여 새 탭에서 열도록 지정합니다",
    help_githubPages:
        "GitHub Pages에서 404 오류를 방지하기 위해 .nojekyll 파일을 생성합니다. 기본값은 `true`입니다",
    help_hostedBaseUrl:
        "생성된 sitemap.xml 및 출력 폴더에서 사용할 베이스 URL을 지정합니다. 지정하지 않으면 sitemap이 생성되지 않습니다",
    help_useHostedBaseUrlForAbsoluteLinks:
        "사이트의 페이지에 대해 hostedBaseUrl 옵션을 사용하여 절대 링크를 생성하도록 지정합니다",
    help_hideGenerator: "페이지 끝에 TypeDoc 링크를 출력하지 않습니다",
    help_customFooterHtml: "TypeDoc 링크 뒤에 사용자 정의 푸터를 지정합니다",
    help_customFooterHtmlDisableWrapper:
        "customFooterHtml의 래퍼 요소를 비활성화합니다",
    help_customPersistentHeaderHtml: "",
    help_customPersistentHeaderHtmlDisableWrapper: "",
    // help_hideTypesInSignatureTitle
    help_cacheBust: "정적 자산의 링크에 생성 시간을 포함합니다",
    help_searchInComments:
        "검색 인덱스에 주석도 포함합니다. 이 옵션을 사용하면 검색 인덱스의 크기가 크게 증가합니다",
    help_searchInDocuments:
        "검색 인덱스에 문서도 포함합니다. 이 옵션을 사용하면 검색 인덱스의 크기가 크게 증가합니다",
    help_cleanOutputDir:
        "출력 디렉터리를 작성하기 전에 TypeDoc이 제거하도록 지정합니다",
    help_titleLink:
        "헤더의 제목이 가리키는 링크를 설정합니다. 기본값은 문서 홈페이지입니다",
    help_navigationLinks: "헤더에 포함될 링크를 정의합니다",
    help_sidebarLinks: "사이드바에 포함될 링크를 정의합니다",
    help_navigationLeaves:
        "확장되지 않아야 할 네비게이션 트리의 가지를 정의합니다",
    help_navigation: "네비게이션 사이드바의 구성 방식을 결정합니다",
    help_visibilityFilters:
        "기본 내장 필터 및 수정자 태그에 대한 기본 가시성을 지정합니다",
    help_searchCategoryBoosts:
        "선택한 카테고리에 대해 검색에서 중요도 부스트를 구성합니다",
    help_searchGroupBoosts:
        "선택한 종류(예: '클래스')에 대해 검색에서 중요도 부스트를 구성합니다",
    help_jsDocCompatibility:
        "JSDoc 주석과 유사성을 높이기 위한 주석 파싱의 호환성 옵션을 설정합니다",
    help_commentStyle: "TypeDoc이 주석을 검색하는 방식을 결정합니다",
    help_useTsLinkResolution:
        "TypeScript 링크 해결을 사용하여 @link 태그가 가리키는 위치를 결정합니다. 이 옵션은 JSDoc 스타일 주석에만 적용됩니다",
    help_preserveLinkText:
        "링크 텍스트가 없는 @link 태그는 텍스트 내용을 링크로 사용합니다. 설정되지 않으면 대상 리플렉션 이름을 사용합니다",
    help_blockTags: "TypeDoc이 주석을 파싱할 때 인식할 블록 태그를 지정합니다",
    help_inlineTags:
        "TypeDoc이 주석을 파싱할 때 인식할 인라인 태그를 지정합니다",
    help_modifierTags:
        "TypeDoc이 주석을 파싱할 때 인식할 수정자 태그를 지정합니다",
    help_categorizeByGroup:
        "카테고리화가 그룹 수준에서 수행될지 여부를 지정합니다",
    help_defaultCategory:
        "카테고리가 지정되지 않은 리플렉션의 기본 카테고리를 지정합니다",
    help_categoryOrder:
        "카테고리가 표시될 순서를 지정합니다. *은 리스트에 없는 카테고리의 상대적 순서를 나타냅니다",
    help_groupOrder:
        "그룹이 표시될 순서를 지정합니다. *은 리스트에 없는 그룹의 상대적 순서를 나타냅니다",
    help_sort: "문서화된 값에 대한 정렬 전략을 지정합니다",
    help_sortEntryPoints:
        "진입점이 다른 리플렉션과 동일한 정렬 규칙을 따를지 여부를 지정합니다",
    help_kindSortOrder:
        "'kind'가 지정된 경우 리플렉션의 정렬 순서를 지정합니다",
    help_watch: "파일 변경을 감지하고 문서를 다시 빌드할지 여부를 지정합니다",
    help_preserveWatchOutput:
        "TypeDoc이 컴파일 실행 간에 화면을 지우지 않도록 지정합니다",
    help_skipErrorChecking:
        "TypeScript의 타입 체크를 실행하지 않고 문서를 생성하지 않도록 지정합니다",
    help_help: "해당 메시지을 출력합니다",

    help_version: "TypeDoc의 버전을 출력합니다",
    help_showConfig: "해결된 구성을 출력하고 종료합니다",
    help_plugin:
        "로드할 npm 플러그인을 지정합니다. 생략하면 설치된 모든 플러그인이 로드됩니다",
    help_logLevel: "사용할 로깅 레벨을 지정합니다",
    help_treatWarningsAsErrors: "모든 경고를 오류로 처리합니다",
    help_treatValidationWarningsAsErrors:
        "검증 중 경고를 오류로 처리합니다. 이 옵션은 검증 경고에 대해 treatWarningsAsErrors를 비활성화할 수 없습니다",
    help_intentionallyNotExported:
        "'참조되었지만 문서화되지 않았음' 경고를 생성하지 않을 유형의 목록",
    help_requiredToBeDocumented: "문서화해야 할 리플렉션 종류의 목록",
    help_validation:
        "생성된 문서에 대해 TypeDoc이 수행할 검증 단계를 지정합니다",
    option_0_must_be_between_1_and_2: "{0}은(는) {1}과(와) {2} 사이어야 합니다",
    option_0_must_be_equal_to_or_greater_than_1:
        "{0}은(는) {1} 이상이어야 합니다",
    option_0_must_be_less_than_or_equal_to_1: "{0}은(는) {1} 이하여야 합니다",
    option_0_must_be_one_of_1: "{0}은(는) 다음 중 하나여야 합니다: {1}",
    flag_0_is_not_valid_for_1_expected_2:
        "플래그 '{0}'은(는) {1}에 대해 유효하지 않습니다. {2} 중 하나가 예상됩니다",
    expected_object_with_flag_values_for_0:
        "{0}에 대해 플래그 값이 포함된 객체가 예상됩니다. true/false도 사용할 수 있습니다",
    flag_values_for_0_must_be_booleans:
        "{0}에 대한 플래그 값은 불리언이어야 합니다",
    locales_must_be_an_object:
        "'locales' 옵션은 'en: { theme_implements: \"Implements\" }'와 비슷한 객체로 설정되어야 합니다",
    external_symbol_link_mappings_must_be_object:
        "externalSymbolLinkMappings는 Record<package name, Record<symbol name, link>> 형태여야 합니다",
    highlight_theme_0_must_be_one_of_1:
        "{0}은(는) 다음 중 하나여야 합니다: {1}",
    highlightLanguages_contains_invalid_languages_0:
        "highlightLanguages에 유효하지 않은 언어가 포함되어 있습니다: {0}. 지원하는 언어 목록을 확인하려면 typedoc --help를 실행하세요",
    hostedBaseUrl_must_start_with_http:
        "hostedBaseUrl은 'http://' 또는 'https://'로 시작해야 합니다",
    useHostedBaseUrlForAbsoluteLinks_requires_hostedBaseUrl:
        "useHostedBaseUrlForAbsoluteLinks 옵션을 사용하려면 hostedBaseUrl이 설정되어 있어야 합니다",
    option_0_must_be_an_object: "'{0}' 옵션은 배열이 아닌 객체여야 합니다",
    option_0_must_be_a_function: "'{0}' 옵션은 함수여야 합니다",
    option_0_values_must_be_numbers: "{0}의 모든 값은 숫자여야 합니다",
    option_0_values_must_be_array_of_tags:
        "{0}은(는) 유효한 태그 이름 배열이어야 합니다",

    loaded_multiple_times_0:
        "TypeDoc가 여러 번 로드되었습니다. 일반적으로 자체적으로 설치된 TypeDoc을 가진 플러그인들이 이를 일으킵니다. 로드된 경로는 다음과 같습니다:\n\t{0}",
    unsupported_ts_version_0:
        "지원되지 않는 Typescript 버전으로 실행 중입니다! TypeDoc이 충돌이 생기는 경우 이것이 그 이유가 됩니다. TypeDoc {0}을 지원합니다.",
    no_compiler_options_set:
        "컴파일러 옵션이 설정되지 않았습니다. 이는 TypeDoc이 tsconfig.json을 찾지 못했음을 의미할 수 있습니다. 생성된 문서는 비어 있을 수 있습니다.",

    loaded_plugin_0: `로드된 플러그인 {0}`,

    solution_not_supported_in_watch_mode:
        "제공된 tsconfig 파일은 watch 모드에서 지원되지 않는 솔루션 스타일 tsconfig처럼 보입니다.",
    strategy_not_supported_in_watch_mode:
        "watch 모드에서는 EntryPointStrategy를 확인 또는 확장으로 설정해야 합니다.",
    found_0_errors_and_1_warnings:
        "{0}개의 오류와 {1}개의 경고를 발견했습니다.",

    // ReflectionFlag translations
    flag_private: "Private",
    flag_protected: "Protected",
    flag_public: "Public",
    flag_static: "Static",
    flag_external: "External",
    flag_optional: "Optional",
    flag_rest: "Rest",
    flag_abstract: "Abstract",
    flag_const: "Const",
    flag_readonly: "Readonly",
    flag_inherited: "Inherited",

    kind_project: "프로젝트",
    kind_module: "모듈",
    kind_namespace: "네임스페이스",
    kind_enum: "열거형",
    kind_enum_member: "포함된 값",
    kind_variable: "변수",
    kind_function: "함수",
    kind_class: "클래스",
    kind_interface: "인터페이스",
    kind_constructor: "생성자",
    kind_property: "속성",
    kind_method: "메소드",
    kind_call_signature: "호출 시그니쳐",
    kind_index_signature: "인덱스 시그니쳐",
    kind_constructor_signature: "생성자 시그니쳐",
    kind_parameter: "매개변수",
    kind_type_literal: "타입 리터럴",
    kind_type_parameter: "타입 매개변수",
    kind_accessor: "접근자",
    kind_get_signature: "get 시그니쳐",
    kind_set_signature: "set 시그니쳐",
    kind_type_alias: "타입 별칭",
    kind_reference: "참조",
    kind_document: "문서",

    kind_plural_project: "프로젝트",
    kind_plural_module: "모듈",
    kind_plural_namespace: "네임스페이스",
    kind_plural_enum: "열거형",
    kind_plural_enum_member: "포함된 값",
    kind_plural_variable: "변수",
    kind_plural_function: "함수",
    kind_plural_class: "클래스",
    kind_plural_interface: "인터페이스",
    kind_plural_constructor: "생성자",
    kind_plural_property: "속성",
    kind_plural_method: "메소드",
    kind_plural_call_signature: "호출 시그니쳐",
    kind_plural_index_signature: "인덱스 시그니쳐",
    kind_plural_constructor_signature: "생성자 시그니쳐",
    kind_plural_parameter: "매개변수",
    kind_plural_type_literal: "타입 리터럴",
    kind_plural_type_parameter: "타입 매개변수",
    kind_plural_accessor: "접근자",
    kind_plural_get_signature: "get 시그니쳐",
    kind_plural_set_signature: "set 시그니쳐",
    kind_plural_type_alias: "타입 별칭",
    kind_plural_reference: "참조",
    kind_plural_document: "문서",

    theme_implements: "구현한 타입",
    theme_indexable: "인덱싱 가능",
    theme_type_declaration: "타입 선언",
    theme_index: "둘러보기",
    theme_hierarchy: "계층",
    theme_implemented_by: "구현",
    theme_defined_in: "정의 위치:",
    theme_implementation_of: "구현하는 타입:",
    theme_inherited_from: "상속받은 타입:",
    theme_overrides: "오버라이드 대상:",
    theme_returns: "반환 형식:",
    theme_generated_using_typedoc: "TypeDoc으로 생성됨",

    theme_preparing_search_index: "검색 색인 준비 중...",
    theme_search_index_not_available: "검색 색인을 사용할 수 없습니다.",

    theme_settings: "설정",
    theme_member_visibility: "필터",
    theme_theme: "테마",
    theme_os: "시스템",
    theme_light: "라이트",
    theme_dark: "다크",
    theme_on_this_page: "목차",

    theme_search: "검색",
    theme_menu: "메뉴",
    theme_permalink: "링크",
});
