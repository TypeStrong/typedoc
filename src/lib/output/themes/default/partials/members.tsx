import { assertIsDeclarationReflection } from "../../lib";
import { DefaultThemeRenderContext } from "../DefaultThemeRenderContext";
import * as React from "react";
import { ContainerReflection } from "../../../../models";
export const members =
    ({ partials }: DefaultThemeRenderContext) =>
    (props: ContainerReflection) =>
        props.categories && props.categories.length > 0
            ? props.categories.map((item) => (
                  <>
                      {!item.allChildrenHaveOwnDocument() && (
                          <>
                              <section className={"tsd-panel-group tsd-member-group " + props.cssClasses}>
                                  <h2>{item.title}</h2>
                                  {item.children.map((item) => (
                                      <>
                                          {!item.hasOwnDocument && (
                                              <> {partials.member(assertIsDeclarationReflection(item))}</>
                                          )}
                                      </>
                                  ))}
                              </section>
                          </>
                      )}
                  </>
              ))
            : props.groups?.map((item) => (
                  <>{!item.allChildrenHaveOwnDocument() && <> {partials.membersGroup(item)}</>}</>
              ));
