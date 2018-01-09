export abstract class Screen {
    model: any;                          // Model of the screen. Assume no valid model if the model is not overridden in inheritance class.
    screenName: string = "ScreenName";   // Name of the Screen.
    noModel: boolean = false;            // Does the screen have a valid model.
    options = {                          // Options of the Screen.
        width: '900px',
        height: '900px',
        save: true,                       // Save button.
        close: true,                      // Close button.
    }
}

export default Screen;
