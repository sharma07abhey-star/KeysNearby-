import { useState } from "react";

/*
  useForm - controlled-form helper.

  - values:   current input values (controlled inputs)
  - errors:   result of validate(values), recalculated on every render
  - a field's error is only *shown* after the user leaves it (touched) or
    after the first submit attempt, so the form is not red from the start.
*/
export function useForm({ initialValues, validate, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [touched, setTouched] = useState({});
  const [submitCount, setSubmitCount] = useState(0);

  const errors = validate ? validate(values) : {};
  const isValid = Object.keys(errors).length === 0;

  function setValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleChange(event) {
    const { name, type, value, checked } = event.target;
    setValue(name, type === "checkbox" ? checked : value);
  }

  function handleBlur(event) {
    setTouched((current) => ({ ...current, [event.target.name]: true }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitCount((count) => count + 1);

    if (!isValid) {
      // move keyboard focus to the first invalid field
      const first = Object.keys(errors)[0];
      document.getElementById(`field-${first}`)?.focus();
      return;
    }
    onSubmit(values);
  }

  function reset(next = initialValues) {
    setValues(next);
    setTouched({});
    setSubmitCount(0);
  }

  function getFieldProps(name) {
    const show = touched[name] || submitCount > 0;
    return {
      name,
      value: values[name] ?? "",
      onChange: handleChange,
      onBlur: handleBlur,
      error: show ? errors[name] : "",
    };
  }

  return { values, errors, isValid, setValue, handleSubmit, reset, getFieldProps };
}
