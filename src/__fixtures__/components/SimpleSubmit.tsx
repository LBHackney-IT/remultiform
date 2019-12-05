import PropTypes from "prop-types";
import React from "react";

import { SubmitProps } from "../../components/Submit";

export type SimpleSubmitProps = SubmitProps;

export const SimpleSubmit: React.FunctionComponent<SimpleSubmitProps> = (
  props: SimpleSubmitProps
): JSX.Element => {
  const { onSubmit } = props;

  return (
    <button onClick={onSubmit} data-testid="submit">
      Next page
    </button>
  );
};

SimpleSubmit.displayName = "SimpleSubmit";

SimpleSubmit.propTypes = {
  onSubmit: PropTypes.func.isRequired
};
