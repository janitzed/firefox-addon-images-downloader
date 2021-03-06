import * as React from 'react';

const DE = {
  exclude: 'Für den Zip Export ignorieren',
  restoreExclude: 'Wieder für den ZIP export freigeben',
  saveToFavourites: 'URL (Online Pfad des Fotos) zu der lokalen Favouriten Liste hinzufügen',
  removeFromFavourites: 'URL (Online Pfad des Fotos) von der lokalen favouriten Liste entfernen',
  download_base64: 'Download als base64',
  loading: 'Laden...',
  links: 'Links',
  img_tag: 'Foto vom Tag',
  img_requests: 'Foto von Anfrage',
  img_from_request: 'Fotos von Anfragen',
  img_from_tags: 'Fotos von <img /> Tag von der Wesbite',
  addon_not_available: 'Diese Webseite unterstützt keine Addons',
  NoDataBlockedItems: 'Keine blockierten Daten',
  home_chat: 'Mit Freunden chatten - ohne Tracking',
  home_messages: 'Nachrichten senden - ohne Tracking',
  home_security: 'Sicherheit im Internet - Blockierung von Trackern',
  home_images_1: 'Fotos herunterladen im originalem Format',
  home_images_2: 'Fotos einzeln herunterladen',
  home_images_3: 'Fotos gebündelt herunterladen',
  /** 
   * Left menu
   */
  actions: 'Schnelle Aktionen',
  messages_main: 'Nachrichten',
  menu_text_messages: 'Nachrichten',
  menu_title_messages: 'Navigiere zu den Nachrichten',
  menu_text_notifications: 'Benachrichtigungen',
  menu_title_notifications: 'Navigiere zu den Benachrichtigungen',
  menu_text_favourites: 'Freunde',
  menu_title_favourites: 'Navigiere zu den Freunde',
  menu_text_add_favourites: 'Suche',
  menu_title_add_favourites: 'Navigiere zu der Freunden Suche',
  chat_main: 'Chat',
  menu_text_chat: 'Chat',
  menu_title_chat: 'Navigiere zu dem Chat',
  menu_text_security: 'Sicherheit',
  menu_text_security_main: 'Listen',
  menu_title_security: 'Navigiere zu dem Bereich Sicherheit',
  menu_text_security_settings: 'Einstellungen',
  menu_title_security_settings: 'Navigiere zu dem Bereich Sicherheits Einstellungen',
  menu_text_cookies: 'Cookies',
  menu_title_cookies: 'Navigiere zu dem Bereich Cookies',
  menu_text_home: 'Startseite',
  menu_title_home: 'Navigiere zur Startseite',
  menu_text_iframes: 'Iframes',
  menu_title_iframes: 'Navigiere zu dem Bereich Iframes',
  menu_text_security_examples: 'Beispiele',
  menu_title_security_examples: 'Navigiere zu dem Bereich Sichereich Beispiele',
  menu_text_download_images: 'Fotos herunterladen',
  menu_title_download_images: 'Navigiere zu dem Bereich Fotos herunterladen',
  menu_text_images: 'Fotos',
  menu_text_images_favourites: 'Gespeicherte Fotos',
  menu_title_images_favourites: 'Navigiere zu dem Bereich gespiecherte Fotos',
  /** 
   * GLOBAL ERROR MESSEAGES
   */
  globalNetworkError: 'Netzwerk Fehler.',
  globalProcessError: 'Interner Fehler.',
  globalUserDoesNotExsists: 'Benutzerkonto existiert nicht',
  globalInvalidEmailsAdress: 'Ungültiges E-Mail-Adressformat',
  globalErrormessagePrefix: 'Es wurde ein Fehler gefunden, der dazu führt, dass die Anwendung nicht ordnungsgemäß funktioniert.',
  globalErrormessageCloseButton: 'Ignorieren',
  globalErrormessageLearnMoreButton: 'Mehr lesen',
  globalInvalidCountry: 'Fehlerhaftes Land',
  globalInvalidLanguage: 'Fehlerhafte Sprache',
  globalErrorCodeTitle: 'Fehlercode',
  globalErrorCode_1: 'Netzwerkfehler. Wenn ein Netzwerkfehler aufgetreten ist, ist eine "Ajax" -Anforderung fehlgeschlagen. Überprüfen Sie Ihre Netzwerkverbindung oder das, da der Remote-Dienst derzeit nicht verfügbar ist.',
  globalErrorCode_2: 'App-Prozessfehler. Dies bedeutet, dass die Antwort auf Ajax-Anforderungen eine ungültige Struktur für die Anwendung bereitgestellt hat.',
  globalErrorCode_3: 'Antwort anders als erwartet. Der Mittelwert des angeforderten Werts des aktuellen Anwendungskontexts ist ungültig.',
  code: 'Code',
  listNotSynchronizedUserNotLoggedIn: 'Du bist nicht eingeloggt deshalb kann diese Liste nicht synchronisiert werden',
  notLoggedIn: 'Nicht eingeloggt Fehler',
  listSynchronized_one: 'Element synchronisiert',
  listSynchronized_more: 'Elemente synchronisiert',
  example: 'Beispiele',
  /**
   * Images download 
   */
  imagesPopupTitle: 'Fotos wurden gefunden',
  imagesNoData: 'Keine validen Fotos vorhanden',
  imagesNoDataFavourites: 'Keine gespeicherten Fotos vorhanden',
  imagesLoadingTabs: 'Aktive tabs werden geladen...',
  current_tabs_title: 'Offene Tabs',
  filter: 'Filtern nach Typ',
  filter_all: 'Alle',
  itemsPerSite: 'Anzahl der Foto je Seite',
  itemsPerSiteSuffix: 'Fotos',
  page: 'Seite',
  of: 'von',
  images: 'Fotos',
  current_favourites_images: 'Derzeit gespeicherte Fotos',
  open_in_new_tab: 'Im neuen Tab öffnen',
  download: 'Herunterladen',
  downloadSmall: 'Herunterladen der Fotos',
  delete_all: 'Alle löschen',
  notLoggedInImagesFavouritesAdd: 'Nur angemeldete Benutzer können Bilder zur Favoritenliste hinzufügen',
  notLoggedInImagesFavouritesManage: 'Nur angemeldete Benutzer können die Favoritenliste verwalten',
  tabsNoData: 'Keine validen Tabs vorhanden',
  imagesLoadingData: 'Fotos werden geladen...',
  /*
   * List actions 
   */
  infoItemAdded: 'Eintrag wurde in die Liste hinzugefügt',
  infoItemRemoved: 'Eintrag wurde aus der Liste entfernt',
  infoArrayIs0: 'Liste ist leer, daher kann kein Element entfernt werden',
  infoIncorrectValue: 'Wert ist nicht valide',
  infoItemInList: 'Eintrag bereits in der Liste vorhanden',
  popup_title_dashboard: 'Dashboard',
  country: 'Land',
  countriesNotFoundText: 'Sorry, dieses Land habe ich nicht gefunden',
  dropText: 'Hier loslassen',
  error: 'Fehler',
  languages: 'Sprachen',
  allowToSave: 'Erlaube die Generierung eines Download Buttons auf der Hauptseite, bei jedem Foto (Prüfung neuer Fotos jede 10 Sekunden).',
  fastAllowToSave: 'Generiere ein Download Button für die jetztige Seite. Bitte denken Sie daran, das Herunterladen von Bildtypen zuzulassen (von der Einstellungsseite).',
  fastGenerateSlider: 'Generieren Sie einen Schieberegler, der auf allen Bildern basiert, die auf der aktuellen Website verfügbar sind.',
  settings: 'Einstellungen',
  downloadicon: 'Setzte ein Benutzerdefiniertes Download Icon.',
  allowGifs: 'Erlaube die Download Generierung für gif`s (.gif).',
  allowPngs: 'Erlaube die Download Generierung für png`s (.png).',
  allowJpgs: 'Erlaube die Download Generierung für jpg`s (.jpg/ .jpeg).',
  allowSvgs: 'Erlaube die Download Generierung für svg`s (.svg).',
  allowIcos: 'Erlaube die Download Generierung für icon`s (.ico).',
  allowWebp: 'Erlaube die Download Generierung für webp`s (.webp).',
  downloadiconsize: 'Stellen Sie die Größe (Schriftgröße) des benutzerdefinierten Download-Symbols in px ein.',
  filterByImagesWidth: 'Erlaube die Download Generierung für Fotos deren Breite (X - Achse) die gößer/ oder gleich sind als dieser Wert. Die negativen werte (-1 oder 0) werden ignoriert.',
  filterByImagesHeight: 'Erlaube die Download Generierung für Fotos deren Höhe (Y - Achse) die gößer/ oder gleich sind als dieser Wert. Die negativen werte (-1 oder 0) werden ignoriert.'
};

export default DE;
