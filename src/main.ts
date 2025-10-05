import "pixi.js/math-extras";
import { sound } from "@pixi/sound";
import { setEngine } from "./app/getEngine";
import { LoadScreen } from "./app/screens/LoadScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";
import { StartScreen } from "./app/screens/StartScreen";

/**
 * Importing these modules will automatically register their plugins with the engine.
 */
import "@pixi/sound";
// import "pixi.js/advanced-blend-modes";
// import "@esotericsoftware/spine-pixi-v8";
sound.disableAutoPause = true;

// Create a new creation engine instance
const engine = new CreationEngine();
setEngine(engine);

(async () => {
	// Initialize the creation engine instance
	await engine.init({
		background: "#1E1E1E",
		resizeOptions: { minWidth: 1080, minHeight: 1920, letterbox: false },
		// useBackBuffer: true,
	});

	// Initialize the user settings
	userSettings.init();

	// Show the load screen
	await engine.navigation.showScreen(LoadScreen);
	// Show the main screen once the load screen is dismissed
	await engine.navigation.showScreen(StartScreen);
})();
