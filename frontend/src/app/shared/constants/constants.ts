export const wsURL = window.location.origin.includes('https') ? 'wss://' + window.location.host + '/ws' : 'ws://127.0.0.1:9000/ws';

export const version = '0.2.4'

export const releaseDate = '2018-07-27'

export const URL = 'http://127.0.0.1:9000/';

export class OPTIONTYPE {
    name: string;
    value: string;
    allow_delay: boolean;
}

export class SUITETEST {
    type: string;
    name: string;
    order: number;
}

export const ACTIONS = [
    { name: 'Click', value: 'click', allow_delay: false },
    { name: 'Right Click', value: 'rclick', allow_delay: false },
    { name: 'Double Click', value: 'doubleclick', allow_delay: false },
    { name: 'Wait', value: 'wait', allow_delay: true },
    { name: 'Keyboard Input', value: 'type', allow_delay: false },
    { name: 'Hotkey', value: 'keycombo', allow_delay: false }
];

export const KEYS = [
    { name: 'ADD', value: '{ADD}' },
    { name: 'ALT', value: '{ALT}' },
    { name: 'BACKSPACE', value: '{BACKSPACE}' },
    { name: 'CAPS_LOCK', value: '{CAPS_LOCK}' },
    { name: 'CMD', value: '{CMD}' },
    { name: 'CTRL', value: '{CTRL}' },
    { name: 'DELETE', value: '{DELETE}' },
    { name: 'DIVIDE', value: '{DIVIDE}' },
    { name: 'DOWN', value: '{DOWN}' },
    { name: 'END', value: '{END}' },
    { name: 'ENTER', value: '{ENTER}' },
    { name: 'ESC', value: '{ESC}' },
    { name: 'F1', value: '{F1}' },
    { name: 'F10', value: '{F10}' },
    { name: 'F11', value: '{F11}' },
    { name: 'F12', value: '{F12}' },
    { name: 'F13', value: '{F13}' },
    { name: 'F14', value: '{F14}' },
    { name: 'F15', value: '{F15}' },
    { name: 'F16', value: '{F16}' },
    { name: 'F2', value: '{F2}' },
    { name: 'F3', value: '{F3}' },
    { name: 'F4', value: '{F4}' },
    { name: 'F5', value: '{F5}' },
    { name: 'F6', value: '{F6}' },
    { name: 'F7', value: '{F7}' },
    { name: 'F8', value: '{F8}' },
    { name: 'F9', value: '{F9}' },
    { name: 'HOME', value: '{HOME}' },
    { name: 'INSERT', value: '{INSERT}' },
    { name: 'LEFT', value: '{LEFT}' },
    { name: 'META', value: '{META}' },
    { name: 'MINUS', value: '{MINUS}' },
    { name: 'MULTIPLY', value: '{MULTIPLY}' },
    { name: 'NUM0', value: '{NUM0}' },
    { name: 'NUM1', value: '{NUM1}' },
    { name: 'NUM2', value: '{NUM2}' },
    { name: 'NUM3', value: '{NUM3}' },
    { name: 'NUM4', value: '{NUM4}' },
    { name: 'NUM5', value: '{NUM5}' },
    { name: 'NUM6', value: '{NUM6}' },
    { name: 'NUM7', value: '{NUM7}' },
    { name: 'NUM8', value: '{NUM8}' },
    { name: 'NUM9', value: '{NUM9}' },
    { name: 'NUM_LOCK', value: '{NUM_LOCK}' },
    { name: 'PAGE_DOWN', value: '{PAGE_DOWN}' },
    { name: 'PAGE_UP', value: '{PAGE_UP}' },
    { name: 'PAUSE', value: '{PAUSE}' },
    { name: 'PRINTSCREEN', value: '{PRINTSCREEN}' },
    { name: 'RIGHT', value: '{RIGHT}' },
    { name: 'SCROLL_LOCK', value: '{SCROLL_LOCK}' },
    { name: 'SEPARATOR', value: '{SEPARATOR}' },
    { name: 'SHIFT', value: '{SHIFT}' },
    { name: 'SPACE', value: '{SPACE}' },
    { name: 'TAB', value: '{TAB}' },
    { name: 'UP', value: '{UP}' },
    { name: 'WIN', value: '{WIN}' }
]
