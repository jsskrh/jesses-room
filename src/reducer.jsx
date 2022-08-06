const reducer = (state, action) => {
  switch (action.type) {
    case "toggle_theme":
      return {
        ...state,
        theme: !state.theme,
      };

    default:
      return state;
  }
};

export const initialState = {
  theme: false,
};

export default reducer;
