import { assertIsDeclarationReflection, __partials__ } from "../../lib";
import * as React from "react";
import { ContainerReflection } from "../../../../models";
export const members = (props: ContainerReflection) =>
    props.categories && props.categories.length > 0
        ? props.categories.map((item) => (
              <>
                  {!item.allChildrenHaveOwnDocument() && (
                      <>

                          <section className={"tsd-panel-group tsd-member-group " + props.cssClasses}>
                              <h2>{item.title}</h2>
                              {item.children.map((item) => (
                                  <>{!item.hasOwnDocument && <> {__partials__.member(assertIsDeclarationReflection(item))}</>}</>
                              ))}
                          </section>
                      </>
                  )}
              </>
          ))
        : props.groups?.map((item) => (
              <>{!item.allChildrenHaveOwnDocument() && <> {__partials__.membersGroup(item)}</>}</>
          ));
