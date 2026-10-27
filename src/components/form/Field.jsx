/*
  Reusable form control. One component renders an <input>, <select> or
  <textarea> together with its label, hint and error message, so every
  form in the app looks and behaves the same.

  Usage:  <Field label="Email" type="email" {...getFieldProps("email")} />
*/
export default function Field({
  label,
  name,
  as = "input",
  error,
  hint,
  full = false,
  options = [],
  prefix,
  ...rest
}) {
  const id = `field-${name}`;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const common = {
    id,
    name,
    className: `ui-control${error ? " has-error" : ""}`,
    "aria-invalid": error ? "true" : undefined,
    "aria-describedby": describedBy,
    ...rest,
  };

  let control;
  if (as === "select") {
    control = (
      <select {...common}>
        {options.map((option) => {
          const item = typeof option === "string" ? { value: option, label: option } : option;
          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
    );
  } else if (as === "textarea") {
    control = <textarea rows={4} {...common} />;
  } else {
    control = <input {...common} />;
  }

  return (
    <div className={`ui-field${full ? " full" : ""}`}>
      {label && <label htmlFor={id}>{label}</label>}
      {prefix ? (
        <div className="ui-prefixed">
          <span>{prefix}</span>
          {control}
        </div>
      ) : (
        control
      )}
      {error ? (
        <small id={`${id}-error`} className="ui-error" role="alert">
          {error}
        </small>
      ) : hint ? (
        <small id={`${id}-hint`} className="ui-hint">
          {hint}
        </small>
      ) : null}
    </div>
  );
}
