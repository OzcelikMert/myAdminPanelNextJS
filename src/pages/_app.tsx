import type {AppProps} from 'next/app'
import React from "react";
import {LanguageId, Languages} from "constants/languages";
import localStorageUtil from "utils/localStorage.util";
import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import ThemeUtil from "utils/theme.util";

import "styles/global.scss";

import "library/variable/array"
import "library/variable/string"
import "library/variable/number"
import "library/variable/date"
import "library/variable/math"

import AppAdmin from "components/app";

import English from "languages/en.json"
import Turkish from "languages/tr.json"


const language = i18n.use(initReactI18next);

language.init({
    resources: {
        en: {translation: English},
        tr: {translation: Turkish}
    },
    keySeparator: false,
    lng: Languages.findSingle("id", localStorageUtil.adminLanguage.get)?.code || window.navigator.language.slice(0, 2) || Languages[0].code,
    fallbackLng: Languages.findSingle("id", LanguageId.English)?.code || Languages[0].code,
    interpolation: {
        escapeValue: false
    }
});

function App(props: AppProps) {
    (new ThemeUtil(localStorageUtil.adminIsDarkTheme.get)).setThemeColor();
    return (
        <AppAdmin {...props} />
    )
}

export default App;