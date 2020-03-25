import Link from "next/link";
import React from "react";
import { SubmitProps, submitPropTypes } from "remultiform/step";

export const makeSubmit = ({
  href,
  value,
}: {
  href: string;
  value: string;
}): React.FunctionComponent<SubmitProps> => {
  const Submit = ({ onSubmit }: SubmitProps): JSX.Element => {
    return (
      <Link href={href}>
        <button onClick={onSubmit}>{value}</button>
      </Link>
    );
  };

  Submit.displayName = "Submit";

  Submit.propTypes = {
    ...submitPropTypes,
  };

  return Submit;
};
