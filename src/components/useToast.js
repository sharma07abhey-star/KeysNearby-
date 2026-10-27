import { useDispatch } from "react-redux";
import { pushToast } from "../store/uiSlice";

// const toast = useToast();  toast({ title: "Saved", message: "..." })
export function useToast() {
  const dispatch = useDispatch();
  return (options) => dispatch(pushToast(options));
}
