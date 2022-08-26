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

    case "create_monitor_light":
      return {
        ...state,
        monitorLight: action.monitorLight,
      };

    case "create_tank_light":
      return {
        ...state,
        tankLight: action.tankLight,
      };

    case "create_lamp_light":
      return {
        ...state,
        lampLight: action.lampLight,
      };

    default:
      return state;
  }
};

export const initialState = {
  theme: false,
  reduxSections: [],
  camera: {},
  monitorLight: {},
  tankLight: {},
  lampLight: {},
};

export default reducer;
