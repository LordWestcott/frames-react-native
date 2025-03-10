import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { framesReducer } from "./utils/reducer";
import {
  FramesContextType,
  FramesProps,
  FramesState,
  FramesDispatch,
} from "./types/types";
import { log } from "./utils/logger";
import { tokenize, formatDataForTokenization } from "./utils/http";

export const FramesContext = React.createContext({} as FramesContextType);

const Frames = (props: FramesProps) => {
  // @ts-ignore
  
  
  const [state, dispatch]: [FramesState, FramesDispatch] = React.useReducer(
    framesReducer,
    {
      cardNumber: null,
      cardBin: {
        bin: null,
        scheme: null,
      },
      cardType: null,
      cardIcon: undefined,
      expiryDate: null,
      cvv: null,
      cvvLength: 3,
      validation: {
        cardNumber: false,
        expiryDate: false,
        cvv: false,
        card: false,
      },
      newState:null,
    }
  );
  
   useEffect(function  () {
        if(props.newState!=null){
            state.cardNumber = props.newState.cardNumber;
            state.expiryDate = props.newState.expiryDate;
            state.cardBin = props.newState.cardBin;
            if(props.newState.cardNumber!=null){
                dispatch({ type: CARD_CHANGE, payload: props.newState.cardNumber });
                submitCard();
            }
        }
   }, [state.cardNumber, state.expiryDate,state.cardBin]);
  
  var reloadFrameState = async(newState)=>{
        state = newState;
    }
  
 
  
  const loadState = async () => {
    return state;
  }
  
  const submitCard = async () => {
    try {
      log(
        "info",
        "com.checkout.frames-mobile-sdk.token_requested",
        props.config
      );
      let response = await tokenize(
        formatDataForTokenization(state, props.config)
      );
      if (props.config.debug)
        console.info(`Emitting "cardTokenized"`, response);
      if (props.cardTokenized) props.cardTokenized(response);
      log(
        "info",
        "com.checkout.frames-mobile-sdk.token_response",
        props.config
      );
    } catch (error) {
      if (props.config.debug)
        console.info(`Emitting "cardTokenizationFailed"`, error);
      if (props.cardTokenizationFailed) props.cardTokenizationFailed(error);
      log(
        "error",
        "com.checkout.frames-mobile-sdk.exception",
        props.config,
        error
      );
    }
  };

  useEffect(() => {
    if (state.cardBin.bin !== null) {
      if (props.config.debug)
        console.info(`Emitting "cardBinChanged"`, state.cardBin);
      if (props.cardBinChanged) props.cardBinChanged(state.cardBin);
    }
  }, [state.cardBin]);

  useEffect(() => {
    if (state.cardNumber !== null) {
      let payload = {
        element: "card-number",
        isValid: state.validation.cardNumber,
        isEmpty: state.cardNumber.length === 0,
      };

      if (props.config.debug)
        console.info(`Emitting "frameValidationChanged"`, payload);
      if (props.frameValidationChanged) props.frameValidationChanged(payload);
    }
  }, [state.validation.cardNumber]);

  useEffect(() => {
    if (state.expiryDate !== null) {
      let payload = {
        element: "expiry-date",
        isValid: state.validation.expiryDate,
        isEmpty: state.expiryDate.length === 0,
      };

      if (props.config.debug)
        console.info(`Emitting "frameValidationChanged"`, payload);

      if (props.frameValidationChanged) props.frameValidationChanged(payload);
    }
  }, [state.validation.expiryDate]);

  useEffect(() => {
    if (state.cvv !== null) {
      let payload = {
        element: "cvv",
        isValid: state.validation.cvv,
        isEmpty: state.cvv.length === 0,
      };

      if (props.config.debug)
        console.info(`Emitting "frameValidationChanged"`, payload);

      if (props.frameValidationChanged) props.frameValidationChanged(payload);
    }
  }, [state.validation.cvv]);

  useEffect(() => {
    if (state.cardType !== null) {
      let payload = {
        isValid:
          state.validation.cardNumber &&
          state.validation.expiryDate &&
          state.validation.cvv,
        paymentMethod: state.cardType,
      };

      if (props.config.debug)
        console.info(`Emitting "paymentMethodChanged"`, payload);

      if (props.paymentMethodChanged) props.paymentMethodChanged(payload);
    }
  }, [state.cardType]);

  useEffect(() => {
    if (state.cardNumber) {
      let payload = {
        isValid: state.validation.card,
        isElementValid: {
          cardNumber: state.validation.cardNumber,
          expiryDate: state.validation.expiryDate,
          cvv: state.validation.cvv,
        },
      };

      if (props.config.debug)
        console.info(`Emitting "cardValidationChanged"`, payload);

      if (props.cardValidationChanged) props.cardValidationChanged(payload);
    }
  }, [state.validation.card]);

  return (
    <View style={[styles.container, props.style]}>
      <FramesContext.Provider value={{ state, dispatch, submitCard,reloadFrameState }}>
        {props.children}
      </FramesContext.Provider>
    </View>
  );
};

export default Frames;

export const FramesConsumer = FramesContext.Consumer;
export const FramesProvider = FramesContext.Provider;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
