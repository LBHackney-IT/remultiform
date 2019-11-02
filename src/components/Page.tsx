import PropTypes, { ValidationMap } from "prop-types";
import React from "react";

import PageComponentWrapper, {
  pageComponentWrapperPropType
} from "../helpers/PageComponentWrapper";

export interface PageProps {
  componentWrappers: PageComponentWrapper[];
}

export class Page extends React.Component<PageProps> {
  static propTypes: ValidationMap<PageProps> = {
    componentWrappers: PropTypes.arrayOf(pageComponentWrapperPropType)
      .isRequired
  };

  render(): JSX.Element {
    const { componentWrappers } = this.props;

    return <>{componentWrappers.map(({ key, render }) => render(key))}</>;
  }
}

export default Page;
