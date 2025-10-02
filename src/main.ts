import { sound } from "@pixi/sound";
import { setEngine } from "./app/getEngine";
import { LoadScreen } from "./app/screens/LoadScreen";
import { MainScreen } from "./app/screens/main/MainScreen";
import { userSettings } from "./app/utils/userSettings";
import { CreationEngine } from "./engine/engine";

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
		resizeOptions: { minWidth: 1280, minHeight: 720, letterbox: false },
		// useBackBuffer: true,
	});

	// Initialize the user settings
	userSettings.init();

	// Show the load screen
	await engine.navigation.showScreen(LoadScreen);
	// Show the main screen once the load screen is dismissed
	await engine.navigation.showScreen(MainScreen);
})();
