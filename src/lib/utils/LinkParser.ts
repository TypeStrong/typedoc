import * as Util from "util";


import { Reflection } from "../models/reflections/abstract";
import { ProjectReflection } from "../models/reflections/index";

/**
 * A plugin that builds links in markdown texts.
 */
export class LinkParser {
  /**
   * The project that is currently processed.
   */
  private project: ProjectReflection;

  /**
   * Regular expression for detecting inline tags like {@link ...}.
   */
  private inlineTag: RegExp = /(?:\[(.+?)\])?\{@(link|linkcode|linkplain)\s+((?:.|\n)+?)\}/gi;

  /**
   * Regular expression to test if a string looks like an external url.
   */
  private urlPrefix: RegExp = /^(http|ftp)s?:\/\//;
  private linkPrefix: string;


  constructor(project: ProjectReflection, linkPrefix?: string) {
    this.project = project;
    this.linkPrefix = linkPrefix != null ? linkPrefix : '';
  }


  /**
   * Find symbol {@link ...} strings in text and turn into html links
   *
   * @param text  The string in which to replace the inline tags.
   * @return      The updated string.
   */
  private replaceInlineTags(text: string): string {
    let that = this;
    return text.replace(this.inlineTag, (match: string, leading: string, tagName: string, content: string): string => {
      var split = that.splitLinkText(content);
      var target = split.target;
      var caption = leading || split.caption;

      var monospace: boolean;
      if (tagName == 'linkcode') monospace = true;
      if (tagName == 'linkplain') monospace = false;

      return this.buildLink(match, target, caption, monospace);
    });
  }


  /**
   * Format a link with the given text and target.
   *
   * @param original   The original link string, will be returned if the target cannot be resolved..
   * @param target     The link target.
   * @param caption    The caption of the link.
   * @param monospace  Whether to use monospace formatting or not.
   * @returns A html link tag.
   */
  private buildLink(original: string, target: string, caption: string, monospace?: boolean): string {
    let attributes = '';
    if (this.urlPrefix.test(target)) {
      attributes = ' class="external"';
    } else {
      let reflection: Reflection;
      reflection = this.project.findReflectionByName(target);

      if (reflection && reflection.url) {
        target = reflection.url;
      } else {
        //console.log('Link could not be resolved : ' + original);
        return caption;
      }
    }

    if (monospace) {
      caption = '<code>' + caption + '</code>';
    }

    return Util.format('<a href="%s%s"%s>%s</a>', this.linkPrefix, target, attributes, caption);
  }


  /**
   * Triggered when [[MarkedPlugin]] parses a markdown string.
   *
   * @param event
   */
  public parseMarkdown(text: string) {
    return this.replaceInlineTags(text);
  }


  /**
   * Split the given link into text and target at first pipe or space.
   *
   * @param text  The source string that should be checked for a split character.
   * @returns An object containing the link text and target.
   */
  private splitLinkText(text: string): { caption: string; target: string; } {
    var splitIndex = text.indexOf('|');
    if (splitIndex === -1) {
      splitIndex = text.search(/\s/);
    }

    if (splitIndex !== -1) {
      return {
        caption: text.substr(splitIndex + 1).replace(/\n+/, ' '),
        target: text.substr(0, splitIndex)
      };
    } else {
      return {
        caption: text,
        target: text
      };
    }
  }
}
