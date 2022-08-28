const reducer = (state, action) => {
  switch (action.type) {
    case "toggle_theme":
      return {
        ...state,
        theme: !state.theme,
      };

    case "create_sections":
      const sectionExists = state.reduxSections.some(
        (section) => section === action.section
      );
      if (!sectionExists) {
        return {
          ...state,
          reduxSections: [...state.reduxSections, action.section],
        };
      } else {
        return state;
      }

    case "create_camera":
      return {
        ...state,
        camera: action.camera,
      };

    case "create_circle_first":
      return {
        ...state,
        circleFirst: action.circleFirst,
      };

    case "create_circle_second":
      return {
        ...state,
        circleSecond: action.circleSecond,
      };

    case "create_circle_third":
      return {
        ...state,
        circleThird: action.circleThird,
      };

    case "create_room_children":
      return {
        ...state,
        roomChildren: action.roomChildren,
      };

    case "create_text_refs":
      return {
        ...state,
        textRefs: action.textRefs,
      };

    default:
      return state;
  }
};

export const initialState = {
  theme: false,
  reduxSections: [],
  camera: {},
  circleFirst: {},
  circleSecond: {},
  circleThird: {},
  roomChildren: {},
  textRefs: {},
};

export default reducer;
