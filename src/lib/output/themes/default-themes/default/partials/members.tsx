import { With, relativeURL, wbr, __partials__, Compact, IfCond, IfNotCond, Markdown } from "../../lib";
import React from "react";
export const members = (props) =>
    Boolean(props.categories)
        ? props.categories.map((item, i) => (
              <>
                  {!item.allChildrenHaveOwnDocument && (
                      <>
                          {" "}
                          <section className={"tsd-panel-group tsd-member-group " + item.cssClasses}>
                              <h2>{item.title}</h2>
                              {item.children.map((item, i) => (
                                  <>{!item.hasOwnDocument && <> {__partials__.member(item)}</>}</>
                              ))}{" "}
                          </section>
                      </>
                  )}
              </>
          ))
        : props.groups.map((item, i) => (
              <>{!item.allChildrenHaveOwnDocument && <> {__partials__.membersGroup(item)}</>}</>
          ));
