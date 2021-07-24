import { __partials__ } from "../../lib";
import * as React from "react";
export const members = (props) =>
    props.categories
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
