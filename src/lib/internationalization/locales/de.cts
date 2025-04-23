// Please DO NOT include machine generated translations here.
// If adding a new key, leave it commented out for a native speaker
// to update.

import localeUtils = require("../locale-utils.cjs");

export = localeUtils.buildIncompleteTranslation({
    loaded_multiple_times_0:
        "TypeDoc wurde mehrfach geladen. Das wird oft von Plugins verursacht, die auch TypeDoc installiert haben. Die Pfade, von denen TypeDoc geladen wurde, sind:\n\t{0}",
    unsupported_ts_version_0:
        "Sie verwenden eine Version von TypeScript, die nicht unterstützt wird! Stürzt TypeDoc ab, ist das der Grund. TypeDoc unterstützt {0}",
    no_compiler_options_set:
        "Keine Compiler-Optionen gesetzt. Das bedeutet wahrscheinlich, dass TypeDoc die tsconfig.json nicht finden konnte. Die generierte Dokumentation wird wahrscheinlich leer sein",

    loaded_plugin_0: "Plugin {0} geladen",

    solution_not_supported_in_watch_mode:
        "Die angegebene tsconfig-Datei sieht nach einer Solution-Style-tsconfig aus, die nicht im Watch-Modus unterstützt wird",
    strategy_not_supported_in_watch_mode: "entryPointStrategy muss für den Watch-Modus entweder auf resolve oder expand gesetzt werden",
    file_0_changed_restarting: "Konfigurationsdatei {0} wurde verändert: Kompletter Neustart erforderlich...",
    file_0_changed_rebuilding: "Datei {0} wurde verändert: Baue Ausgabe neu...",
    found_0_errors_and_1_warnings: "{0} Fehler und {1} Warnungen gefunden",

    output_0_could_not_be_generated: "{0}-Ausgabe konnte aufgrund obiger Fehler nicht erstellt werden",
    output_0_generated_at_1: "{0} wurde generiert in {1}",

    no_entry_points_for_packages: "Keine Einstiegspunkte für den packages-Modus angegeben, Dokumentation kann nicht generiert werden",
    failed_to_find_packages:
        "Konnte keine Packages finden, stellen Sie sicher, dass mindestens ein Verzeichnis mit einer package.json als Einstiegspunkt angegeben wurde",
    nested_packages_unsupported_0:
        "Projekt unter {0} hat die entryPointStrategy auf packages gesetzt, aber geschachtelte Packages werden nicht unterstützt",
    package_option_0_should_be_specified_at_root:
        "Die Option packageOptions setzt die Option {0}, welche nur auf Root-Ebene eine Auswirkung hat",
    previous_error_occurred_when_reading_options_for_0:
        "Der vorangegangene Fehler trat auf, als die Optionen für das Package unter {0} gelesen wurden",
    converting_project_at_0: "Konvertiere Projekt unter {0}",
    failed_to_convert_packages: "Konnte ein oder mehrere Packages nicht konvertieren, Ergebnisse werden nicht zusammengeführt",
    merging_converted_projects: "Führe konvertierte Projekte zusammen",

    no_entry_points_to_merge: "Keine Einstiegspunkte zum Zusammenführen angegeben",
    entrypoint_did_not_match_files_0: "Der Glob {0} für den Einstiegspunkt passte auf keine Dateien",
    failed_to_parse_json_0: "Konnte Datei unter {0} nicht als JSON parsen",

    failed_to_read_0_when_processing_document_tag_in_1:
        "Fehler beim Einlesen der Datei {0} während der Verarbeitung des @document-Tags vom Kommentar in {1}",
    failed_to_read_0_when_processing_project_document: "Fehler beim Einlesen der Datei {0} während des Hinzufügens des Projekt-Dokuments",
    failed_to_read_0_when_processing_document_child_in_1:
        "Fehler beim Einlesen der Datei {0} während der Verarbeitung der Dokument-Kindelemente in {1}",
    frontmatter_children_0_should_be_an_array_of_strings_or_object_with_string_values:
        "Kinder der Frontmatter in {0} sollten entweder ein Array von Strings oder ein Objekt mit String-Werten sein",
    converting_union_as_interface:
        "Nutzung von @interface auf einem Union-Typ verwirft alle Eigenschaften, die nicht in allen Teilen der Union vorhanden sind. TypeDocs Ausgabe spiegelt möglicherweise den Quellcode nicht korrekt wider.",
    converting_0_as_class_requires_value_declaration:
        "Konvertierung von {0} als Klasse erfordert eine Klassen-Deklaration, die einen Wert und nicht nur einen Typ darstellt",
    converting_0_as_class_without_construct_signatures:
        "{0} wird als Klasse konvertiert, hat aber keine Konstruktor-Signaturen",

    comment_for_0_should_not_contain_block_or_modifier_tags:
        "Das Kommentar für {0} sollte keine Block- oder Modifier-Tags enthalten",

    symbol_0_has_multiple_declarations_with_comment:
        "{0} hat mehrere Deklarationen mit Kommentaren. Ein beliebiges Kommentar wird verwendet werden",
    comments_for_0_are_declared_at_1: "Die Kommentare für {0} sind deklariert in:\n\t{1}",

    // comments/parser.ts
    multiple_type_parameters_on_template_tag_unsupported:
        "TypeDoc unterstützt mehrfache Typenparameter nicht, wenn diese in einem einzelnen @template-Tag mit Kommentar definiert sind",
    failed_to_find_jsdoc_tag_for_name_0:
        "Konnte JSDoc-Tag für {0} nach dem Parsen der Kommentare nicht finden, bitte erstellen Sie einen Bug-Report",
    relative_path_0_is_not_a_file_and_will_not_be_copied_to_output:
        "Der relative Pfad {0} ist keine Datei und wird daher nicht mit in das Ausgabeverzeichnis kopiert",

    inline_inheritdoc_should_not_appear_in_block_tag_in_comment_at_0:
        "Inline-@inheritDoc-Tag sollte nicht innerhalb eines Block-Tags verwendet werden. Solche Tags im Kommentar unter {0} können nicht verarbeitet werden",
    at_most_one_remarks_tag_expected_in_comment_at_0:
        "Höchstens ein @remarks-Tag darf in einem Kommentar verwendet werden. Alle außer dem ersten Tag im Kommentar unter {0} werden ignoriert",
    at_most_one_returns_tag_expected_in_comment_at_0:
        "Höchstens ein @returns-Tag darf in einem Kommentar verwendet werden. Alle außer dem ersten Tag im Kommentar unter {0} werden ignoriert",
    at_most_one_inheritdoc_tag_expected_in_comment_at_0:
        "Höchstens ein @inheritDoc-Tag darf in einem Kommentar verwendet werden. Alle außer dem ersten Tag im Kommentar unter {0} werden ignoriert",
    content_in_summary_overwritten_by_inheritdoc_in_comment_at_0:
        "Inhalt in der Zusammenfassung des Kommentars unter {0} wird vom @inheritDoc-Tag überschrieben werden",
    content_in_remarks_block_overwritten_by_inheritdoc_in_comment_at_0:
        "Inhalt im @remarks-Block des Kommentars unter {0} wird vom @inheritDoc-Tag überschrieben werden",
    example_tag_literal_name:
        "Die erste Zeile eines @example-Tags wird wortwörtlich als Name des Beispiels interpretiert und sollte nur Text enthalten",
    inheritdoc_tag_properly_capitalized: "Der @inheritDoc-Tag sollte korrekte Groß- und Kleinschreibung verwenden",
    treating_unrecognized_tag_0_as_modifier: "Behandle unerkannten Tag {0} als Modifier-Tag",
    unmatched_closing_brace: "Nicht übereinstimmende schließende Klammern",
    unescaped_open_brace_without_inline_tag: "Unmaskierte öffnende Klammer ohne Inline-Tag vorgefunden",
    unknown_block_tag_0: "Unbekannter Block-Tag {0} vorgefunden",
    unknown_inline_tag_0: "Unbekannter Inline-Tag {0} vorgefunden",
    open_brace_within_inline_tag: "Öffnende Klammer innerhalb eines Inline-Tags vorgefunden, das ist wahrscheinlich ein Fehler",
    inline_tag_not_closed: "Inline-Tag wurde nicht geschlossen",

    // validation
    failed_to_resolve_link_to_0_in_comment_for_1: `Konnte Link zu "{0}" im Kommentar für {1} nicht auflösen`,
    failed_to_resolve_link_to_0_in_comment_for_1_may_have_meant_2:
        `Konnte Link zu "{0}" im Kommentar für {1} nicht auflösen. Meinten Sie vielleicht "{2}"`,
    failed_to_resolve_link_to_0_in_readme_for_1: `Konnte Link zu "{0}" in Readme für {1} nicht auflösen`,
    failed_to_resolve_link_to_0_in_readme_for_1_may_have_meant_2:
        `Konnte Link zu "{0}" in Readme für {1} nicht auflösen. Meinten Sie vielleicht "{2}"`,
    failed_to_resolve_link_to_0_in_document_1: `Konnte Link zu "{0}" im Dokument {1} nicht auflösen`,
    failed_to_resolve_link_to_0_in_document_1_may_have_meant_2:
        `Konnte Link zu "{0}" im Dokument {1} nicht auflösen. Meinten Sie vielleicht "{2}"`,
    type_0_defined_in_1_is_referenced_by_2_but_not_included_in_docs:
        "{0}, definiert in {1}, wird referenziert von {2}, ist aber nicht in der Dokumentation enthalten",
    reflection_0_kind_1_defined_in_2_does_not_have_any_documentation:
        "{0} ({1}), definiert in {2}, hat keinerlei Dokumentation",
    invalid_intentionally_not_documented_names_0:
        "Die folgenden qualifizierten Reflection-Namen wurden absichtlich als undokumentiert markiert, wurden aber entweder in der Dokumentation nicht referenziert oder werden dokumentiert:\n\t{0}",
    invalid_intentionally_not_exported_symbols_0:
        "Die folgenden Symbole wurden absichtlich als nicht exportiert markiert, wurden aber entweder in der Dokumentation nicht referenziert oder werden dokumentiert:\n\t{0}",
    reflection_0_has_unused_mergeModuleWith_tag: "{0} hat einen @mergeModuleWith-Tag, der nicht aufgelöst werden konnte",
    reflection_0_links_to_1_with_text_2_but_resolved_to_3:
        `"{0}" verlinkt auf "{1}" mit Text "{2}", welcher zwar existiert, aber keinen Link in der Dokumentation hat. Verlinke stattdessen auf "{3}"`,

    // conversion plugins
    not_all_search_category_boosts_used_0:
        "Nicht alle in searchCategoryBoosts angegebenen Kategorien werden in der Dokumentation verwendet. Die unbenutzten Kategorien sind:\n\t{0}",
    not_all_search_group_boosts_used_0:
        "Nicht alle in searchGroupBoosts angegebenen Gruppen werden in der Dokumentation verwendet. Die unbenutzten Gruppen sind:\n\t{0}",
    comment_for_0_includes_categoryDescription_for_1_but_no_child_in_group:
        `Kommentar für {0} enthält @categoryDescription für "{1}", aber kein Kind wurde in dieser Kategorie platziert`,
    comment_for_0_includes_groupDescription_for_1_but_no_child_in_group:
        `Kommentar für {0} enthält @groupDescription für "{1}", aber kein Kind wurde in dieser Gruppe platziert`,
    label_0_for_1_cannot_be_referenced:
        `Das Label "{0}" für {1} kann nicht mit einer Deklarationsreferenz referenziert werden. Labels dürfen nur A-Z, 0-9 sowie _ enthalten und dürfen nicht mit einer Ziffer beginnen`,
    modifier_tag_0_is_mutually_exclusive_with_1_in_comment_for_2:
        "Der Modifier-Tag {0} darf nicht gleichzeitig mit {1} verwendet werden im Kommentar für {2}",
    signature_0_has_unused_param_with_name_1: `Die Signatur {0} enthält einen @param mit Namen "{1}", der nicht verwendet wird`,
    declaration_reference_in_inheritdoc_for_0_not_fully_parsed:
        "Deklarationsreferenz in @inheritDoc für {0} wurde nicht vollständig geparst und wird möglicherweise falsch aufgelöst werden",
    failed_to_find_0_to_inherit_comment_from_in_1:
        `Konnte "{0}" zum Erben des Kommentars nicht finden. Betrifft Kommentar für {1}`,
    reflection_0_tried_to_copy_comment_from_1_but_source_had_no_comment:
        "{0} hat versucht, ein Kommentar von {1} mit @inheritDoc zu kopieren, aber die Quelle hat kein zugehöriges Kommentar",
    inheritdoc_circular_inheritance_chain_0: "@inheritDoc spezifiziert eine zyklische Vererbungskette: {0}",
    provided_readme_at_0_could_not_be_read: "Angegebener README-Pfad {0} konnte nicht gelesen werden",
    defaulting_project_name:
        'Die Option --name wurde nicht angegeben und kein package.json wurde gefunden. Verwende "Dokumentation" als Rückfallwert für den Projektnamen',
    disable_git_set_but_not_source_link_template:
        "disableGit wurde gesetzt, aber sourceLinkTemplate nicht, sodass Links auf die Quellcode-Dateien nicht erstellt werden können. Setzen Sie sourceLinkTemplate oder disableSources, um das Ermitteln der Quellcode-Dateien zu deaktivieren",
    disable_git_set_and_git_revision_used:
        "disableGit wurde gesetzt und sourceLinkTemplate enthält {gitRevision}, was mit dem Leerstring ersetzt wird, da keine Revision angegeben wurde",
    git_remote_0_not_valid: `Das angegebene Git-Remote "{0}" war nicht gültig. Links auf Quellcode-Dateien werden nicht funktionieren`,
    reflection_0_tried_to_merge_into_child_1:
        "Die Reflection {0} versuchte mittels @mergeModuleWith, sich in eines ihrer Kinder einzufügen: {1}",

    include_0_in_1_specified_2_resolved_to_3_does_not_exist:
        `{0}-Tag im Kommentar für {1} gab "{2}" zum Einbinden an, was zu "{3}" aufgelöst wurde und nicht existiert oder keine Datei ist.`,
    include_0_in_1_specified_2_circular_include_3:
        `{0}-Tag im Kommentar für {1} gab "{2}" zum Einbinden an, was in einer zyklischen Einbindung resultierte:\n\t{3}`,
    include_0_tag_in_1_specified_2_file_3_region_4_region_not_found:
        `{0}-Tag in {1} gab "{2}" zum Einbinden der Region mit Label "{4}" aus Datei "{3}" an, aber die Region wurde nicht in der Datei gefunden.`,
    include_0_tag_in_1_region_2_region_not_supported:
        `{0}-Tag in {1} gab "{2}" an, aber Regionen werden für die Dateierweiterung nicht unterstützt.`,
    include_0_tag_in_1_specified_2_file_3_region_4_region_close_not_found:
        `{0}-Tag in {1} gab "{2}" zum Einbinden der Region mit Label "{4}" aus Datei "{3}" an, aber das Kommentar zum Schließen der Region wurde nicht in der Datei gefunden.`,
    include_0_tag_in_1_specified_2_file_3_region_4_region_open_not_found:
        `{0}-Tag in {1} gab "{2}" zum Einbinden der Region mit Label "{4}" aus Datei "{3}" an, aber das Kommentar zum Öffnen einer Region wurde nicht in der Datei gefunden.`,
    include_0_tag_in_1_specified_2_file_3_region_4_region_close_found_multiple_times:
        `{0}-Tag in {1} gab "{2}" zum Einbinden der Region mit Label "{4}" aus Datei "{3}" an, aber das Kommentar zum Schließen der Region wurde mehrfach in der Datei gefunden.`,
    include_0_tag_in_1_specified_2_file_3_region_4_region_open_found_multiple_times:
        `{0}-Tag in {1} gab "{2}" zum Einbinden der Region mit Label "{4}" aus Datei "{3}" an, aber das Kommentar zum Öffnen der Region wurde mehrfach in der Datei gefunden.`,
    include_0_tag_in_1_specified_2_file_3_region_4_region_found_multiple_times:
        `{0}-Tag in {1} gab "{2}" zum Einbinden der Region mit Label "{4}" aus Datei "{3}" an, aber die Region wurde mehrfach in der Datei gefunden.`,
    include_0_tag_in_1_specified_2_file_3_region_4_region_empty:
        `{0}-Tag in {1} gab "{2}" zum Einbinden der Region mit Label "{4}" aus Datei "{3}" an. Die Region wurde gefunden, ist aber leer oder enthält nur Leerzeichen.`,
    include_0_tag_in_1_specified_2_file_3_lines_4_invalid_range:
        `{0}-Tag in {1} gab "{2}" zum Einbinden der Zeilen {4} aus Datei "{3}" an, aber ein ungültiges Intervall wurde angegeben.`,
    include_0_tag_in_1_specified_2_file_3_lines_4_but_only_5_lines:
        `{0}-Tag in {1} gab "{2}" zum Einbinden der Zeilen {4} aus Datei "{3}" an, aber die Datei hat nur {5} Zeilen.`,

    // output plugins
    custom_css_file_0_does_not_exist: "Eigene CSS-Datei unter {0} existiert nicht",
    custom_js_file_0_does_not_exist: "Eigene JavaScript-Datei unter {0} existiert nicht",
    unsupported_highlight_language_0_not_highlighted_in_comment_for_1:
        "Sprache {0} unterstützt keine Syntaxhervorhebung und wird im Kommentar {1} nicht hervorgehoben",
    unloaded_language_0_not_highlighted_in_comment_for_1:
        "Code-Block mit Sprache {0} wird keine Syntaxhervorhebung im Kommentar für {1} erfahren, da diese Sprache nicht in der Option highlightLanguages enthalten ist",
    yaml_frontmatter_not_an_object: "Erwartete ein Objekt für die YAML-Frontmatter",

    // renderer
    could_not_write_0: "{0} konnte nicht geschrieben werden",
    could_not_empty_output_directory_0: "Ausgabeverzeichnis {0} konnte nicht geleert werden",
    could_not_create_output_directory_0: "Konnte das Ausgabeverzeichnis {0} nicht erstellen",
    theme_0_is_not_defined_available_are_1: `Das Theme '{0}' ist nicht definiert. Verfügbare Themes sind: {1}`,
    router_0_is_not_defined_available_are_1: `Der Router '{0}' ist nicht definiert. Verfügbare Router sind: {1}`,
    reflection_0_links_to_1_but_anchor_does_not_exist_try_2:
        "{0} verlinkt auf {1}, aber der Anker existiert nicht. Meinten Sie vielleicht:\n\t{2}",

    // entry points
    no_entry_points_provided:
        "Einstiegspunkte wurden weder angegeben noch konnten sie aus den package.json-Exports ermittelt werden. Das ist wahrscheinlich eine Fehlerkonfiguration",
    unable_to_find_any_entry_points: "Konnte keine Einstiegspunkte finden. Beachte auch die vorigen Warnmeldungen",
    watch_does_not_support_packages_mode: "Watch-Modus unterstützt Einstiegspunkte der Art 'packages' nicht",
    watch_does_not_support_merge_mode: "Watch-Modus unterstützt Einstiegspunkte der Art 'merge' nicht",
    entry_point_0_not_in_program:
        `Der Einstiegspunkt {0} wird nicht von der Option 'files' oder 'include' in der tsconfig referenziert`,
    failed_to_resolve_0_to_ts_path:
        "Konnte den Einstiegspunktpfad {0} der package.json nicht zu einer TypeScript-Quellcode-Datei auflösen",
    use_expand_or_glob_for_files_in_dir:
        "Falls Sie Dateien aus diesem Verzeichnis einbinden wollten, setzen Sie die --entryPointStrategy auf \"expand\" oder geben Sie einen Glob an",
    glob_0_did_not_match_any_files: "Der Glob {0} passte auf keine Dateien",
    entry_point_0_did_not_match_any_files_after_exclude:
        "Der Glob {0} passte auf keine Dateien mehr, nachdem die Exclude-Patterns angewandt wurden",
    entry_point_0_did_not_exist: "Angegebener Einstiegspunkt {0} existiert nicht",
    entry_point_0_did_not_match_any_packages:
        "Der Einstiegspunkt-Glob {0} passte auf keine Verzeichnisse mit einer package.json-Datei",
    file_0_not_an_object: "Die Datei {0} ist kein Objekt",

    // deserialization
    serialized_project_referenced_0_not_part_of_project:
        "Serialisiertes Projekt referenziert Reflection {0}, welche kein Teil des Projekts ist",
    saved_relative_path_0_resolved_from_1_is_not_a_file:
        "Serialisiertes Projekt referenziert {0}, was relativ zu {1} nicht existiert",

    // options
    circular_reference_extends_0: `Zyklische Referenz im "extends"-Feld von {0} gefunden`,
    failed_resolve_0_to_file_in_1: "Konnte {0} in {1} nicht zu einer Datei auflösen",

    glob_0_should_use_posix_slash:
        `Der Glob "{0}" maskiert nichtspezielle Zeichen. Glob-Eingaben für TypeDoc dürfen keine Windows-Pfadtrennzeichen (\\) verwenden, nutzen Sie stattdessen Posix-Pfadtrennzeichen (/)`,
    option_0_can_only_be_specified_by_config_file: `Die Option '{0}' darf nur in einer Konfigurationsdatei angegeben werden`,
    option_0_expected_a_value_but_none_provided: "--{0} erwartet einen Wert, aber keiner wurde als Argument übergeben",
    unknown_option_0_may_have_meant_1: "Unbekannte Option: {0}, meinten Sie vielleicht:\n\t{1}",

    typedoc_key_in_0_ignored:
        `Das Feld 'typedoc' in {0} wurde von der entryPointStrategy \"legacy-packages\" verwendet und wird ignoriert`,
    typedoc_options_must_be_object_in_0:
        `Konnte das Feld "typedocOptions" in {0} nicht parsen, stellen Sie sicher, dass es existiert und ein Objekt enthält`,
    tsconfig_file_0_does_not_exist: "Die tsconfig-Datei {0} existiert nicht",
    tsconfig_file_specifies_options_file:
        `"typedocOptions" in der tsconfig-Datei gibt eine einzulesende Datei mit Optionen an, aber die Optionsdatei wurde schon eingelesen. Das ist wahrscheinlich ein Konfigurationsfehler`,
    tsconfig_file_specifies_tsconfig_file: `"typedocOptions" in der tsconfig-Datei darf keine tsconfig-Datei zum Einlesen angeben`,
    tags_0_defined_in_typedoc_json_overwritten_by_tsdoc_json:
        "Die {0} aus der typedoc.json werden durch die Konfiguration in der tsdoc.json überschrieben",
    failed_read_tsdoc_json_0: "Konnte tsdoc.json-Datei unter {0} nicht lesen",
    invalid_tsdoc_json_0: "Die Datei {0} ist keine gültige tsdoc.json-Datei",

    options_file_0_does_not_exist: "Die Optionsdatei {0} existiert nicht",
    failed_read_options_file_0: "Konnte {0} nicht parsen, stellen Sie sicher, dass die Datei existiert und ein Objekt exportiert",

    // plugins
    invalid_plugin_0_missing_load_function: "Ungültige Struktur im Plugin {0}, keine load-Funktion gefunden",
    plugin_0_could_not_be_loaded: "Das Plugin {0} konnte nicht geladen werden",

    // option declarations help
    help_options:
        "JSON-Datei mit Optionen, die geladen werden soll. Ist keine angegeben, schaut TypeDoc nach einer 'typedoc.json' im aktuellen Verzeichnis",
    help_tsconfig:
        "TypeScript-Konfigurationsdatei, die geladen werden soll. Ist keine angegeben, schaut TypeDoc nach einer 'tsconfig.json' im aktuellen Verzeichnis",
    help_compilerOptions: "Ausgewählte TypeScript-Compiler-Optionen überschreiben, die von TypeDoc genutzt werden",
    help_lang: "Setzt die Sprache für die generierte Dokumentation und für die von TypeDoc ausgegebenen Meldungen",
    help_locales:
        "Fügt Übersetzungen für eine bestimmte Sprache hinzu. Die Option ist hauptsächlich als Überbrückung gedacht, bis TypeDoc die Sprache offiziell unterstützt",
    help_packageOptions: "Setzt Optionen, die innerhalb jedes Packages verwendet werden, falls die entryPointStrategy auf packages gesetzt ist",

    help_entryPoints: "Die Einstiegspunkte der Dokumentation",
    help_entryPointStrategy: "Die zu nutzende Strategie, um die Einstiegspunkte in Dokumentationsmodule umzuwandeln",
    help_alwaysCreateEntryPointModule:
        "Falls gesetzt, erstellt TypeDoc immer ein `Modul` für Einstiegspunkte, selbst wenn nur eins angegeben wurde",
    help_projectDocuments:
        "Dokumente, die als Kinder zur Root-Ebene der generierten Dokumentation hinzugefügt werden sollen. Unterstützt Globs, um mehrere Dateien zu selektieren",
    help_exclude: "Patterns zum Ausschließen von Dateien, wenn nach Dateien in einem Verzeichnis gesucht wird, das als Einstiegspunkt angegeben wurde",
    help_externalPattern: "Patterns für Dateien, die als extern betrachtet werden sollen",
    help_excludeExternals: "Verhindert die Dokumentation von als extern aufgelösten Symbolen",
    help_excludeNotDocumented: "Verhindert, dass Symbole in der Dokumentation erscheinen, die nicht explizit dokumentiert wurden",
    help_excludeNotDocumentedKinds: "Arten von Reflections, die von excludeNotDocumented entfernt werden können",
    help_excludeInternal: "Verhindert, dass Symbole in der Dokumentation erscheinen, die mit @internal markiert sind",
    help_excludeCategories: "Schließt Symbole aus dieser Kategorie von der Dokumentation aus",
    help_excludePrivate: "Ignoriert private Variablen und Methoden, Standardwert ist true.",
    help_excludeProtected: "Ignoriert geschützte Variablen und Methoden",
    help_excludeReferences: "Wird ein Symbol mehrfach exportiert, ignoriere alle außer dem ersten Export",
    help_externalSymbolLinkMappings: "Definiert eigene Links für Symbole, die nicht in der Dokumentation enthalten sind",
    help_out:
        "Gibt den Pfad an, wohin die Dokumentation für die Default-Ausgabe geschrieben werden soll. Der Standard-Ausgabetyp kann von Plugins geändert werden.",
    help_html: "Gibt den Pfad an, wohin die HTML-Dokumentation geschrieben werden soll.",
    help_json: "Gibt den Pfad und den Dateinamen an, wohin eine JSON-Datei mit einer Beschreibung des Projekts geschrieben werden soll",
    help_pretty: "Gibt an, ob die JSON-Datei mit Tabs formatiert werden soll",
    help_emit: "Gibt an, was TypeDoc ausgeben soll, 'docs', 'both', oder 'none'",
    help_theme: "Gibt den Namen des Themes an, mit dem die Dokumentation erstellt werden soll",
    help_router: "Gibt den Namen des Routers an, der zum Ermitteln der Dateinamen in der Dokumentation verwendet wird",
    help_lightHighlightTheme: "Gibt das Theme für die Syntaxhervorhebung im Light-Modus an",
    help_darkHighlightTheme: "Gibt das Theme für die Syntaxhervorhebung im Dark-Modus an",
    help_highlightLanguages: "Gibt die Sprachen an, die geladen werden sollen, um Code bei der Ausgabe hervorzuheben",
    help_ignoredHighlightLanguages:
        "Gibt Sprachen an, welche als gültige Sprache für die Syntaxhervorhebung erkannt werden, aber zur Laufzeit nicht hervorgehoben werden",
    help_typePrintWidth: "Breite beim Rendern eines Typs, ab der Code in eine neue Zeile umgebrochen wird",
    help_customCss: "Pfad auf eine eigene CSS-Datei, die zusätzlich zum Theme importiert wird",
    help_customJs: "Pfade auf eine eigene einzubindende JavaScript-Datei",
    help_markdownItOptions: "Gibt Optionen an, die zu markdown-it weitergereicht werden, dem von TypeDoc verwendeten Markdown-Parser",
    help_markdownItLoader:
        "Gibt ein Callback an, das beim Laden der markdown-it-Instanz gerufen wird. Dem Callback wird die Instanz des Parsers übergeben, den TypeDoc verwenden wird",
    help_maxTypeConversionDepth: "Setzt die maximale Tiefe von Typen, bis zu der diese konvertiert werden",
    help_name: "Setzt den Namen des Projekts, der im Header des Templates verwendet wird",
    help_includeVersion: "Fügt die Package-Version zum Projektnamen hinzu",
    help_disableSources: "Deaktiviert das Setzen der Quelle, wenn eine Reflection dokumentiert wird",
    help_sourceLinkTemplate:
        "Gibt ein Link-Template an, das beim Generieren von Quelldatei-URLs verwendet wird. Wenn nicht gesetzt, wird automatisch ein Template vom Git-Remote erstellt. Unterstützt die Platzhalter {path}, {line} und {gitRevision}",
    help_gitRevision:
        "Nutzt die angegebene Revision statt der neuesten Revision zum Verlinken der Quellcode-Dateien auf GitHub/Bitbucket. Hat keinen Effekt, wenn disableSources gesetzt ist",
    help_gitRemote:
        "Nutzt das angegebene Remote zum Verlinken von Quellcode-Dateien auf GitHub/Bitbucket. Hat keinen Effekt, wenn disableGit oder disableSources gesetzt ist",
    help_disableGit:
        "Gehe davon aus, dass auf alles mit dem sourceLinkTemplate verlinkt werden kann, sourceLinkTemplate muss gesetzt sein, falls die Option aktiviert ist. Der Platzhalter {path} ist dann relativ zum basePath",
    help_basePath: "Gibt den Basispfad an, der beim Anzeigen von Dateipfaden verwendet wird",
    help_excludeTags: "Entfernt die angegebenen Block- und Modifier-Tags von den Doc-Kommentaren",
    help_notRenderedTags: "Tags, die in den Doc-Kommentaren bewahrt werden, aber in der Dokumentation nicht angezeigt werden sollen",
    help_cascadedModifierTags: "Modifier-Tags, die in alle Kinder einer Eltern-Reflection kopiert werden sollen",
    help_readme:
        "Pfad auf die Readme-Datei, die auf der Indexseite angezeigt werden soll. `none`, um die Indexseite zu deaktivieren und die Dokumentation auf der Seite mit den globalen Variablen beginnen zu lassen",
    help_cname: "Setzt den CNAME-Dateitext, nützlich für eigene Domains bei GitHub-Pages",
    help_favicon: "Pfad auf ein Favicon, welches als Icon für die Seite eingebunden werden soll",
    help_sourceLinkExternal:
        "Gibt an, dass Quelldatei-Links als externe Links behandelt und in einem neuen Tab geöffnet werden sollen",
    help_markdownLinkExternal:
        "Gibt an, dass http[s]://-Links in Kommentaren und Markdown-Dateien als externe Links behandelt und in einem neuen Tab geöffnet werden sollen",
    help_githubPages: "Erzeugt eine .nojekyll-Datei, um 404-Fehler bei GitHub-Pages zu vermeiden. Standardwert ist `true`",
    help_hostedBaseUrl:
        "Gibt die Basis-URL an, die beim Erzeugen einer sitemap.xml im Ausgabeverzeichnis und für kanonische Links verwendet wird. Wenn nicht angegeben, wird keine Sitemap erzeugt",
    help_useHostedBaseUrlForAbsoluteLinks:
        "Wenn gesetzt, erzeugt TypeDoc unter Verwendung der Option hostedBaseUrl absolute Links auf Unterseiten der Seite",
    help_hideGenerator: "Gibt den TypeDoc-Link am Ende der Seite nicht aus",
    help_customFooterHtml: "Eigener Footer nach dem TypeDoc-Link",
    help_customFooterHtmlDisableWrapper: "Wenn gesetzt, wird das Wrapper-Element um customFooterHtml nicht ausgegeben",
    help_cacheBust: "Zeitpunkt der Erstellung der Dokumentation in Links auf statische Assets inkludieren",
    help_searchInComments:
        "Wenn gesetzt, wird der Suchindex auch Kommentare enthalten. Dies wird die Größe des Suchindex stark erhöhen",
    help_searchInDocuments:
        "Wenn gesetzt, wird der Suchindex auch Dokumente enthalten. Dies wird die Größe des Suchindex stark erhöhen",
    help_cleanOutputDir: "Wenn gesetzt, löscht TypeDoc das Ausgabeverzeichnis vor dem Schreiben der Dokumentation",
    help_titleLink: "Setzt den Link des Titels im Header. Standardmäßig wird auf die Startseite der Dokumentation verlinkt",
    help_navigationLinks: "Gibt Links an, die mit in den Header geschrieben werden",
    help_sidebarLinks: "Gibt Links an, die mit in die Seitenleiste geschrieben werden",
    help_navigationLeaves: "Zweige des Navigationsbaums, die nicht ausgeklappt sein sollen",
    help_headings: "Legt fest, welche optionalen Überschriften ausgegeben werden sollen",
    help_sluggerConfiguration: "Legt fest, wie Anker im generierten HTML festgelegt werden.",
    help_navigation: "Legt fest, wie die Navigationsseitenleiste organisiert wird",
    help_includeHierarchySummary:
        "Wenn gesetzt, wird eine Übersicht der Reflection-Hierarchie auf der Zusammenfassungsseite ausgegeben. Standardwert ist `true`",
    help_visibilityFilters:
        "Gibt die standardmäßige Sichtbarkeit für eingebaute Filter sowie zusätzliche Filter anhand eines Modifier-Tags an.",
    help_searchCategoryBoosts: "Konfiguriert die Suche so, dass ausgewählte Kategorien als relevanter bewertet werden",
    help_searchGroupBoosts: 'Konfiguriert die Suche so, dass ausgewählte Symbolarten (z.B. "Klasse") als relevanter bewertet werden',
    help_useFirstParagraphOfCommentAsSummary:
        "Wenn gesetzt und kein @summary-Tag vorhanden ist, verwendet TypeDoc den ersten Absatz eines Kommentars als die Kurzzusammenfassung in der Modul- oder Namensraum-Ansicht",
    help_jsDocCompatibility:
        "Setzt Kompatibilitätsoptionen beim Parsen von Kommentaren, welche die Ähnlichkeit zu JSDoc-Kommentaren erhöhen",
    help_suppressCommentWarningsInDeclarationFiles:
        "Verhindert, dass Warnungen gemeldet werden, die durch unspezifizierte Tags innerhalb von Kommentaren in .d.ts-Dateien verursacht wurden.",
    help_commentStyle: "Legt fest, wie TypeDoc nach Kommentaren sucht",
    help_useTsLinkResolution:
        "Verwendet TypeScripts Mechanismus zur Auflösung von Links beim Ermitteln des Ziels eines @link-Tags. Betrifft nur Kommentare im JSDoc-Stil",
    help_preserveLinkText:
        "Wenn gesetzt, wird bei @link-Tags ohne expliziten Link-Text der Textinhalt als Link verwendet. Wenn nicht gesetzt, wird der Name der Ziel-Reflection verwendet",
    help_blockTags: "Block-Tags, die TypeDoc beim Parsen von Kommentaren erkennen soll",
    help_inlineTags: "Inline-Tags, die TypeDoc beim Parsen von Kommentaren erkennen soll",
    help_modifierTags: "Modifier-Tags, die TypeDoc beim Parsen von Kommentaren erkennen soll",
    help_categorizeByGroup: "Gibt an, ob die Kategorisierung auf der Gruppen-Ebene vorgenommen werden soll",
    help_groupReferencesByType:
        "Wenn gesetzt, werden Referenzen zusammen mit dem Typ, auf den sie verweisen, gruppiert und nicht innerhalb einer 'Referenzen'-Gruppe",
    help_defaultCategory: "Gibt die Standard-Kategorie für Reflections ohne eine Kategorie an",
    help_categoryOrder:
        "Gibt die Reihenfolge an, in der Kategorien erscheinen. * legt die relative Reihenfolge für Kategorien fest, die nicht in der Liste sind",
    help_groupOrder:
        "Gibt die Reihenfolge an, in der Gruppen erscheinen. * legt die relative Reihenfolge für Gruppen fest, die nicht in der Liste sind",
    help_sort: "Gibt die Sortierstrategie für dokumentierte Werte an",
    help_sortEntryPoints: "Wenn gesetzt, werden auf Einstiegspunkte die gleichen Sortierregeln angewandt, die auch für andere Reflections gelten",
    help_kindSortOrder: "Gibt die Sortierreihenfolge für Reflections an, wenn ein 'kind' festgelegt ist",
    help_watch: "Überwache Dateien auf Änderungen und baue die Dokumentation bei Änderungen neu",
    help_preserveWatchOutput: "Wenn gesetzt, leert TypeDoc den Bildschirm nicht zwischen Kompilierungsschritten",
    help_skipErrorChecking: "Führt die Typenprüfung von TypeScript nicht vor Erzeugung der Dokumentation aus",
    help_help: "Gibt diese Nachricht aus",
    help_version: "Gibt die Version von TypeDoc aus",
    help_showConfig: "Gibt die aufgelöste Konfiguration aus und stoppt",
    help_plugin: "Gibt die NPM-Plugins an, die geladen werden sollen. Nicht angeben, um alle installierten Plugins zu laden",
    help_logLevel: "Gibt an, welches Level für das Logging verwendet werden soll",
    help_treatWarningsAsErrors: "Wenn gesetzt, werden alle Warnungen als Fehler behandelt",
    help_treatValidationWarningsAsErrors:
        "Wenn gesetzt, werden alle Warnungen, die während der Validierung erzeugt wurden, als Fehler behandelt. Diese Option kann nicht zum Deaktivieren von treatWarningsAsErrors für Validierungswarnungen verwendet werden",
    help_intentionallyNotExported: "Eine Liste von Typen, welche keine Warnungen der Art 'referenziert, aber nicht dokumentiert' erzeugen sollen",
    help_requiredToBeDocumented: "Eine Liste von Reflection-Arten, die dokumentiert werden müssen",
    help_packagesRequiringDocumentation: "Eine Liste von Packages, die dokumentiert werden müssen",
    help_intentionallyNotDocumented:
        "Eine Liste von vollständigen Reflection-Namen, welche keine Warnungen erzeugen sollen, wenn sie nicht dokumentiert sind",
    help_validation: "Gibt an, welche Validierungsschritte TypeDoc auf die erzeugte Dokumentation anwenden soll",

    // ==================================================================
    // Option validation
    // ==================================================================
    unknown_option_0_you_may_have_meant_1: `Unbekannte Option '{0}'. Meinten Sie vielleicht:\n\t{1}`,
    option_0_must_be_between_1_and_2: "{0} muss zwischen {1} und {2} liegen",
    option_0_must_be_equal_to_or_greater_than_1: "{0} muss größer oder gleich {1} sein",
    option_0_must_be_less_than_or_equal_to_1: "{0} muss kleiner oder gleich {1} sein",
    option_0_must_be_one_of_1: "{0} muss enthalten sein in {1}",
    flag_0_is_not_valid_for_1_expected_2: "Das Flag '{0}' ist nicht gültig für {1}, erwartet wird {2}",
    expected_object_with_flag_values_for_0: "Erwartet für {0} wird entweder true/false oder ein Objekt mit Flag-Werten",
    flag_values_for_0_must_be_booleans: "Flag-Werte für {0} müssen Wahrheitswerte sein",
    locales_must_be_an_object:
        "Die Option 'locales' muss auf ein Objekt der folgenden Form gesetzt werden: { en: { theme_implements: \"Implements\" }}",
    exclude_not_documented_specified_0_valid_values_are_1:
        "excludeNotDocumentedKinds erlaubt nur bekannte Werte, und ungültige Werte wurden angegeben ({0}). Die gültigen Arten sind:\n{1}",
    external_symbol_link_mappings_must_be_object:
        "externalSymbolLinkMappings muss vom Typ Record<package name, Record<symbol name, link>> sein",
    highlight_theme_0_must_be_one_of_1: "{0} muss einer der folgenden Werte sein: {1}",
    highlightLanguages_contains_invalid_languages_0:
        "highlightLanguages enthält ungültige Sprachen: {0}, führen Sie typedoc --help aus, um eine Liste unterstützter Sprachen zu erhalten",
    hostedBaseUrl_must_start_with_http: "hostedBaseUrl muss mit http:// oder https:// anfangen",
    useHostedBaseUrlForAbsoluteLinks_requires_hostedBaseUrl:
        "Die Option useHostedBaseUrlForAbsoluteLinks erfordert, dass auch hostedBaseUrl gesetzt wird",
    favicon_must_have_one_of_the_following_extensions_0: "Favicon muss eine der folgenden Dateiendungen haben: {0}",
    option_0_must_be_an_object: "Die Option '{0}' muss ein Objekt (kein Array) sein",
    option_0_must_be_a_function: "Die Option '{0}' muss eine Funktion sein",
    option_0_must_be_object_with_urls: "{0} muss ein Objekt sein, mit String-Labels als Schlüssel und URLs als Werte",
    visibility_filters_only_include_0: "visibilityFilters darf nur die folgenden nicht-@-Schlüssel enthalten: {0}",
    visibility_filters_must_be_booleans: "Alle Werte von visibilityFilters müssen Wahrheitswerte sein",
    option_0_values_must_be_numbers: "Alle Werte von {0} müssen Zahlen sein",
    option_0_values_must_be_array_of_tags: "{0} muss ein Array mit gültigen Tag-Namen sein",
    option_0_specified_1_but_only_2_is_valid:
        "{0} erlaubt nur bekannte Werte, und ungültige Werte wurden angegeben ({1}). Die gültigen Sortierungsstrategien sind:\n{2}",
    option_outputs_must_be_array:
        `Option "outputs" muss ein Array aus Elementen vom Typ { name: string, path: string, options?: TypeDocOptions } sein.`,
    specified_output_0_has_not_been_defined: `Angegebene Ausgabe "{0}" wurde nicht definiert.`,

    // https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts
    alert_note: "Hinweis",
    alert_tip: "Tipp",
    alert_important: "Wichtig",
    alert_warning: "Warnung",
    alert_caution: "Achtung",

    // ReflectionKind singular translations
    kind_project: "Projekt",
    kind_module: "Modul",
    kind_namespace: "Namensraum",
    kind_enum: "Aufzählung",
    kind_enum_member: "Aufzählungselement",
    kind_variable: "Variable",
    kind_function: "Funktion",
    kind_class: "Klasse",
    kind_interface: "Schnittstelle",
    kind_constructor: "Konstruktor",
    kind_property: "Eigenschaft",
    kind_method: "Methode",
    kind_call_signature: "Aufrufsignatur",
    kind_index_signature: "Indexsignatur",
    kind_constructor_signature: "Konstruktorsignatur",
    kind_parameter: "Parameter",
    kind_type_literal: "Typenliteral",
    kind_type_parameter: "Typenparameter",
    kind_accessor: "Zugriffsfunktion",
    kind_get_signature: "Abfragesignatur",
    kind_set_signature: "Änderungssignatur",
    kind_type_alias: "Typenalias",
    kind_reference: "Referenz",
    kind_document: "Dokument",

    // ReflectionKind plural translations
    kind_plural_project: "Projekte",
    kind_plural_module: "Module",
    kind_plural_namespace: "Namensräume",
    kind_plural_enum: "Aufzählungen",
    kind_plural_enum_member: "Aufzählungselemente",
    kind_plural_variable: "Variablen",
    kind_plural_function: "Funktionen",
    kind_plural_class: "Klassen",
    kind_plural_interface: "Schnittstellen",
    kind_plural_constructor: "Konstruktoren",
    kind_plural_property: "Eigenschaften",
    kind_plural_method: "Methoden",
    kind_plural_call_signature: "Aufrufsignaturen",
    kind_plural_index_signature: "Indexsignaturen",
    kind_plural_constructor_signature: "Konstruktorsignaturen",
    kind_plural_parameter: "Parameter",
    kind_plural_type_literal: "Typenliterale",
    kind_plural_type_parameter: "Typenparameter",
    kind_plural_accessor: "Zugriffsfunktionen",
    kind_plural_get_signature: "Abfragesignaturen",
    kind_plural_set_signature: "Änderungssignaturen",
    kind_plural_type_alias: "Typenaliasse",
    kind_plural_reference: "Referenzen",
    kind_plural_document: "Dokumente",

    // ReflectionFlag translations
    flag_private: "Privat",
    flag_protected: "Geschützt",
    flag_public: "Öffentlich",
    flag_static: "Statisch",
    flag_external: "Extern",
    flag_optional: "Optional",
    flag_rest: "Rest",
    flag_abstract: "Abstrakt",
    flag_const: "Konstant",
    flag_readonly: "Schreibgeschützt",
    flag_inherited: "Geerbt",

    // ==================================================================
    // Strings that show up in the default theme
    // ==================================================================
    // Page headings/labels
    theme_implements: "Implementiert",
    theme_indexable: "Indexierbar",
    theme_type_declaration: "Typendeklaration",
    theme_index: "Index",
    theme_hierarchy: "Hierarchie",
    theme_hierarchy_summary: "Hierarchieübersicht",
    theme_hierarchy_view_summary: "Zusammenfassung anzeigen",
    theme_implemented_by: "Implementiert von",
    theme_defined_in: "Definiert in",
    theme_implementation_of: "Implementierung von",
    theme_inherited_from: "Geerbt von",
    theme_overrides: "Überschreibt",
    theme_returns: "Rückgabewert",
    theme_generated_using_typedoc: "Generiert mit TypeDoc", // If this includes "TypeDoc", theme will insert a link at that location.
    // Search
    theme_preparing_search_index: "Bereite Suchindex vor...",
    // Left nav bar
    theme_loading: "Lade...",
    // Right nav bar
    theme_settings: "Einstellungen",
    theme_member_visibility: "Member-Sichtbarkeit",
    theme_theme: "Theme",
    theme_os: "OS",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_on_this_page: "Auf dieser Seite",

    // aria-label
    theme_search: "Suchen",
    theme_menu: "Menu",
    theme_permalink: "Permalink",
    theme_folder: "Ordner",

    // Used by the frontend JS
    // For the English translations only, these should also be added to
    // src/lib/output/themes/default/assets/typedoc/Application.ts
    // Also uses theme_folder and singular kinds
    theme_copy: "Kopieren",
    theme_copied: "Kopiert!",
    theme_normally_hidden: "Dieser Member ist normalerweise aufgrund der Filtereinstellungen versteckt.",
    theme_hierarchy_expand: "Ausklappen",
    theme_hierarchy_collapse: "Einklappen",
    theme_search_index_not_available: "Der Suchindex ist nicht verfügbar",
    theme_search_no_results_found_for_0: "Keine Resultate gefunden für {0}",
    theme_search_placeholder: "Dokumentation durchsuchen",
});
