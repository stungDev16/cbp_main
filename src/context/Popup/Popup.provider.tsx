import PopupContext from "@/context/Popup/Popup.context";
import type { ClassValue } from "clsx";
import { type ReactNode, useRef, useState } from "react";
import type { ProviderProps } from "../interface/Provider.types";

interface PopupState {
  content: ReactNode;
  isOpen: boolean;
}

const PopupProvider = ({ children }: ProviderProps) => {
  const [popupState, setPopupState] = useState<PopupState>({
    content: null,
    isOpen: false,
  });
  const [classNames, setClassNames] = useState<{
    wrapper: ClassValue;
    content: ClassValue;
  }>({
    wrapper: "",
    content: "",
  });

  const [contentAction, setContentAction] = useState("");

  const action = useRef(() => {});

  const openPopup = (content: ReactNode) => {
    setPopupState({ content, isOpen: true });
  };

  const closePopup = () => {
    setPopupState({ content: null, isOpen: false });
    setClassNames({
      wrapper: "",
      content: "",
    });
    setContentAction("");
    action.current = () => {};
  };
  return (
    <PopupContext.Provider
      value={{
        content: popupState.content,
        isOpen: popupState.isOpen,
        open: openPopup,
        close: closePopup,
        classNames,
        setClassNames,
        action,
        contentAction,
        setContentAction,
      }}
    >
      {children}
    </PopupContext.Provider>
  );
};

export default PopupProvider;
