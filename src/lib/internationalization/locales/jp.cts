import { buildIncompleteTranslation } from "../translatable";

export = buildIncompleteTranslation({
    loaded_multiple_times_0:
        "TypeDoc が複数回読み込まれました。これは通常、TypeDoc を独自にインストールしたプラグインによって発生します。読み込まれたパスは次のとおりです:\n{0}",
    unsupported_ts_version_0:
        "サポートされていない TypeScript バージョンで実行されています。TypeDoc がクラッシュした場合は、これが原因です。TypeDoc は {0} をサポートしています。",
    no_compiler_options_set:
        "コンパイラオプションが設定されていません。これは、TypeDoc が tsconfig.json を見つけられなかったことを意味します。生成されたドキュメントはおそらく空になります。",
    loaded_plugin_0: "プラグイン {0} が読み込まれました",
    solution_not_supported_in_watch_mode:
        "提供された tsconfig ファイルはソリューション スタイルの tsconfig のように見えますが、これはウォッチ モードではサポートされていません。",
    strategy_not_supported_in_watch_mode:
        "ウォッチモードの場合、entryPointStrategy は、resolve または expand のいずれかに設定する必要があります。",
    found_0_errors_and_1_warnings:
        "{0} 件のエラーと {1} 件の警告が見つかりました",
    docs_could_not_be_generated:
        "上記のエラーのためドキュメントを生成できませんでした",
    docs_generated_at_0: "{0} で生成されたドキュメント",
    json_written_to_0: "JSON が {0} に書き込まれました",
    no_entry_points_for_packages:
        "パッケージ モードにエントリ ポイントが提供されていないため、ドキュメントを生成できません",
    failed_to_find_packages:
        "パッケージが見つかりませんでした。package.json を含むエントリ ポイントとして少なくとも 1 つのディレクトリを指定していることを確認してください。",
    nested_packages_unsupported_0:
        "{0} のプロジェクトでは entryPointStrategy がパッケージに設定されていますが、ネストされたパッケージはサポートされていません",
    previous_error_occurred_when_reading_options_for_0:
        "前のエラーは、{0} のパッケージのオプションを読み取り中に発生しました",
    converting_project_at_0: "{0} のプロジェクトを変換しています",
    failed_to_convert_packages:
        "1 つ以上のパッケージの変換に失敗しました。結果は結合されません。",
    merging_converted_projects: "変換されたプロジェクトのマージ",
    no_entry_points_to_merge:
        "マージするためのエントリポイントが提供されていません",
    entrypoint_did_not_match_files_0:
        "エントリポイント グロブ {0} はどのファイルにも一致しませんでした",
    failed_to_parse_json_0: "{0} のファイルを json として解析できませんでした",
    failed_to_read_0_when_processing_document_tag_in_1:
        "{1} のコメントの @document タグの処理中にファイル {0} の読み取りに失敗しました",
    failed_to_read_0_when_processing_project_document:
        "プロジェクト ドキュメントの追加時にファイル {0} の読み取りに失敗しました",
    failed_to_read_0_when_processing_document_child_in_1:
        "{1} 内のドキュメントの子を処理するときにファイル {0} の読み取りに失敗しました",
    frontmatter_children_0_should_be_an_array_of_strings_or_object_with_string_values:
        "{0} の Frontmatter の子は、文字列の配列または文字列値を持つオブジェクトである必要があります。",
    converting_union_as_interface:
        "ユニオン型で@interfaceを使用すると、ユニオンのすべてのブランチに存在しないプロパティが破棄されます。TypeDocの出力はソースコードを正確に記述しない可能性があります。",
    converting_0_as_class_requires_value_declaration:
        "{0} をクラスとして変換するには、非型値を表す宣言が必要です",
    converting_0_as_class_without_construct_signatures:
        "{0} はクラスとして変換されていますが、コンストラクト シグネチャがありません",
    comment_for_0_should_not_contain_block_or_modifier_tags:
        "{0} のコメントにはブロックタグや修飾タグを含めることはできません",
    symbol_0_has_multiple_declarations_with_comment:
        "{0} にはコメント付きの宣言が複数あります。任意のコメントが使用されます",
    comments_for_0_are_declared_at_1:
        "{0} のコメントは次の場所で宣言されています:\n{1}",
    multiple_type_parameters_on_template_tag_unsupported:
        "TypeDoc は、コメント付きの単一の @template タグで定義された複数の型パラメータをサポートしていません。",
    failed_to_find_jsdoc_tag_for_name_0:
        "コメントを解析した後、{0} の JSDoc タグが見つかりませんでした。バグレポートを提出してください。",
    relative_path_0_does_not_exist: "相対パス {0} は存在しません",
    inline_inheritdoc_should_not_appear_in_block_tag_in_comment_at_0:
        "インライン @inheritDoc タグはブロック タグ内に出現しないでください。{0} のコメントでは処理されません。",
    at_most_one_remarks_tag_expected_in_comment_at_0:
        "コメントには最大 1 つの @remarks タグが必要です。{0} のコメントの最初のタグ以外はすべて無視されます。",
    at_most_one_returns_tag_expected_in_comment_at_0:
        "コメントには最大 1 つの @returns タグが必要です。{0} のコメントの最初のタグ以外はすべて無視されます。",
    at_most_one_inheritdoc_tag_expected_in_comment_at_0:
        "コメントには最大 1 つの @inheritDoc タグが必要です。{0} のコメントの最初のタグ以外はすべて無視されます。",
    content_in_summary_overwritten_by_inheritdoc_in_comment_at_0:
        "概要セクションの内容は、{0} のコメントの @inheritDoc タグによって上書きされます。",
    content_in_remarks_block_overwritten_by_inheritdoc_in_comment_at_0:
        "@remarks ブロックの内容は、{0} のコメントの @inheritDoc タグによって上書きされます。",
    example_tag_literal_name:
        "サンプルタグの最初の行はサンプル名として文字通り解釈され、テキストのみを含む必要があります。",
    inheritdoc_tag_properly_capitalized:
        "@inheritDocタグは適切に大文字にする必要があります",
    treating_unrecognized_tag_0_as_modifier:
        "認識されないタグ {0} を修飾タグとして処理します",
    unmatched_closing_brace: "一致しない閉じ括弧",
    unescaped_open_brace_without_inline_tag:
        "インラインタグのないエスケープされていない開き括弧が検出されました",
    unknown_block_tag_0: "不明なブロック タグ {0} に遭遇しました",
    unknown_inline_tag_0: "不明なインライン タグ {0} に遭遇しました",
    open_brace_within_inline_tag:
        "インラインタグ内に開き括弧が見つかりました。これはおそらく間違いです",
    inline_tag_not_closed: "インラインタグが閉じられていない",
    failed_to_resolve_link_to_0_in_comment_for_1:
        "{1} のコメント内の「{0}」へのリンクを解決できませんでした",
    type_0_defined_in_1_is_referenced_by_2_but_not_included_in_docs:
        "{1} で定義されている {0} は {2} によって参照されていますが、ドキュメントには含まれていません。",
    reflection_0_kind_1_defined_in_2_does_not_have_any_documentation:
        "{2} で定義されている {0} ({1}) にはドキュメントがありません",
    invalid_intentionally_not_exported_symbols_0:
        "次のシンボルは意図的にエクスポートされないものとしてマークされていますが、ドキュメントで参照されていないか、エクスポートされています:\n{0}",
    not_all_search_category_boosts_used_0:
        "searchCategoryBoosts で指定されたすべてのカテゴリがドキュメントで使用されているわけではありません。使用されていないカテゴリは次のとおりです:\n{0}",
    not_all_search_group_boosts_used_0:
        "searchGroupBoosts で指定されたすべてのグループがドキュメントで使用されているわけではありません。使用されていないグループは次のとおりです:\n{0}",
    comment_for_0_includes_categoryDescription_for_1_but_no_child_in_group:
        "{0} のコメントに「{1}」の @categoryDe​​scription が含まれていますが、そのカテゴリに子が配置されていません",
    comment_for_0_includes_groupDescription_for_1_but_no_child_in_group:
        '{0} のコメントに "{1}" の @groupDescription が含まれていますが、そのグループには子が配置されていません',
    label_0_for_1_cannot_be_referenced:
        '{1} のラベル "{0}" は宣言参照では参照できません。ラベルには A ～ Z、0 ～ 9、_ のみを含めることができ、数字で始まることはできません。',
    modifier_tag_0_is_mutually_exclusive_with_1_in_comment_for_2:
        "修飾子タグ {0} は、{2} のコメント内の {1} と相互に排他的です",
    signature_0_has_unused_param_with_name_1:
        '署名 {0} には、名前が "{1}" の @param がありますが、使用されていません。',
    declaration_reference_in_inheritdoc_for_0_not_fully_parsed:
        "{0} の @inheritDoc の宣言参照が完全に解析されていないため、正しく解決されない可能性があります",
    failed_to_find_0_to_inherit_comment_from_in_1:
        "{1} のコメントからコメントを継承する「{0}」が見つかりませんでした",
    reflection_0_tried_to_copy_comment_from_1_but_source_had_no_comment:
        "{0} は @inheritDoc を使用して {1} からコメントをコピーしようとしましたが、ソースには関連付けられたコメントがありません",
    inheritdoc_circular_inheritance_chain_0:
        "@inheritDoc は循環継承チェーンを指定します: {0}",
    provided_readme_at_0_could_not_be_read:
        "指定された README パス、{0} は読み取れませんでした",
    defaulting_project_name:
        "--name オプションが指定されておらず、package.json が見つかりませんでした。プロジェクト名を「Documentation」にデフォルト設定します。",
    disable_git_set_but_not_source_link_template:
        "enableGit は設定されていますが、sourceLinkTemplate が設定されていないため、ソースリンクを生成できません。ソースの追跡を防止するには、sourceLinkTemplate または enableSources を設定します。",
    disable_git_set_and_git_revision_used:
        "enableGit が設定されており、sourceLinkTemplate に {gitRevision} が含まれていますが、リビジョンが提供されていないため、空の文字列に置き換えられます。",
    git_remote_0_not_valid:
        '提供された Git リモート "{0}" は無効です。ソース リンクは壊れます',
    custom_css_file_0_does_not_exist:
        "{0} のカスタム CSS ファイルは存在しません",
    unsupported_highlight_language_0_not_highlighted_in_comment_for_1:
        "サポートされていないハイライト言語 {0} は、{1} のコメントではハイライトされません。",
    unloaded_language_0_not_highlighted_in_comment_for_1:
        "言語 {0} のコード ブロックは、highlightLanguages オプションに含まれていないため、{1} のコメントでは強調表示されません。",
    yaml_frontmatter_not_an_object:
        "YAML フロントマターはオブジェクトであると想定されます",
    could_not_write_0: "{0} を書き込めませんでした",
    could_not_empty_output_directory_0:
        "出力ディレクトリ {0} を空にできませんでした",
    could_not_create_output_directory_0:
        "出力ディレクトリ {0} を作成できませんでした",
    theme_0_is_not_defined_available_are_1:
        "テーマ '{0}' は定義されていません。使用可能なテーマは次のとおりです: {1}",
    custom_theme_does_not_define_getSlugger:
        "カスタムテーマはgetSlugger(reflection)メソッドを定義していませんが、マークダウンをレンダリングしようとします",
    no_entry_points_provided:
        "エントリポイントが提供されていません。これは設定ミスである可能性があります。",
    unable_to_find_any_entry_points:
        "エントリ ポイントが見つかりません。以前の警告を参照してください",
    watch_does_not_support_packages_mode:
        "ウォッチモードは「パッケージ」スタイルのエントリポイントをサポートしていません",
    watch_does_not_support_merge_mode:
        "ウォッチモードでは「マージ」スタイルのエントリポイントはサポートされません",
    entry_point_0_not_in_program:
        "エントリ ポイント {0} は、tsconfig の 'files' または 'include' オプションによって参照されていません。",
    use_expand_or_glob_for_files_in_dir:
        "このディレクトリ内のファイルを含める場合は、--entryPointStrategyを設定して展開するか、globを指定します。",
    glob_0_did_not_match_any_files:
        "グロブ {0} はどのファイルにも一致しませんでした",
    entry_point_0_did_not_match_any_files_after_exclude:
        "除外パターンを適用した後、グロブ {0} はどのファイルにも一致しませんでした",
    entry_point_0_did_not_exist:
        "指定されたエントリ ポイント {0} は存在しません",
    entry_point_0_did_not_match_any_packages:
        "エントリ ポイント glob {0} は、package.json を含むディレクトリと一致しませんでした。",
    file_0_not_an_object: "ファイル {0} はオブジェクトではありません",
    serialized_project_referenced_0_not_part_of_project:
        "シリアル化されたプロジェクトは、プロジェクトの一部ではないリフレクション {0} を参照しました",
    saved_relative_path_0_resolved_from_1_does_not_exist:
        "シリアル化されたプロジェクトは {0} を参照していますが、{1} に関連して存在しません",
    circular_reference_extends_0:
        '{0} の "extends" フィールドで循環参照が検出されました',
    failed_resolve_0_to_file_in_1:
        "{0} を {1} 内のファイルに解決できませんでした",
    option_0_can_only_be_specified_by_config_file:
        "'{0}' オプションは設定ファイル経由でのみ指定できます",
    option_0_expected_a_value_but_none_provided:
        "--{0} には値が期待されていましたが、引数として値が与えられませんでした",
    unknown_option_0_may_have_meant_1:
        "不明なオプション: {0}。次のオプションを意味している可能性があります:\n{1}",
    typedoc_key_in_0_ignored:
        "{0} の 'typedoc' キーは、レガシー パッケージの entryPointStrategy によって使用されており、無視されます。",
    typedoc_options_must_be_object_in_0:
        '{0} の "typedocOptions" フィールドを解析できませんでした。フィールドが存在し、オブジェクトが含まれていることを確認してください。',
    tsconfig_file_0_does_not_exist: "tsconfig ファイル {0} が存在しません",
    tsconfig_file_specifies_options_file:
        "tsconfig ファイルの「typedocOptions」は、読み取るオプション ファイルを指定していますが、オプション ファイルは既に読み取られています。これは、設定ミスである可能性があります。",
    tsconfig_file_specifies_tsconfig_file:
        'tsconfig ファイルの "typedocOptions" で、読み取る tsconfig ファイルを指定していない可能性があります。',
    tags_0_defined_in_typedoc_json_overwritten_by_tsdoc_json:
        "typedoc.json で定義された {0} は、tsdoc.json の設定によって上書きされます。",
    failed_read_tsdoc_json_0:
        "{0} の tsdoc.json ファイルの読み取りに失敗しました",
    invalid_tsdoc_json_0:
        "ファイル {0} は有効な tsdoc.json ファイルではありません",
    options_file_0_does_not_exist: "オプションファイル {0} が存在しません",
    failed_read_options_file_0:
        "{0} の解析に失敗しました。存在し、オブジェクトをエクスポートしていることを確認してください",
    invalid_plugin_0_missing_load_function:
        "プラグイン {0} の構造が無効です。ロード関数が見つかりません",
    plugin_0_could_not_be_loaded: "プラグイン {0} を読み込めませんでした",
    help_options:
        "読み込むべき json オプション ファイルを指定します。指定しない場合、TypeDoc は現在のディレクトリで 'typedoc.json' を検索します。",
    help_tsconfig:
        "読み込む TypeScript 設定ファイルを指定します。指定しない場合、TypeDoc は現在のディレクトリで 'tsconfig.json' を検索します。",
    help_compilerOptions:
        "TypeDoc で使用される TypeScript コンパイラ オプションを選択的にオーバーライドします。",
    help_lang: "生成時およびTypeDocのメッセージで使用する言語を設定します",
    help_locales:
        "指定されたロケールの翻訳を追加します。このオプションは、TypeDoc に公式のロケール サポートが追加されるまでの暫定的な手段として主に使用されます。",
    help_packageOptions:
        "entryPointStrategy がパッケージに設定されている場合に各パッケージ内で設定されるオプションを設定します。",
    help_entryPoints: "ドキュメントのエントリポイント",
    help_entryPointStrategy:
        "エントリポイントをドキュメントモジュールに変換するために使用する戦略",
    help_alwaysCreateEntryPointModule:
        "設定すると、TypeDoc はエントリ ポイントに `Module` を常に作成します (1 つしか提供されていない場合でも)。",
    help_projectDocuments:
        "生成されたドキュメントのルートに子として追加されるドキュメント。複数のファイルに一致する glob をサポートします。",
    help_exclude:
        "エントリポイントとして指定されたディレクトリを展開するときに除外するパターンを定義します",
    help_externalPattern:
        "外部ファイルとみなすべきファイルのパターンを定義する",
    help_excludeExternals: "外部で解決されたシンボルが文書化されないようにする",
    help_excludeNotDocumented:
        "明示的に文書化されていないシンボルが結果に表示されないようにする",
    help_excludeNotDocumentedKinds:
        "excludeNotDocumented によって削除できる反射の種類を指定します",
    help_excludeInternal:
        "@internal でマークされたシンボルがドキュメント化されないようにする",
    help_excludeCategories:
        "このカテゴリ内のシンボルをドキュメントから除外する",
    help_excludePrivate:
        "プライベート変数とメソッドを無視します。デフォルトは true です。",
    help_excludeProtected: "保護された変数とメソッドを無視する",
    help_excludeReferences:
        "シンボルが複数回エクスポートされた場合、最初のエクスポート以外はすべて無視されます。",
    help_externalSymbolLinkMappings:
        "ドキュメントに含まれていないシンボルのカスタムリンクを定義する",
    help_out: "ドキュメントを書き込む場所を指定します",
    help_json:
        "プロジェクトを説明するJSONファイルが書き込まれる場所とファイル名を指定します",
    help_pretty: "出力JSONをタブでフォーマットするかどうかを指定します",
    help_emit:
        "TypeDoc が発行する内容を指定します (「docs」、「both」、または「none」)",
    help_theme: "ドキュメントをレンダリングするテーマ名を指定します",
    help_lightHighlightTheme: "ライトモードでコード強調テーマを指定する",
    help_darkHighlightTheme: "ダークモードでのコード強調テーマを指定する",
    help_highlightLanguages:
        "レンダリング時にコードを強調表示するために読み込まれる言語を指定します",
    help_customCss: "テーマをインポートするためのカスタム CSS ファイルへのパス",
    help_markdownItOptions:
        "TypeDocが使用するMarkdownパーサーであるmarkdown-itに渡されるオプションを指定します。",
    help_markdownItLoader:
        "markdown-itインスタンスをロードするときに呼び出されるコールバックを指定します。TypeDocが使用するパーサーのインスタンスが渡されます。",
    help_maxTypeConversionDepth: "変換する型の最大深度を設定する",
    help_name: "テンプレートのヘッダーで使用されるプロジェクト名を設定します",
    help_includeVersion: "プロジェクト名にパッケージバージョンを追加する",
    help_disableSources: "反射を文書化するときに反射のソースの設定を無効にする",
    help_sourceLinkTemplate:
        "ソース URL を生成するときに使用するリンク テンプレートを指定します。設定されていない場合は、git リモートを使用して自動的に作成されます。{path}、{line}、{gitRevision} プレースホルダーをサポートします。",
    help_gitRevision:
        "GitHub/Bitbucket ソースファイルへのリンクに、最後のリビジョンではなく指定されたリビジョンを使用します。disableSources が設定されている場合は効果がありません。",
    help_gitRemote:
        "GitHub/Bitbucket ソースファイルへのリンクに指定されたリモートを使用します。disableGit またはdisableSources が設定されている場合は効果がありません。",
    help_disableGit:
        "すべてが sourceLinkTemplate でリンクできると仮定します。これが有効な場合は、sourceLinkTemplate を設定する必要があります。{path} は basePath をルートとします。",
    help_basePath: "ファイルパスを表示するときに使用するベースパスを指定します",
    help_excludeTags:
        "ドキュメントコメントからリストされたブロック/修飾子タグを削除します",
    help_readme:
        "インデックス ページに表示される Readme ファイルへのパス。インデックス ページを無効にしてグローバル ページでドキュメントを開始するには、`none` を渡します。",
    help_cname:
        "CNAMEファイルのテキストを設定します。これはGitHub Pagesのカスタムドメインに便利です。",
    help_sourceLinkExternal:
        "ソースリンクを外部リンクとして扱い、新しいタブで開くように指定します。",
    help_githubPages:
        "GitHub Pages で 404 エラーを防ぐために .nojekyll ファイルを生成します。デフォルトは `true` です。",
    help_hostedBaseUrl:
        "出力フォルダ内の sitemap.xml と正規リンクを生成する際に使用するベース URL を指定します。指定しない場合は、サイトマップは生成されません。",
    help_useHostedBaseUrlForAbsoluteLinks:
        "設定されている場合、TypeDocはhostedBaseUrlオプションを使用してサイト上のページへの絶対リンクを生成します。",
    help_gaID:
        "Google AnalyticsのトラッキングIDを設定し、トラッキングコードを有効にする",
    help_hideGenerator:
        "ページの最後にある TypeDoc リンクを印刷しないでください",
    help_customFooterHtml: "TypeDoc リンクの後のカスタム フッター",
    help_customFooterHtmlDisableWrapper:
        "設定されている場合、customFooterHtml のラッパー要素が無効になります。",
    help_hideParameterTypesInTitle:
        "署名タイトルのパラメータタイプを非表示にしてスキャンしやすくします",
    help_cacheBust: "静的アセットへのリンクに生成時間を含める",
    help_searchInComments:
        "設定すると、検索インデックスにコメントも含まれます。これにより、検索インデックスのサイズが大幅に増加します。",
    help_searchInDocuments:
        "設定すると、検索インデックスにドキュメントも含まれます。これにより、検索インデックスのサイズが大幅に増加します。",
    help_cleanOutputDir:
        "設定されている場合、TypeDocは出力を書き込む前に出力ディレクトリを削除します。",
    help_titleLink:
        "ヘッダーのタイトルが指すリンクを設定します。デフォルトはドキュメントのホームページです。",
    help_navigationLinks: "ヘッダーに含めるリンクを定義します",
    help_sidebarLinks: "サイドバーに含めるリンクを定義します",
    help_navigationLeaves: "展開すべきでないナビゲーションツリーのブランチ",
    help_navigation: "ナビゲーションサイドバーの構成方法を決定します",
    help_visibilityFilters:
        "修飾タグに応じて組み込みフィルターと追加フィルターのデフォルトの表示を指定します",
    help_searchCategoryBoosts:
        "選択したカテゴリの関連性を高めるために検索を設定する",
    help_searchGroupBoosts:
        "選択した種類（例：「クラス」）の関連性を高めるように検索を設定します",
    help_jsDocCompatibility:
        "JSDocコメントとの類似性を高めるコメント解析の互換性オプションを設定します",
    help_commentStyle: "TypeDoc がコメントを検索する方法を決定します",
    help_useTsLinkResolution:
        "@linkタグが指す場所を決定する際にTypeScriptのリンク解決を使用します。これはJSDocスタイルのコメントにのみ適用されます。",
    help_preserveLinkText:
        "設定されている場合、リンクテキストのない@linkタグはテキストコンテンツをリンクとして使用します。設定されていない場合は、ターゲットリフレクション名を使用します。",
    help_blockTags: "コメントを解析するときに TypeDoc が認識するブロックタグ",
    help_inlineTags: "TypeDoc がコメントを解析する際に認識するインラインタグ",
    help_modifierTags: "TypeDoc がコメントを解析する際に認識する修飾タグ",
    help_categorizeByGroup: "グループレベルで分類を行うかどうかを指定します",
    help_defaultCategory: "カテゴリのない反射のデフォルトカテゴリを指定します",
    help_categoryOrder:
        "カテゴリの表示順序を指定します。* はリストにないカテゴリの相対順序を示します。",
    help_groupOrder:
        "グループの表示順序を指定します。* はリストにないグループの相対順序を示します。",
    help_sort: "文書化された値のソート戦略を指定する",
    help_sortEntryPoints:
        "設定されている場合、エントリポイントは他のリフレクションと同じソートルールに従います。",
    help_kindSortOrder:
        "「kind」が指定されている場合、反射のソート順を指定します",
    help_watch:
        "ファイルの変更を監視し、変更があった場合はドキュメントを再構築する",
    help_preserveWatchOutput:
        "設定されている場合、TypeDoc はコンパイル実行間で画面をクリアしません。",
    help_skipErrorChecking:
        "ドキュメントを生成する前にTypeScriptの型チェックを実行しない",
    help_help: "このメッセージを印刷する",
    help_version: "TypeDocのバージョンを印刷",
    help_showConfig: "解決された構成を印刷して終了する",
    help_plugin:
        "ロードするnpmプラグインを指定します。省略すると、インストールされているすべてのプラグインがロードされます。",
    help_logLevel: "使用するログレベルを指定する",
    help_treatWarningsAsErrors:
        "設定すると、すべての警告がエラーとして扱われます",
    help_treatValidationWarningsAsErrors:
        "設定すると、検証中に発行された警告はエラーとして扱われます。このオプションは、検証警告の treatWarningsAsErrors を無効にするために使用することはできません。",
    help_intentionallyNotExported:
        "「参照されているが文書化されていない」という警告を生成しないタイプのリスト",
    help_requiredToBeDocumented: "文書化する必要がある反射の種類のリスト",
    help_validation:
        "生成されたドキュメントに対して TypeDoc が実行する検証手順を指定します。",
    unknown_option_0_you_may_have_meant_1:
        "不明なオプション '{0}' 次のオプションを意味している可能性があります:\n{1}",
    option_0_must_be_between_1_and_2:
        "{0} は {1} と {2} の間でなければなりません",
    option_0_must_be_equal_to_or_greater_than_1:
        "{0} は {1} 以上である必要があります",
    option_0_must_be_less_than_or_equal_to_1:
        "{0} は {1} 以下である必要があります",
    option_0_must_be_one_of_1: "{0} は {1} のいずれかである必要があります",
    flag_0_is_not_valid_for_1_expected_2:
        "フラグ '{0}' は {1} に対して有効ではありません。{2} のいずれかである必要があります。",
    expected_object_with_flag_values_for_0:
        "{0} または true/false のフラグ値を持つオブジェクトが必要です",
    flag_values_for_0_must_be_booleans:
        "{0} のフラグ値はブール値である必要があります",
    locales_must_be_an_object:
        "'locales' オプションは、次のようなオブジェクトに設定する必要があります: { en: { theme_implements: \"Implements\" }}",
    exclude_not_documented_specified_0_valid_values_are_1:
        "excludeNotDocumentedKinds は既知の値のみを指定できますが、無効な値が指定されました ({0})。有効な種類は次のとおりです:\n{1}",
    external_symbol_link_mappings_must_be_object:
        "externalSymbolLinkMappings は、Record<パッケージ名、Record<シンボル名、リンク>> である必要があります。",
    highlight_theme_0_must_be_one_of_1:
        "{0} は次のいずれかである必要があります: {1}",
    highlightLanguages_contains_invalid_languages_0:
        "highlightLanguages に無効な言語が含まれています: {0}。サポートされている言語のリストについては typedoc --help を実行してください",
    hostedBaseUrl_must_start_with_http:
        "hostedBaseUrl は http:// または https:// で始まる必要があります",
    useHostedBaseUrlForAbsoluteLinks_requires_hostedBaseUrl:
        "useHostedBaseUrlForAbsoluteLinksオプションではhostedBaseUrlを設定する必要があります",
    option_0_must_be_an_object:
        "'{0}' オプションは配列以外のオブジェクトである必要があります",
    option_0_must_be_a_function: "'{0}' オプションは関数である必要があります",
    option_0_must_be_object_with_urls:
        "{0} は、キーとして文字列ラベル、URL 値として文字列ラベルを持つオブジェクトである必要があります。",
    visibility_filters_only_include_0:
        "visibilityFilters には、次の非 @ キーのみを含めることができます: {0}",
    visibility_filters_must_be_booleans:
        "visibilityFilters のすべての値はブール値である必要があります",
    option_0_values_must_be_numbers:
        "{0} のすべての値は数値である必要があります",
    option_0_values_must_be_array_of_tags:
        "{0} は有効なタグ名の配列である必要があります",
    option_0_specified_1_but_only_2_is_valid:
        "{0} は既知の値のみを指定できますが、無効な値が指定されました ({1})。有効な並べ替え戦略は次のとおりです:\n{2}",
    kind_project: "プロジェクト",
    kind_module: "モジュール",
    kind_namespace: "名前空間",
    kind_enum: "列挙",
    kind_enum_member: "列挙メンバー",
    kind_variable: "変数",
    kind_function: "関数",
    kind_class: "クラス",
    kind_interface: "インターフェイス",
    kind_constructor: "コンストラクター",
    kind_property: "プロパティ",
    kind_method: "メソッド",
    kind_call_signature: "コールシグネチャ",
    kind_index_signature: "インデックスシグネチャ",
    kind_constructor_signature: "コンストラクターシグネチャ",
    kind_parameter: "パラメーター",
    kind_type_literal: "型リテラル",
    kind_type_parameter: "型パラメーター",
    kind_accessor: "アクセッサー",
    kind_get_signature: "署名を取得する",
    kind_set_signature: "署名を設定する",
    kind_type_alias: "型エイリアス",
    kind_reference: "リファレンス",
    kind_document: "ドキュメント",
    kind_plural_project: "プロジェクト",
    kind_plural_module: "モジュール",
    kind_plural_namespace: "名前空間",
    kind_plural_enum: "列挙",
    kind_plural_enum_member: "列挙メンバー",
    kind_plural_variable: "変数",
    kind_plural_function: "関数",
    kind_plural_class: "クラス",
    kind_plural_interface: "インターフェイス",
    kind_plural_constructor: "コンストラクター",
    kind_plural_property: "プロパティ",
    kind_plural_method: "メソッド",
    kind_plural_call_signature: "コールシグネチャ",
    kind_plural_index_signature: "インデックスシグネチャ",
    kind_plural_constructor_signature: "コンストラクターシグネチャ",
    kind_plural_parameter: "パラメータ",
    kind_plural_type_literal: "型リテラル",
    kind_plural_type_parameter: "型パラメーター",
    kind_plural_accessor: "アクセッサー",
    kind_plural_get_signature: "署名を取得する",
    kind_plural_set_signature: "署名を設定する",
    kind_plural_type_alias: "型エイリアス",
    kind_plural_reference: "リファレンス",
    kind_plural_document: "ドキュメント",
    theme_implements: "実装",
    theme_indexable: "インデックス可能",
    theme_type_declaration: "型宣言",
    theme_index: "インデックス",
    theme_hierarchy: "階層",
    theme_hierarchy_view_full: "完全な階層を表示",
    theme_implemented_by: "実装者",
    theme_defined_in: "定義",
    theme_implementation_of: "の実装",
    theme_inherited_from: "継承元",
    theme_overrides: "上書き",
    theme_returns: "戻り値",
    theme_re_exports: "再エクスポート",
    theme_renames_and_re_exports: "リネームと再エクスポート",
    theme_generated_using_typedoc: "TypeDocを使用して生成",
    theme_preparing_search_index: "検索インデックスを準備しています...",
    theme_search_index_not_available: "検索インデックスは利用できません",
    theme_settings: "テーマ設定",
    theme_member_visibility: "メンバーの可視性",
    theme_member_protected: "保護",
    theme_member_private: "非公開",
    theme_member_external: "外部",
    theme_member_inherited: "継承",
    theme_theme: "配色",
    theme_os: "自動",
    theme_light: "ライト",
    theme_dark: "ダーク",
    theme_on_this_page: "このページ",
    theme_search: "検索",
    theme_menu: "メニュー",
    theme_permalink: "パーマリンク",
    tag_see: "参照",
    tag_group: "所属グループ",
    tag_example: "例",
    tag_alias: "別名",
});
