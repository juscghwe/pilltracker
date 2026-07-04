import "@material/web/button/filled-button.js";
import "@material/web/button/outlined-button.js";
import "@material/web/button/text-button.js";

import "@material/web/textfield/outlined-text-field.js";
import "@material/web/select/outlined-select.js";
import "@material/web/select/select-option.js";

import "@material/web/checkbox/checkbox.js";
import "@material/web/tabs/tabs.js";
import "@material/web/tabs/primary-tab.js";
import "@material/web/iconbutton/icon-button.js";
import "@material/web/progress/circular-progress.js";

import { styles as typescaleStyles } from "@material/web/typography/md-typescale-styles.js";

const typescaleStyleSheet = typescaleStyles.styleSheet;

if (typescaleStyleSheet) {
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, typescaleStyleSheet];
}
