import localeUtils = require("../locale-utils.cjs");

export = localeUtils.buildIncompleteTranslation({
    loaded_multiple_times_0:
        "TypeDoc a été chargé plusieurs fois. Cela est généralement dû à des plugins qui ont leur propre installation de TypeDoc. Les chemins chargés sont :\n\t{0}",
    unsupported_ts_version_0:
        "Vous utilisez une version de TypeScript non supportée ! Si TypeDoc plante, c'est probablement pour cette raison. TypeDoc supporte {0}",
    no_compiler_options_set:
        "Aucune option de compilation définie. Cela signifie probablement que TypeDoc n'a pas trouvé votre fichier tsconfig.json. La documentation générée sera probablement vide",

    loaded_plugin_0: "Plugin chargé {0}",

    solution_not_supported_in_watch_mode:
        "Le fichier tsconfig fourni semble être un tsconfig de type 'solution', ce qui n'est pas supporté en mode watch",
    strategy_not_supported_in_watch_mode:
        "entryPointStrategy doit être défini sur 'resolve' ou 'expand' pour le mode watch",
    file_0_changed_restarting: "Le fichier de configuration {0} a changé : redémarrage complet requis...",
    file_0_changed_rebuilding: "Le fichier {0} a changé : reconstruction de la sortie...",
    found_0_errors_and_1_warnings: "{0} erreurs et {1} avertissements trouvés",

    output_0_could_not_be_generated: "La sortie {0} n'a pas pu être générée à cause des erreurs ci-dessus",
    output_0_generated_at_1: "{0} généré à {1}",

    no_entry_points_for_packages:
        "Aucun point d'entrée fourni pour le mode packages, la documentation ne peut pas être générée",
    failed_to_find_packages:
        "Échec de la recherche de packages, assurez-vous d'avoir fourni au moins un répertoire comme point d'entrée contenant un package.json",
    nested_packages_unsupported_0:
        "Le projet à {0} a entryPointStrategy défini sur packages, mais les packages imbriqués ne sont pas supportés",
    package_option_0_should_be_specified_at_root:
        "L'option packageOptions définit l'option {0}, qui n'a d'effet qu'au niveau racine",
    previous_error_occurred_when_reading_options_for_0:
        "L'erreur précédente s'est produite lors de la lecture des options pour le package à {0}",
    converting_project_at_0: "Conversion du projet à {0}",
    failed_to_convert_packages: "Échec de la conversion d'un ou plusieurs packages, le résultat ne sera pas fusionné",
    merging_converted_projects: "Fusion des projets convertis",

    no_entry_points_to_merge: "Aucun point d'entrée fourni à fusionner",
    entrypoint_did_not_match_files_0: "Le glob de point d'entrée {0} ne correspond à aucun fichier",
    failed_to_parse_json_0: "Échec de l'analyse du fichier à {0} en tant que json",

    failed_to_read_0_when_processing_document_tag_in_1:
        "Échec de la lecture du fichier {0} lors du traitement de la balise @document pour le commentaire dans {1}",
    failed_to_read_0_when_processing_project_document:
        "Échec de la lecture du fichier {0} lors de l'ajout du document de projet",
    failed_to_read_0_when_processing_document_child_in_1:
        "Échec de la lecture du fichier {0} lors du traitement des enfants du document dans {1}",
    frontmatter_children_0_should_be_an_array_of_strings_or_object_with_string_values:
        "Les enfants frontmatter dans {0} doivent être un tableau de chaînes ou un objet avec des valeurs de chaîne",
    converting_union_as_interface:
        "L'utilisation de @interface sur un type union supprimera les propriétés non présentes sur toutes les branches de l'union. La sortie de TypeDoc pourrait ne pas décrire fidèlement votre code source",
    converting_0_as_class_requires_value_declaration:
        "La conversion de {0} en tant que classe nécessite une déclaration qui représente une valeur non-type",
    converting_0_as_class_without_construct_signatures:
        "{0} est converti en tant que classe, mais n'a aucune signature de construction",

    comment_for_0_should_not_contain_block_or_modifier_tags:
        "Le commentaire pour {0} ne devrait contenir aucune balise de bloc ou de modificateur",

    symbol_0_has_multiple_declarations_with_comment:
        "{0} a plusieurs déclarations avec un commentaire. Un commentaire arbitraire sera utilisé",
    comments_for_0_are_declared_at_1: "Les commentaires pour {0} sont déclarés à :\n\t{1}",

    multiple_type_parameters_on_template_tag_unsupported:
        "TypeDoc ne supporte pas plusieurs paramètres de type définis dans une seule balise @template avec un commentaire",
    failed_to_find_jsdoc_tag_for_name_0:
        "Échec de la recherche de la balise JSDoc pour {0} après l'analyse du commentaire, veuillez signaler un bug",
    relative_path_0_is_not_a_file_and_will_not_be_copied_to_output:
        "Le chemin relatif {0} n'est pas un fichier et ne sera pas copié dans le répertoire de sortie",

    inline_inheritdoc_should_not_appear_in_block_tag_in_comment_at_0:
        "Une balise @inheritDoc en ligne ne devrait pas apparaître dans une balise de bloc car elle ne sera pas traitée dans le commentaire à {0}",
    at_most_one_remarks_tag_expected_in_comment_at_0:
        "Au plus une balise @remarks est attendue dans un commentaire, ignorance de toutes sauf la première dans le commentaire à {0}",
    at_most_one_returns_tag_expected_in_comment_at_0:
        "Au plus une balise @returns est attendue dans un commentaire, ignorance de toutes sauf la première dans le commentaire à {0}",
    at_most_one_inheritdoc_tag_expected_in_comment_at_0:
        "Au plus une balise @inheritDoc est attendue dans un commentaire, ignorance de toutes sauf la première dans le commentaire à {0}",
    content_in_summary_overwritten_by_inheritdoc_in_comment_at_0:
        "Le contenu de la section résumé sera écrasé par la balise @inheritDoc dans le commentaire à {0}",
    content_in_remarks_block_overwritten_by_inheritdoc_in_comment_at_0:
        "Le contenu du bloc @remarks sera écrasé par la balise @inheritDoc dans le commentaire à {0}",
    example_tag_literal_name:
        "La première ligne d'une balise d'exemple sera prise littéralement comme nom de l'exemple, et ne doit contenir que du texte",
    inheritdoc_tag_properly_capitalized: "La balise @inheritDoc doit être correctement capitalisée",
    treating_unrecognized_tag_0_as_modifier: "Traitement de la balise non reconnue {0} comme une balise de modificateur",
    unmatched_closing_brace: "Accolade fermante non correspondante",
    unescaped_open_brace_without_inline_tag: "Accolade ouvrante non échappée rencontrée sans balise en ligne",
    unknown_block_tag_0: "Balise de bloc inconnue {0} rencontrée",
    unknown_inline_tag_0: "Balise en ligne inconnue {0} rencontrée",
    open_brace_within_inline_tag:
        "Accolade ouvrante rencontrée dans une balise en ligne, c'est probablement une erreur",
    inline_tag_not_closed: "La balise en ligne n'est pas fermée",

    failed_to_resolve_link_to_0_in_comment_for_1: "Échec de la résolution du lien vers \"{0}\" dans le commentaire pour {1}",
    failed_to_resolve_link_to_0_in_comment_for_1_may_have_meant_2:
        "Échec de la résolution du lien vers \"{0}\" dans le commentaire pour {1}. Vous vouliez peut-être \"{2}\"",
    failed_to_resolve_link_to_0_in_readme_for_1: "Échec de la résolution du lien vers \"{0}\" dans le lisez-moi pour {1}",
    failed_to_resolve_link_to_0_in_readme_for_1_may_have_meant_2:
        "Échec de la résolution du lien vers \"{0}\" dans le lisez-moi pour {1}. Vous vouliez peut-être \"{2}\"",
    failed_to_resolve_link_to_0_in_document_1: "Échec de la résolution du lien vers \"{0}\" dans le document {1}",
    failed_to_resolve_link_to_0_in_document_1_may_have_meant_2:
        "Échec de la résolution du lien vers \"{0}\" dans le document {1}. Vous vouliez peut-être \"{2}\"",
    type_0_defined_in_1_is_referenced_by_2_but_not_included_in_docs:
        "{0}, défini dans {1}, est référencé par {2} mais n'est pas inclus dans la documentation",
    reflection_0_kind_1_defined_in_2_does_not_have_any_documentation:
        "{0} ({1}), défini dans {2}, n'a aucune documentation",
    invalid_intentionally_not_documented_names_0:
        "Les noms de réflexion qualifiés suivants ont été marqués comme intentionnellement non documentés, mais n'ont pas été référencés dans la documentation, ou ont été documentés :\n\t{0}",
    invalid_intentionally_not_exported_symbols_0:
        "Les symboles suivants ont été marqués comme intentionnellement non exportés, mais n'ont pas été référencés dans la documentation, ou ont été exportés :\n\t{0}",
    reflection_0_has_unused_mergeModuleWith_tag: "{0} a une balise @mergeModuleWith qui n'a pas pu être résolue",
    reflection_0_links_to_1_with_text_2_but_resolved_to_3:
        "\"{0}\" lie vers \"{1}\" avec le texte \"{2}\" qui existe mais n'a pas de lien dans la documentation, liera vers \"{3}\" à la place.",

    not_all_search_category_boosts_used_0:
        "Toutes les catégories spécifiées dans searchCategoryBoosts n'ont pas été utilisées dans la documentation. Les catégories inutilisées sont :\n\t{0}",
    not_all_search_group_boosts_used_0:
        "Tous les groupes spécifiés dans searchGroupBoosts n'ont pas été utilisés dans la documentation. Les groupes inutilisés sont :\n\t{0}",
    comment_for_0_includes_categoryDescription_for_1_but_no_child_in_group:
        "Le commentaire pour {0} inclut @categoryDescription pour \"{1}\", mais aucun enfant n'est placé dans cette catégorie",
    comment_for_0_includes_groupDescription_for_1_but_no_child_in_group:
        "Le commentaire pour {0} inclut @groupDescription pour \"{1}\", mais aucun enfant n'est placé dans ce groupe",
    label_0_for_1_cannot_be_referenced:
        "Le label \"{0}\" pour {1} ne peut pas être référencé avec une référence de déclaration. Les labels ne peuvent contenir que A-Z, 0-9 et _, et ne peuvent pas commencer par un nombre",
    modifier_tag_0_is_mutually_exclusive_with_1_in_comment_for_2:
        "La balise de modificateur {0} est mutuellement exclusive avec {1} dans le commentaire pour {2}",
    signature_0_has_unused_param_with_name_1: "La signature {0} a un @param avec le nom \"{1}\", qui n'est pas utilisé",
    declaration_reference_in_inheritdoc_for_0_not_fully_parsed:
        "La référence de déclaration dans @inheritDoc pour {0} n'a pas été entièrement analysée et peut se résoudre incorrectement",
    failed_to_find_0_to_inherit_comment_from_in_1:
        "Échec de la recherche de \"{0}\" pour hériter du commentaire dans le commentaire pour {1}",
    reflection_0_tried_to_copy_comment_from_1_but_source_had_no_comment:
        "{0} a essayé de copier un commentaire de {1} avec @inheritDoc, mais la source n'a aucun commentaire associé",
    inheritdoc_circular_inheritance_chain_0: "@inheritDoc spécifie une chaîne d'héritage circulaire : {0}",
    provided_readme_at_0_could_not_be_read: "Le chemin README fourni, {0}, n'a pas pu être lu",
    defaulting_project_name:
        "L'option --name n'a pas été spécifiée, et aucun package.json n'a été trouvé. Nom du projet par défaut : \"Documentation\"",
    disable_git_set_but_not_source_link_template:
        "disableGit est défini, mais sourceLinkTemplate ne l'est pas, donc les liens sources ne peuvent pas être produits. Définissez un sourceLinkTemplate ou disableSources pour empêcher le suivi des sources",
    disable_git_set_and_git_revision_used:
        "disableGit est défini et sourceLinkTemplate contient {gitRevision}, qui sera remplacé par une chaîne vide car aucune révision n'a été fournie",
    git_remote_0_not_valid: "Le dépôt distant git fourni \"{0}\" n'est pas valide. Les liens sources seront cassés",
    reflection_0_tried_to_merge_into_child_1:
        "La réflexion {0} a essayé d'utiliser @mergeModuleWith pour fusionner dans l'un de ses enfants : {1}",

    custom_css_file_0_does_not_exist: "Le fichier CSS personnalisé à {0} n'existe pas",
    custom_js_file_0_does_not_exist: "Le fichier JavaScript personnalisé à {0} n'existe pas",
    unsupported_highlight_language_0_not_highlighted_in_comment_for_1:
        "La langue de coloration syntaxique non supportée {0} ne sera pas colorée dans le commentaire pour {1}",
    unloaded_language_0_not_highlighted_in_comment_for_1:
        "Le bloc de code avec la langue {0} ne sera pas coloré dans le commentaire pour {1} car il n'est pas inclus dans l'option highlightLanguages",
    yaml_frontmatter_not_an_object: "Frontmatter YAML attendu en tant qu'objet",

    could_not_write_0: "Impossible d'écrire {0}",
    could_not_empty_output_directory_0: "Impossible de vider le répertoire de sortie {0}",
    could_not_create_output_directory_0: "Impossible de créer le répertoire de sortie {0}",
    theme_0_is_not_defined_available_are_1: "Le thème '{0}' n'est pas défini. Les thèmes disponibles sont : {1}",
    router_0_is_not_defined_available_are_1: "Le routeur '{0}' n'est pas défini. Les routeurs disponibles sont : {1}",
    reflection_0_links_to_1_but_anchor_does_not_exist_try_2:
        "{0} lie vers {1}, mais l'ancre n'existe pas. Vous vouliez peut-être :\n\t{2}",

    no_entry_points_provided:
        "Aucun point d'entrée n'a été fourni ou découvert à partir des exports de package.json, c'est probablement une erreur de configuration",
    unable_to_find_any_entry_points: "Impossible de trouver des points d'entrée. Voir les avertissements précédents",
    watch_does_not_support_packages_mode: "Le mode watch ne supporte pas les points d'entrée de style 'packages'",
    watch_does_not_support_merge_mode: "Le mode watch ne supporte pas les points d'entrée de style 'merge'",
    entry_point_0_not_in_program:
        "Le point d'entrée {0} n'est pas référencé par l'option 'files' ou 'include' dans votre tsconfig",
    failed_to_resolve_0_to_ts_path:
        "Échec de la résolution du chemin du point d'entrée {0} depuis package.json vers un fichier source TypeScript",
    use_expand_or_glob_for_files_in_dir:
        "Si vous vouliez inclure des fichiers à l'intérieur de ce répertoire, définissez --entryPointStrategy sur 'expand' ou spécifiez un glob",
    glob_0_did_not_match_any_files: "Le glob {0} n'a correspondu à aucun fichier",
    entry_point_0_did_not_match_any_files_after_exclude:
        "Le glob {0} n'a correspondu à aucun fichier après application des motifs d'exclusion",
    entry_point_0_did_not_exist: "Le point d'entrée fourni {0} n'existe pas",
    entry_point_0_did_not_match_any_packages:
        "Le glob de point d'entrée {0} n'a correspondu à aucun répertoire contenant un package.json",
    file_0_not_an_object: "Le fichier {0} n'est pas un objet",

    serialized_project_referenced_0_not_part_of_project:
        "Le projet sérialisé référence la réflexion {0}, qui ne fait pas partie du projet",
    saved_relative_path_0_resolved_from_1_does_not_exist:
        "Le projet sérialisé référence {0}, qui n'existe pas par rapport à {1}",

    circular_reference_extends_0: "Référence circulaire rencontrée pour le champ \"extends\" de {0}",
    failed_resolve_0_to_file_in_1: "Échec de la résolution de {0} vers un fichier dans {1}",

    glob_0_should_use_posix_slash:
        "Le glob \"{0}\" échappe un caractère non spécial. Les entrées glob pour TypeDoc ne peuvent pas utiliser les séparateurs de chemin Windows (\\), essayez de les remplacer par des séparateurs de chemin posix (/)",
    option_0_can_only_be_specified_by_config_file: "L'option '{0}' ne peut être spécifiée que via un fichier de configuration",
    option_0_expected_a_value_but_none_provided: "--{0} attendait une valeur, mais aucune n'a été fournie en argument",
    unknown_option_0_may_have_meant_1: "Option inconnue : {0}, vous vouliez peut-être :\n\t{1}",

    typedoc_key_in_0_ignored:
        "La clé 'typedoc' dans {0} était utilisée par l'entryPointStrategy legacy-packages et sera ignorée",
    typedoc_options_must_be_object_in_0:
        "Échec de l'analyse du champ \"typedocOptions\" dans {0}, assurez-vous qu'il existe et contient un objet",
    tsconfig_file_0_does_not_exist: "Le fichier tsconfig {0} n'existe pas",
    tsconfig_file_specifies_options_file:
        "\"typedocOptions\" dans le fichier tsconfig spécifie un fichier d'options à lire mais le fichier d'options a déjà été lu. C'est probablement une erreur de configuration",
    tsconfig_file_specifies_tsconfig_file: "\"typedocOptions\" dans le fichier tsconfig ne peut pas spécifier un fichier tsconfig à lire",
    tags_0_defined_in_typedoc_json_overwritten_by_tsdoc_json:
        "Les {0} définis dans typedoc.json seront écrasés par la configuration dans tsdoc.json",
    failed_read_tsdoc_json_0: "Échec de la lecture du fichier tsdoc.json à {0}",
    invalid_tsdoc_json_0: "Le fichier {0} n'est pas un fichier tsdoc.json valide",

    options_file_0_does_not_exist: "Le fichier d'options {0} n'existe pas",
    failed_read_options_file_0: "Échec de l'analyse de {0}, assurez-vous qu'il existe et exporte un objet",

    invalid_plugin_0_missing_load_function: "Structure invalide dans le plugin {0}, aucune fonction load trouvée",
    plugin_0_could_not_be_loaded: "Le plugin {0} n'a pas pu être chargé",

    help_options:
        "Spécifie un fichier d'options json qui doit être chargé. Si non spécifié, TypeDoc cherchera 'typedoc.json' dans le répertoire courant",
    help_tsconfig:
        "Spécifie un fichier de configuration TypeScript qui doit être chargé. Si non spécifié, TypeDoc cherchera 'tsconfig.json' dans le répertoire courant",
    help_compilerOptions: "Surcharge sélectivement les options du compilateur TypeScript utilisées par TypeDoc",
    help_lang: "Définit la langue à utiliser dans la génération et dans les messages de TypeDoc",
    help_locales:
        "Ajoute des traductions pour une locale spécifiée. Cette option est principalement destinée à être utilisée comme solution temporaire en attendant le support officiel de la locale dans TypeDoc",
    help_packageOptions: "Définit les options qui seront appliquées à chaque package lorsque entryPointStrategy est défini sur packages",

    help_entryPoints: "Les points d'entrée de votre documentation",
    help_entryPointStrategy: "La stratégie à utiliser pour convertir les points d'entrée en modules de documentation",
    help_alwaysCreateEntryPointModule:
        "Lorsque activé, TypeDoc créera toujours un `Module` pour les points d'entrée, même si un seul est fourni",
    help_projectDocuments:
        "Documents qui doivent être ajoutés en tant qu'enfants à la racine de la documentation générée. Supporte les globs pour correspondre à plusieurs fichiers",
    help_exclude: "Définit les motifs à exclure lors de l'expansion d'un répertoire spécifié comme point d'entrée",
    help_externalPattern: "Définit les motifs pour les fichiers qui doivent être considérés comme externes",
    help_excludeExternals: "Empêche les symboles résolus de manière externe d'être documentés",
    help_excludeNotDocumented: "Empêche les symboles qui ne sont pas explicitement documentés d'apparaître dans les résultats",
    help_excludeNotDocumentedKinds: "Spécifie le type de réflexions qui peuvent être supprimées par excludeNotDocumented",
    help_excludeInternal: "Empêche les symboles marqués avec @internal d'être documentés",
    help_excludeCategories: "Exclut les symboles de cette catégorie de la documentation",
    help_excludeProtected: "Ignore les variables et méthodes protégées",
    help_excludeReferences: "Si un symbole est exporté plusieurs fois, ignore tout sauf le premier export",
    help_externalSymbolLinkMappings: "Définit des liens personnalisés pour les symboles non inclus dans la documentation",
    help_out:
        "Spécifie l'emplacement où la documentation pour la sortie par défaut doit être écrite. Le type de sortie par défaut peut être modifié par des plugins.",
    help_html: "Spécifie l'emplacement où la documentation HTML doit être écrite.",
    help_json: "Spécifie l'emplacement et le nom du fichier JSON décrivant le projet",
    help_pretty: "Spécifie si la sortie JSON doit être formatée avec des tabulations",
    help_emit: "Spécifie ce que TypeDoc doit émettre, 'docs', 'both', ou 'none'",
    help_theme: "Spécifie le nom du thème pour rendre la documentation",
    help_router: "Spécifie le nom du routeur à utiliser pour déterminer les noms de fichiers dans la documentation",
    help_lightHighlightTheme: "Spécifie le thème de coloration syntaxique en mode clair",
    help_darkHighlightTheme: "Spécifie le thème de coloration syntaxique en mode sombre",
    help_highlightLanguages: "Spécifie les langues qui seront chargées pour colorer le code lors du rendu",
    help_ignoredHighlightLanguages:
        "Spécifie les langues qui seront acceptées comme langues de coloration valides, mais ne seront pas colorées à l'exécution",
    help_typePrintWidth: "Largeur à laquelle le code doit être renvoyé à la ligne lors du rendu d'un type",
    help_customCss: "Chemin vers un fichier CSS personnalisé pour l'import du thème",
    help_customJs: "Chemin vers un fichier JS personnalisé à importer",
    help_markdownItOptions: "Spécifie les options passées à markdown-it, le parseur Markdown utilisé par TypeDoc",
    help_markdownItLoader:
        "Spécifie un callback à appeler lors du chargement de l'instance markdown-it. L'instance du parseur utilisé par TypeDoc lui sera passée",
    help_maxTypeConversionDepth: "Définit la profondeur maximale des types à convertir",
    help_name: "Définit le nom du projet qui sera utilisé dans l'en-tête du template",
    help_includeVersion: "Ajoute la version du package au nom du projet",
    help_disableSources: "Désactive la définition de la source d'une réflexion lors de sa documentation",
    help_sourceLinkTemplate:
        "Spécifie un template de lien à utiliser lors de la génération des URLs sources. Si non défini, sera créé automatiquement via le dépôt distant git. Supporte les espaces réservés {path}, {line}, {gitRevision}",
    help_gitRevision:
        "Utilise la révision spécifiée au lieu de la dernière révision pour lier aux fichiers sources GitHub/Bitbucket. Sans effet si disableSources est activé",
    help_gitRemote:
        "Utilise le dépôt distant spécifié pour lier aux fichiers sources GitHub/Bitbucket. Sans effet si disableGit ou disableSources est activé",
    help_disableGit:
        "Suppose que tout peut être lié avec sourceLinkTemplate, sourceLinkTemplate doit être défini si activé. {path} sera relatif à basePath",
    help_basePath: "Spécifie le chemin de base à utiliser lors de l'affichage des chemins de fichiers",
    help_excludeTags: "Supprime les balises de bloc/modificateur listées des commentaires de documentation",
    help_notRenderedTags: "Balises qui seront conservées dans les commentaires, mais non rendues lors de la création de la sortie",
    help_cascadedModifierTags: "Balises de modificateur qui doivent être copiées vers tous les enfants de la réflexion parente",
    help_readme:
        "Chemin vers le fichier lisez-moi qui doit être affiché sur la page d'index. Passez `none` pour désactiver la page d'index et commencer la documentation sur la page des globales",
    help_cname: "Définit le texte du fichier CNAME, utile pour les domaines personnalisés sur GitHub Pages",
    help_favicon: "Chemin vers le favicon à inclure comme icône du site",
    help_sourceLinkExternal:
        "Spécifie que les liens sources doivent être traités comme des liens externes à ouvrir dans un nouvel onglet",
    help_markdownLinkExternal:
        "Spécifie que les liens http[s]:// dans les commentaires et fichiers markdown doivent être traités comme des liens externes à ouvrir dans un nouvel onglet",
    help_githubPages: "Génère un fichier .nojekyll pour prévenir les erreurs 404 sur GitHub Pages. Par défaut à `true`",
    help_hostedBaseUrl:
        "Spécifie une URL de base à utiliser pour générer un sitemap.xml dans notre dossier de sortie et les liens canoniques. Si non spécifié, aucun sitemap ne sera généré",
    help_useHostedBaseUrlForAbsoluteLinks:
        "Si activé, TypeDoc produira des liens absolus vers les pages de votre site en utilisant l'option hostedBaseUrl",
    help_hideGenerator: "Ne pas afficher le lien TypeDoc en bas de la page",
    help_customFooterHtml: "Pied de page personnalisé après le lien TypeDoc",
    help_customFooterHtmlDisableWrapper: "Si activé, désactive l'élément d'enveloppe pour customFooterHtml",
    help_cacheBust: "Inclut l'heure de génération dans les liens vers les ressources statiques",
    help_searchInComments:
        "Si activé, l'index de recherche inclura également les commentaires. Cela augmentera considérablement la taille de l'index de recherche",
    help_searchInDocuments:
        "Si activé, l'index de recherche inclura également les documents. Cela augmentera considérablement la taille de l'index de recherche",
    help_cleanOutputDir: "Si activé, TypeDoc supprimera le répertoire de sortie avant d'écrire la sortie",
    help_titleLink: "Définit le lien vers lequel pointe le titre dans l'en-tête. Par défaut la page d'accueil de la documentation",
    help_navigationLinks: "Définit les liens à inclure dans l'en-tête",
    help_sidebarLinks: "Définit les liens à inclure dans la barre latérale",
    help_navigationLeaves: "Branches de l'arbre de navigation qui ne doivent pas être étendues",
    help_navigation: "Détermine comment la barre latérale de navigation est organisée",
    help_visibilityFilters:
        "Spécifie la visibilité par défaut pour les filtres intégrés et les filtres supplémentaires selon les balises de modificateur",
    help_searchCategoryBoosts: "Configure la recherche pour donner un boost de pertinence aux catégories sélectionnées",
    help_searchGroupBoosts: "Configure la recherche pour donner un boost de pertinence aux types sélectionnés (ex: \"classe\")",
    help_jsDocCompatibility:
        "Définit les options de compatibilité pour l'analyse des commentaires qui augmentent la similarité avec les commentaires JSDoc",
    help_commentStyle: "Détermine comment TypeDoc recherche les commentaires",
    help_useTsLinkResolution:
        "Utilise la résolution de lien de TypeScript pour déterminer où pointent les balises @link. Cela ne s'applique qu'aux commentaires de style JSDoc",
    help_preserveLinkText:
        "Si activé, les balises @link sans texte de lien utiliseront le contenu textuel comme lien. Si non activé, utilisera le nom de la réflexion cible",
    help_blockTags: "Balises de bloc que TypeDoc doit reconnaître lors de l'analyse des commentaires",
    help_inlineTags: "Balises en ligne que TypeDoc doit reconnaître lors de l'analyse des commentaires",
    help_modifierTags: "Balises de modificateur que TypeDoc doit reconnaître lors de l'analyse des commentaires",
    help_categorizeByGroup: "Spécifie si la catégorisation sera faite au niveau du groupe",
    help_defaultCategory: "Spécifie la catégorie par défaut pour les réflexions sans catégorie",
    help_categoryOrder:
        "Spécifie l'ordre dans lequel les catégories apparaissent. * indique l'ordre relatif pour les catégories non présentes dans la liste",
    help_groupOrder:
        "Spécifie l'ordre dans lequel les groupes apparaissent. * indique l'ordre relatif pour les groupes non présentes dans la liste",
    help_sort: "Spécifie la stratégie de tri pour les valeurs documentées",
    help_sortEntryPoints: "Si activé, les points d'entrée seront soumis aux mêmes règles de tri que les autres réflexions",
    help_kindSortOrder: "Spécifie l'ordre de tri pour les réflexions lorsqu'un 'kind' est spécifié",
    help_watch: "Surveille les fichiers pour les changements et reconstruit la documentation lors d'un changement",
    help_preserveWatchOutput: "Si activé, TypeDoc n'effacera pas l'écran entre les passes de compilation",
    help_skipErrorChecking: "Ne pas lancer la vérification de type de TypeScript avant de générer la documentation",
    help_help: "Affiche ce message",
    help_version: "Affiche la version de TypeDoc",
    help_showConfig: "Affiche la configuration résolue et quitte",
    help_plugin:
        "Spécifie les plugins npm qui doivent être chargés. Omettez pour charger tous les plugins installés",
    help_logLevel: "Spécifie le niveau de journalisation à utiliser",
    help_treatWarningsAsErrors: "Si activé, tous les avertissements seront traités comme des erreurs",
    help_treatValidationWarningsAsErrors:
        "Si activé, les avertissements émis lors de la validation seront traités comme des erreurs. Cette option ne peut pas être utilisée pour désactiver treatWarningsAsErrors pour les avertissements de validation",
    help_intentionallyNotExported: "Une liste de types qui ne doivent pas produire d'avertissements 'référencé mais non documenté'",
    help_requiredToBeDocumented: "Une liste de types de réflexions qui doivent être documentés",
    help_validation: "Spécifie les étapes de validation que TypeDoc doit effectuer sur votre documentation générée",

    unknown_option_0_you_may_have_meant_1: "Option inconnue '{0}'. Vous vouliez peut-être :\n\t{1}",
    option_0_must_be_between_1_and_2: "{0} doit être entre {1} et {2}",
    option_0_must_be_equal_to_or_greater_than_1: "{0} doit être supérieur ou égal à {1}",
    option_0_must_be_less_than_or_equal_to_1: "{0} doit être inférieur ou égal à {1}",
    option_0_must_be_one_of_1: "{0} doit être l'un de {1}",
    flag_0_is_not_valid_for_1_expected_2: "Le drapeau '{0}' n'est pas valide pour {1}, attendu l'un de {2}",
    expected_object_with_flag_values_for_0: "Attendu un objet avec des valeurs de drapeaux pour {0} ou true/false",
    flag_values_for_0_must_be_booleans: "Les valeurs de drapeaux pour {0} doivent être des booléens",
    locales_must_be_an_object:
        "L'option 'locales' doit être définie sur un objet ressemblant à : { en: { theme_implements: \"Implements\" }}",
    exclude_not_documented_specified_0_valid_values_are_1:
        "excludeNotDocumentedKinds ne peut spécifier que des valeurs connues, et des valeurs invalides ont été fournies ({0}). Les types valides sont :\n{1}",
    external_symbol_link_mappings_must_be_object:
        "externalSymbolLinkMappings doit être un Record<package name, Record<symbol name, link>>",
    highlight_theme_0_must_be_one_of_1: "{0} doit être l'un des suivants : {1}",
    highlightLanguages_contains_invalid_languages_0:
        "highlightLanguages contient des langues invalides : {0}, lancez typedoc --help pour une liste des langues supportées",
    hostedBaseUrl_must_start_with_http: "hostedBaseUrl doit commencer par http:// ou https://",
    useHostedBaseUrlForAbsoluteLinks_requires_hostedBaseUrl:
        "L'option useHostedBaseUrlForAbsoluteLinks nécessite que hostedBaseUrl soit défini",
    favicon_must_have_one_of_the_following_extensions_0: "Le favicon doit avoir l'une des extensions suivantes : {0}",
    option_0_must_be_an_object: "L'option '{0}' doit être un objet non-tableau",
    option_0_must_be_a_function: "L'option '{0}' doit être une fonction",
    option_0_must_be_object_with_urls: "{0} doit être un objet avec des labels de chaîne comme clés et des URLs comme valeurs",
    visibility_filters_only_include_0: "visibilityFilters ne peut inclure que les clés suivantes sans @ : {0}",
    visibility_filters_must_be_booleans: "Toutes les valeurs de visibilityFilters doivent être des booléens",
    option_0_values_must_be_numbers: "Toutes les valeurs de {0} doivent être des nombres",
    option_0_values_must_be_array_of_tags: "{0} doit être un tableau de noms de balises valides",
    option_0_specified_1_but_only_2_is_valid:
        "{0} ne peut spécifier que des valeurs connues, et des valeurs invalides ont été fournies ({1}). Les stratégies de tri valides sont :\n{2}",

    alert_note: "Note",
    alert_tip: "Conseil",
    alert_important: "Important",
    alert_warning: "Avertissement",
    alert_caution: "Attention",

    kind_project: "Projet",
    kind_module: "Module",
    kind_namespace: "Espace de noms",
    kind_enum: "Énumération",
    kind_enum_member: "Membre d'énumération",
    kind_variable: "Variable",
    kind_function: "Fonction",
    kind_class: "Classe",
    kind_interface: "Interface",
    kind_constructor: "Constructeur",
    kind_property: "Propriété",
    kind_method: "Méthode",
    kind_call_signature: "Signature d'appel",
    kind_index_signature: "Signature d'index",
    kind_constructor_signature: "Signature de constructeur",
    kind_parameter: "Paramètre",
    kind_type_literal: "Littéral de type",
    kind_type_parameter: "Paramètre de type",
    kind_accessor: "Accesseur",
    kind_get_signature: "Signature d'obtention",
    kind_set_signature: "Signature de définition",
    kind_type_alias: "Alias de type",
    kind_reference: "Référence",
    kind_document: "Document",

    kind_plural_project: "Projets",
    kind_plural_module: "Modules",
    kind_plural_namespace: "Espaces de noms",
    kind_plural_enum: "Énumérations",
    kind_plural_enum_member: "Membres d'énumération",
    kind_plural_variable: "Variables",
    kind_plural_function: "Fonctions",
    kind_plural_class: "Classes",
    kind_plural_interface: "Interfaces",
    kind_plural_constructor: "Constructeurs",
    kind_plural_property: "Propriétés",
    kind_plural_method: "Méthodes",
    kind_plural_call_signature: "Signatures d'appel",
    kind_plural_index_signature: "Signatures d'index",
    kind_plural_constructor_signature: "Signatures de constructeur",
    kind_plural_parameter: "Paramètres",
    kind_plural_type_literal: "Littéraux de type",
    kind_plural_type_parameter: "Paramètres de type",
    kind_plural_accessor: "Accesseurs",
    kind_plural_get_signature: "Signatures d'obtention",
    kind_plural_set_signature: "Signatures de définition",
    kind_plural_type_alias: "Alias de type",
    kind_plural_reference: "Références",
    kind_plural_document: "Documents",

    flag_private: "Privé",
    flag_protected: "Protégé",
    flag_public: "Public",
    flag_static: "Statique",
    flag_external: "Externe",
    flag_optional: "Optionnel",
    flag_rest: "Reste",
    flag_abstract: "Abstrait",
    flag_const: "Constante",
    flag_readonly: "Lecture seule",
    flag_inherited: "Hérité",

    theme_implements: "Implémente",
    theme_indexable: "Indexable",
    theme_type_declaration: "Déclaration de type",
    theme_index: "Index",
    theme_hierarchy: "Hiérarchie",
    theme_hierarchy_summary: "Résumé de la hiérarchie",
    theme_hierarchy_view_summary: "Voir le résumé",
    theme_implemented_by: "Implémenté par",
    theme_defined_in: "Défini dans",
    theme_implementation_of: "Implémentation de",
    theme_inherited_from: "Hérité de",
    theme_overrides: "Surcharge",
    theme_returns: "Retourne",
    theme_generated_using_typedoc: "Généré avec TypeDoc",
    theme_preparing_search_index: "Préparation de l'index de recherche...",
    theme_loading: "Chargement...",
    theme_settings: "Paramètres",
    theme_member_visibility: "Visibilité des membres",
    theme_theme: "Thème",
    theme_os: "Système",
    theme_light: "Clair",
    theme_dark: "Sombre",
    theme_on_this_page: "Sur cette page",

    theme_search: "Recherche",
    theme_menu: "Menu",
    theme_permalink: "Permalien",
    theme_folder: "Dossier",

    theme_copy: "Copier",
    theme_copied: "Copié !",
    theme_normally_hidden: "Ce membre est normalement masqué en raison de vos paramètres de filtrage.",
    theme_hierarchy_expand: "Développer",
    theme_hierarchy_collapse: "Réduire",
    theme_search_index_not_available: "L'index de recherche n'est pas disponible",
    theme_search_no_results_found_for_0: "Aucun résultat trouvé pour {0}",
    theme_search_placeholder: "Rechercher dans la documentation",
});
